import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const MIN_LENGTH = 3;
const MAX_HITS = 5;       
const MAX_DISPLAY = 15;   


function Home() {
    const [category, setCategory] = useState<'domestic' | 'overseas' | 'activity' | 'product'>('domestic');
    const [searchEngine, setSearchEngine] = useState<'amazon' | 'rakuten'>('amazon');
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
            type: 'hotel',
            source: 'api',
            engine: 'rakuten'
        }));
        navigate('/builder');
    };

    const handleSelectProduct = (item: any) => {
        const placeholderUrl = 'https://placehold.co/120x120/cccccc/333333?text=No+Image';
        sessionStorage.setItem('selectedHotel', JSON.stringify({
            name: item.itemName,
            url: item.itemUrl,
            imageUrl: item.mediumImageUrls[0]?.imageUrl || placeholderUrl,
            price: item.itemPrice,
            keyword: keyword, // User's search query
            asin: item.itemCode,
            type: 'product',
            source: 'api',
            engine: item.engine || searchEngine
        }));
        navigate('/builder');
    };

    const handleSearch = async (isLoadMore: boolean = false) => {
        const query = (isLoadMore ? currentKeyword : keyword).trim();
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

        try {
            let newResults = [];

            if (category === 'product') {
                if (searchEngine === 'amazon') {
                    if (!settings.amazonClientId || !settings.amazonClientSecret) {
                        throw new Error('Amazon APIの設定が不足しています。');
                    }
                    const response = await fetch('/api/amazon-search', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            keyword: query,
                            clientId: settings.amazonClientId,
                            clientSecret: settings.amazonClientSecret,
                            partnerTag: settings.amazonTrackingId?.split(',')[0].trim() || 'default-22'
                        })
                    });
                    const data = await response.json() as any;
                    if (!response.ok) throw new Error(data.details || 'Amazon API Error');

                    const items = data.searchResult?.items || data.SearchResult?.Items;
                    if (!items || items.length === 0) {
                        if (!isLoadMore) setMessage('商品が見つかりませんでした。');
                        setHasMore(false);
                        return;
                    }

                    newResults = items.map((item: any) => {
                        const priceObj = item.offersV2?.listings?.[0]?.price || item.Offers?.Listings?.[0]?.Price || null;
                        const price = priceObj?.money?.displayAmount || priceObj?.DisplayAmount || priceObj?.amount || '価格情報なし';
                        return {
                            itemCode: item.asin || item.ASIN,
                            itemName: item.itemInfo?.title?.displayValue || item.ItemInfo?.Title?.DisplayValue || '名称未設定',
                            itemUrl: item.detailPageURL || item.DetailPageURL,
                            itemPrice: price,
                            mediumImageUrls: [{ imageUrl: item.images?.primary?.medium?.url || item.Images?.Primary?.Medium?.URL }],
                            engine: 'amazon'
                        };
                    });
                } else {
                    // Rakuten Search
                    if (!settings.rakutenAppId) throw new Error('楽天AppIDが設定されていません。');
                    const url = `https://app.rakuten.co.jp/services/api/IchibaItem/Search/20170706?format=json&keyword=${encodeURIComponent(query)}&applicationId=${settings.rakutenAppId}&hits=${MAX_HITS}&page=${targetPage}`;
                    const response = await fetch(url);
                    const data = await response.json();
                    if (data.error) throw new Error(data.error_description || '楽天APIエラー');
                    if (!data.Items || data.Items.length === 0) {
                        if (!isLoadMore) setMessage('商品が見つかりませんでした。');
                        setHasMore(false);
                        return;
                    }
                    newResults = data.Items.map((item: any) => ({
                        itemCode: item.Item.itemCode,
                        itemName: item.Item.itemName,
                        itemUrl: item.Item.itemUrl,
                        itemPrice: item.Item.itemPrice ? `${item.Item.itemPrice.toLocaleString()}円` : '価格情報なし',
                        mediumImageUrls: [{ imageUrl: item.Item.mediumImageUrls[0]?.imageUrl }],
                        engine: 'rakuten'
                    }));
                }
            } else {
                // Domestic Hotel / Activity
                const appId = settings.rakutenAppId;
                if (!appId) throw new Error('楽天AppIDが未設定です。');
                
                const travelParams = new URLSearchParams({
                    format: 'json',
                    keyword: query,
                    page: targetPage.toString(),
                    hits: MAX_HITS.toString(),
                    applicationId: appId
                });
                const travelUrl = `https://app.rakuten.co.jp/services/api/Travel/KeywordHotelSearch/20170426?${travelParams.toString()}`;
                const response = await fetch(travelUrl);
                const data = await response.json();
                
                if (!response.ok || data.error) throw new Error(data.error_description || '楽天APIエラー');
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
            setMessage(`エラー: ${error.message}`);
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
                        {category === 'domestic' ? '国内ホテル・旅館を検索' : '商品を検索'}
                    </h2>

                    {category === 'product' && (
                        <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>
                                <input type="radio" checked={searchEngine === 'amazon'} onChange={() => setSearchEngine('amazon')} />
                                Amazonで検索
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>
                                <input type="radio" checked={searchEngine === 'rakuten'} onChange={() => setSearchEngine('rakuten')} />
                                楽天で検索
                            </label>
                        </div>
                    )}

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
                                onClick={() => { 
                                    const placeholder = { 
                                        name: '', url: '', imageUrl: '', 
                                        type: category === 'product' ? 'product' : 'hotel',
                                        source: 'manual',
                                        engine: searchEngine 
                                    };
                                    sessionStorage.setItem('selectedHotel', JSON.stringify(placeholder)); 
                                    navigate('/builder'); 
                                }}
                            >
                                手動作成画面へ進む
                            </button>
                        </div>
                    )}

                    <div style={{ textAlign: 'center', marginTop: '12px', marginBottom: '20px' }}>
                        <a href="#" style={{ color: '#0066cc', textDecoration: 'underline', fontSize: '0.95rem' }} onClick={(e) => { 
                            e.preventDefault(); 
                            const placeholder = { 
                                name: '', url: '', imageUrl: '', 
                                type: category === 'product' ? 'product' : 'hotel',
                                source: 'manual',
                                engine: searchEngine 
                            };
                            sessionStorage.setItem('selectedHotel', JSON.stringify(placeholder)); 
                            navigate('/builder'); 
                        }}>
                            検索できない場合・手動で直接作成したい場合はこちら
                        </a>
                    </div>

                    <div id="results">
                        {results.map((item: any, index: number) => {
                            if (index >= MAX_DISPLAY) return null;
                            const placeholderUrl = 'https://placehold.co/120x120/cccccc/333333?text=No+Image';
                            
                            if (category === 'product') {
                                const imageUrl = (item.mediumImageUrls && item.mediumImageUrls[0]?.imageUrl) || placeholderUrl;
                                return (
                                    <div key={item.itemCode || index} className="result-card">
                                        <img src={imageUrl} alt={item.itemName} className="result-image" onError={(e: any) => { e.target.onerror = null; e.target.src = placeholderUrl; }} />
                                        <div className="result-info">
                                            <h3 style={{ fontSize: '1rem', lineHeight: '1.4', marginBottom: '8px' }}>{item.itemName}</h3>
                                            <p style={{ color: '#d9534f', fontWeight: 'bold', fontSize: '1.1rem' }}>{item.itemPrice}</p>
                                            <button className="select-button" onClick={() => handleSelectProduct(item)} style={{ marginTop: '10px' }}>この商品を選択</button>
                                        </div>
                                    </div>
                                );
                            } else {
                                const imageUrl = item.hotelImageUrl || placeholderUrl;
                                return (
                                    <div key={item.hotelNo || index} className="result-card">
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

            {/* ===== 海外ホテル / アクティビティ ===== */}
            {(category === 'overseas' || category === 'activity') && (
                <div style={{ textAlign: 'center', padding: '50px 20px', background: '#f8f9fa', borderRadius: '12px', border: '1px dashed #ced4da' }}>
                    <p style={{ color: '#6c757d', marginBottom: '20px', fontWeight: '500' }}>
                        現在、直接リンク作成画面から画像URLや任意のアフィリエイトURLを入力して作成可能です！
                    </p>
                    <button
                        style={{ padding: '12px 30px', background: '#28a745', color: 'white', border: 'none', borderRadius: '50px', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 4px 10px rgba(40, 167, 69, 0.3)' }}
                        onClick={() => { 
                            sessionStorage.setItem('selectedHotel', JSON.stringify({ name: '', url: '', imageUrl: '', type: category, source: 'manual' })); 
                            navigate('/builder'); 
                        }}
                    >
                        手動作成画面へ進む
                    </button>
                </div>
            )}
        </div>
    );
}

export default Home;
