import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const MIN_LENGTH = 3;
const MAX_HITS = 5;       
const MAX_DISPLAY = 15;   

const OVERSEAS_SITES = [
    { name: 'Agoda', key: 'agoda', color: '#1A74E2', getUrl: (kw: string) => `https://www.agoda.com/ja-jp/search?textToSearch=${encodeURIComponent(kw)}` },
    { name: 'Booking.com', key: 'booking', color: '#003580', getUrl: (kw: string) => `https://www.booking.com/search.html?lang=ja&ss=${encodeURIComponent(kw)}` },
    { name: 'Hotels.com', key: 'hotelscom', color: '#d32f2f', getUrl: (kw: string) => `https://jp.hotels.com/search.do?q-destination=${encodeURIComponent(kw)}` },
    { name: 'Expedia', key: 'expedia', color: '#ffcc00', getUrl: (kw: string) => `https://www.expedia.co.jp/Hotel-Search?destination=${encodeURIComponent(kw)}` },
];

function Home() {
    const [category, setCategory] = useState<'domestic' | 'overseas' | 'activity' | 'product'>('domestic');
    const [keyword, setKeyword] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [realTimeMessage, setRealTimeMessage] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [currentKeyword, setCurrentKeyword] = useState('');
    const [hasMore, setHasMore] = useState(false);


    const navigate = useNavigate();

    const handleSelectHotel = (hotel: any) => {
        const placeholderUrl = 'https://placehold.co/120x120/cccccc/333333?text=No+Image';
        sessionStorage.setItem('selectedHotel', JSON.stringify({
            name: hotel.hotelName,
            url: hotel.hotelInformationUrl,
            imageUrl: hotel.hotelImageUrl || placeholderUrl,
            address: `${hotel.address1 || ''}${hotel.address2 || ''}`,
            keyword: currentKeyword,
            type: 'hotel'
        }));
        navigate('/builder');
    };

    const handleSelectProduct = (item: any) => {
        const placeholderUrl = 'https://placehold.co/120x120/cccccc/333333?text=No+Image';
        sessionStorage.setItem('selectedHotel', JSON.stringify({ // Use same key for simplicity or separate it? Let's use same for now
            name: item.itemName,
            url: item.itemUrl,
            imageUrl: item.mediumImageUrls[0]?.imageUrl || placeholderUrl,
            price: item.itemPrice,
            keyword: item.itemName, // Use name as keyword for search links
            type: 'product'
        }));
        navigate('/builder');
    };

    const handleSearch = async (isLoadMore: boolean = false) => {
        const query = keyword.trim();
        let targetPage = isLoadMore ? currentPage + 1 : 1;

        if (!isLoadMore) {
            setResults([]);
            setMessage('');
            setRealTimeMessage('');
            setCurrentKeyword(query);
            setCurrentPage(1);

            if (!query || query.length < MIN_LENGTH) {
                if (query.length >= 1) setRealTimeMessage(`${MIN_LENGTH}文字以上入力してください`);
                return;
            }
            setMessage('検索中...');
        } else {
            setCurrentPage(targetPage);
        }

        setLoading(true);
        const settings = JSON.parse(localStorage.getItem('linkBuilderSettings') || '{}');
        const appId = settings.rakutenAppId;

        if (category !== 'product' && !appId) {
            setMessage('');
            setRealTimeMessage('エラー: 楽天アプリケーションID(AppID)が未設定です。設定画面から登録してください。');
            setLoading(false);
            return;
        }

        if (category === 'product' && (!settings.amazonAccessKey || !settings.amazonSecretKey || !settings.amazonTrackingId)) {
            setMessage('');
            setRealTimeMessage('エラー: Amazon PA-API アクセスキー・シークレットキー・トラッキングIDが未設定です。設定画面から登録してください。');
            setLoading(false);
            return;
        }

        // Domestic Hotel Search params
        const travelParams = new URLSearchParams({
            format: 'json',
            keyword: isLoadMore ? currentKeyword : query,
            page: targetPage.toString(),
            hits: MAX_HITS.toString(),
            applicationId: appId
        });

        try {
            let response;
            let data;

            if (category === 'product') {
                response = await fetch('/api/amazon-search', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        keyword: isLoadMore ? currentKeyword : query,
                        accessKey: settings.amazonAccessKey,
                        secretKey: settings.amazonSecretKey,
                        partnerTag: settings.amazonTrackingId
                    })
                });
                data = await response.json().catch(() => null);
            } else {
                response = await fetch(`https://app.rakuten.co.jp/services/api/Travel/KeywordHotelSearch/20170426?${travelParams.toString()}`);
                data = await response.json().catch(() => null);
            }

            if (!response.ok) {
                if (data?.error) {
                    if (data.error === 'not_found' || data.error === 'NotFound') { if (!isLoadMore) setMessage('該当する結果は見つかりませんでした。'); setHasMore(false); return; }
                    throw new Error(data.error_description || data.error || data.message || 'エラーが発生しました');
                }
                if (data?.Errors) {
                    throw new Error(data.Errors[0]?.Message || 'Amazon API Error');
                }
                throw new Error(`サーバーエラー: ${response.status}`);
            }

            let newResults = [];
            if (category === 'product') {
                if (!data.SearchResult || !data.SearchResult.Items || data.SearchResult.Items.length === 0) {
                     if (!isLoadMore) setMessage('該当する商品が見つかりませんでした。');
                     setHasMore(false);
                     return;
                }
                // Map Amazon PA-API response to our common format
                newResults = data.SearchResult.Items.map((item: any) => {
                    const price = item.Offers?.Listings?.[0]?.Price?.Amount || null;
                    return {
                        itemCode: item.ASIN,
                        itemName: item.ItemInfo?.Title?.DisplayValue || 'No Title',
                        itemUrl: item.DetailPageURL,
                        itemPrice: price,
                        mediumImageUrls: [{ imageUrl: item.Images?.Primary?.Medium?.URL }]
                    };
                });
            } else {
                if (!data.hotels) {
                    if (!isLoadMore) setMessage('該当するホテルが見つかりませんでした。');
                    setHasMore(false);
                    return;
                }
                newResults = data.hotels.map((h: any) => h.hotel[0].hotelBasicInfo);
            }

            const updatedResults = isLoadMore ? [...results, ...newResults] : newResults;
            setResults(updatedResults);
            setMessage('');
            setHasMore(updatedResults.length < MAX_DISPLAY && newResults.length >= MAX_HITS);
        } catch (error: any) {
            setMessage(`検索に失敗しました: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };


    const tabStyle = (active: boolean): React.CSSProperties => ({
        flex: '1 1 100px', padding: '12px 10px', borderRadius: '8px',
        border: '1px solid #ced4da',
        background: active ? '#007bff' : '#f8f9fa',
        color: active ? '#fff' : '#495057',
        fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s'
    });

    return (
        <div className="container">
            <h1 style={{ marginBottom: '5px' }}>リンクを作成</h1>
            <p style={{ marginBottom: '20px' }}>作成したいリンクのカテゴリを選択してください。</p>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', flexWrap: 'wrap' }}>
                <button style={tabStyle(category === 'domestic')} onClick={() => { setCategory('domestic'); setResults([]); setMessage(''); setKeyword(''); }}>国内のホテル・旅館</button>
                <button style={tabStyle(category === 'product')} onClick={() => { setCategory('product'); setResults([]); setMessage(''); setKeyword(''); }}>商品紹介 (Amazon・楽天・Yahoo)</button>
                <button style={tabStyle(category === 'overseas')} onClick={() => { setCategory('overseas'); setResults([]); setMessage(''); setKeyword(''); }}>海外のホテル</button>
                <button style={tabStyle(category === 'activity')} onClick={() => { setCategory('activity'); setResults([]); setMessage(''); setKeyword(''); }}>アクティビティ</button>
            </div>

            {/* ===== 国内ホテル or 商品検索 ===== */}
            {(category === 'domestic' || category === 'product') && (
                <>
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '10px' }}>
                        {category === 'domestic' ? '国内ホテル・旅館を検索' : '商品を検索 (Amazon・楽天・Yahoo)'}
                    </h2>
                    <div className="search-form">
                        <input type="text" id="searchInput" placeholder={category === 'domestic' ? "ホテル名、エリア、キーワードなど" : "商品名、型番、キーワードなど"}
                            value={keyword} onChange={(e) => setKeyword(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(false); }} disabled={loading} />
                        <button id="searchButton" onClick={() => handleSearch(false)} disabled={loading}>検索</button>
                    </div>

                    {realTimeMessage && <p className="message" style={{ color: '#d9534f' }}>{realTimeMessage}</p>}
                    {message && <p className="message">{message}</p>}
                    {message.includes('見つかりませんでした') && (
                        <div style={{ marginTop: '12px' }}>
                            <button
                                style={{ padding: '10px 24px', background: '#28a745', color: 'white', border: 'none', borderRadius: '50px', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 4px 10px rgba(40,167,69,0.3)' }}
                                onClick={() => { sessionStorage.removeItem('selectedHotel'); navigate('/builder'); }}
                            >
                                手動作成画面へ進む
                            </button>
                        </div>
                    )}

                    <div id="results">
                        {results.map((item: any, index: number) => {
                            if (index >= MAX_DISPLAY) return null;
                            const placeholderUrl = 'https://placehold.co/120x120/cccccc/333333?text=No+Image';
                            
                            if (category === 'product') {
                                const imageUrl = item.mediumImageUrls[0]?.imageUrl || placeholderUrl;
                                return (
                                    <div key={item.itemCode} className="result-card">
                                        <img src={imageUrl} alt={item.itemName} className="result-image" onError={(e: any) => { e.target.onerror = null; e.target.src = placeholderUrl; }} />
                                        <div className="result-info">
                                            <h3 style={{ fontSize: '1rem', lineHeight: '1.4', marginBottom: '8px' }}>{item.itemName}</h3>
                                            {item.itemPrice && <p style={{ color: '#d9534f', fontWeight: 'bold', fontSize: '1.1rem' }}>{item.itemPrice.toLocaleString()}円</p>}
                                            <button className="select-button" onClick={() => handleSelectProduct(item)} style={{ marginTop: '10px' }}>この商品を選択</button>
                                        </div>
                                    </div>
                                );
                            } else {
                                const imageUrl = item.hotelImageUrl || placeholderUrl;
                                return (
                                    <div key={item.hotelNo} className="result-card">
                                        <img src={imageUrl} alt={item.hotelName} className="result-image" onError={(e: any) => { e.target.onerror = null; e.target.src = placeholderUrl; }} />
                                        <div className="result-info">
                                            <h3>{item.hotelName}</h3>
                                            <p>{`${item.address1 || ''}${item.address2 || ''}`}</p>
                                            <button className="select-button" onClick={() => handleSelectHotel(item)}>このホテルを選択</button>
                                        </div>
                                    </div>
                                );
                            }
                        })}
                        {results.length > 0 && !hasMore && results.length >= MAX_DISPLAY && <p className="message load-more-message">これ以上表示することはできません。<br/>もう少し検索を絞ってみてください</p>}
                        {results.length > 0 && !hasMore && results.length < MAX_DISPLAY && <p className="message load-more-message">これで全てです。お疲れ様でした！<br/>もし見つからない場合は他の単語で検索してみてください</p>}
                        {results.length > 0 && hasMore && <p id="loadMoreButton" className="message load-more-link" onClick={() => handleSearch(true)}>もっと読み込む</p>}
                    </div>
                </>
            )}

            {/* ===== 海外ホテル ===== */}
            {category === 'overseas' && (
                <div style={{ textAlign: 'center', padding: '50px 20px', background: '#f8f9fa', borderRadius: '12px', border: '1px dashed #ced4da' }}>
                    <p style={{ color: '#6c757d', marginBottom: '20px', fontWeight: '500' }}>
                        海外ホテルの検索機能は現在準備中です...<br/>
                        直接リンク作成画面へ進み、ご自身で画像URLや任意のアフィリエイトURLを入力してボタンを作ることができます！
                    </p>
                    <button
                        style={{ padding: '12px 30px', background: '#28a745', color: 'white', border: 'none', borderRadius: '50px', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 4px 10px rgba(40, 167, 69, 0.3)' }}
                        onClick={() => { sessionStorage.removeItem('selectedHotel'); navigate('/builder'); }}
                    >
                        手動作成画面へ進む
                    </button>
                </div>
            )}


            {/* ===== アクティビティ ===== */}
            {category === 'activity' && (
                <div style={{ textAlign: 'center', padding: '50px 20px', background: '#f8f9fa', borderRadius: '12px', border: '1px dashed #ced4da' }}>
                    <p style={{ color: '#6c757d', marginBottom: '20px', fontWeight: '500' }}>
                        アクティビティの検索機能は現在準備中です...<br/>
                        直接リンク作成画面へ進み、ご自身で画像URLや任意のアフィリエイトURLを入力してボタンを作ることができます！
                    </p>
                    <button
                        style={{ padding: '12px 30px', background: '#28a745', color: 'white', border: 'none', borderRadius: '50px', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 4px 10px rgba(40, 167, 69, 0.3)' }}
                        onClick={() => { sessionStorage.removeItem('selectedHotel'); navigate('/builder'); }}
                    >
                        手動作成画面へ進む
                    </button>
                </div>
            )}
        </div>
    );
}

export default Home;
