import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const MIN_LENGTH = 3;
const MAX_HITS = 5;       
const MAX_DISPLAY = 15;   

function Home() {
    const [keyword, setKeyword] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [realTimeMessage, setRealTimeMessage] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [currentKeyword, setCurrentKeyword] = useState('');
    const [hasMore, setHasMore] = useState(false);
    
    const navigate = useNavigate();

    const handleSearch = async (isLoadMore = false) => {
        const query = keyword.trim();
        let targetPage = isLoadMore ? currentPage + 1 : 1;
        
        if (!isLoadMore) {
            setResults([]);
            setMessage('');
            setRealTimeMessage('');
            setCurrentKeyword(query);
            setCurrentPage(1);

            if (!query || query.length < MIN_LENGTH) {
                if (query.length >= 1) {
                    setRealTimeMessage(`${MIN_LENGTH}文字以上入力してください`);
                }
                return;
            }
            setMessage('検索中...');
        } else {
            setCurrentPage(targetPage);
        }

        setLoading(true);

        const settings = JSON.parse(localStorage.getItem('linkBuilderSettings')) || {};
        const appId = settings.rakutenAppId;

        if (!appId) {
            setMessage('');
            setRealTimeMessage('エラー: 楽天アプリケーションID(AppID)が未設定です。設定画面から登録してください。');
            setLoading(false);
            return;
        }

        const params = new URLSearchParams({
            format: 'json',
            keyword: isLoadMore ? currentKeyword : query,
            page: targetPage,
            hits: MAX_HITS,
            applicationId: appId
        });

        const requestUrl = `https://app.rakuten.co.jp/services/api/Travel/KeywordHotelSearch/20170426?${params.toString()}`;

        try {
            const response = await fetch(requestUrl);
            const data = await response.json().catch(() => null);
            
            if (!response.ok) {
                if (data && data.error) {
                    if (data.error === 'not_found') {
                        if (!isLoadMore) setMessage('該当するホテルが見つかりませんでした。');
                        setHasMore(false);
                        return;
                    }
                    if (data.error === 'wrong_parameter' && typeof data.error_description === 'string' && data.error_description.includes('applicationId')) {
                        throw new Error('楽天アプリケーションID(AppID)が無効です。設定を確認してください。');
                    }
                    throw new Error(data.error_description || data.error);
                }
                throw new Error(`サーバーエラー: ${response.status}`);
            }
            
            if (data.error) {
                throw new Error(data.error_description || data.error || 'エラーが発生しました');
            }
            
            const newHotels = data.hotels.map(h => h.hotel[0].hotelBasicInfo);
            const updatedResults = isLoadMore ? [...results, ...newHotels] : newHotels;
            setResults(updatedResults);
            
            setMessage('');
            
            if (updatedResults.length >= MAX_DISPLAY) {
                setHasMore(false);
            } else if (newHotels.length < MAX_HITS) {
                setHasMore(false);
            } else {
                setHasMore(true);
            }

        } catch (error) {
            console.error('Search failed:', error);
            setMessage(`検索に失敗しました: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectHotel = (hotel) => {
        const fullAddress = `${hotel.address1 || ''}${hotel.address2 || ''}`;
        const placeholderUrl = 'https://placehold.co/120x120/cccccc/333333?text=No+Image';
        
        const hotelData = {
            name: hotel.hotelName,
            url: hotel.hotelInformationUrl,
            imageUrl: hotel.hotelImageUrl || placeholderUrl,
            address: fullAddress,
            keyword: currentKeyword
        };
        sessionStorage.setItem('selectedHotel', JSON.stringify(hotelData));
        navigate('/builder');
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSearch(false);
        }
    };

    return (
        <div className="container">
            <h1>ホテル・旅館を検索</h1>
            <p>キーワードを入力して、宿泊先を検索しましょう。</p>

            <div className="search-form">
                <input 
                    type="text" 
                    id="searchInput" 
                    placeholder="ホテル名、エリア、キーワードなど"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={loading}
                />
                <button id="searchButton" onClick={() => handleSearch(false)} disabled={loading}>
                    検索
                </button>
            </div>
            
            {realTimeMessage && <p className="message" style={{ color: '#d9534f' }}>{realTimeMessage}</p>}
            {message && <p className="message">{message}</p>}

            <div id="results">
                {results.map((hotel, index) => {
                    if (index >= MAX_DISPLAY) return null;
                    const fullAddress = `${hotel.address1 || ''}${hotel.address2 || ''}`;
                    const placeholderUrl = 'https://placehold.co/120x120/cccccc/333333?text=No+Image';
                    const imageUrl = hotel.hotelImageUrl || placeholderUrl;

                    return (
                        <div key={hotel.hotelNo} className="result-card">
                            <img src={imageUrl} alt={hotel.hotelName} className="result-image" onError={(e) => { e.target.onerror = null; e.target.src = placeholderUrl; }} />
                            <div className="result-info">
                                <h3>{hotel.hotelName}</h3>
                                <p>{fullAddress}</p>
                                <button className="select-button" onClick={() => handleSelectHotel(hotel)}>
                                    このホテルを選択
                                </button>
                            </div>
                        </div>
                    );
                })}
                
                {results.length > 0 && !hasMore && results.length >= MAX_DISPLAY && (
                    <p className="message load-more-message">これ以上表示することはできません。<br/>もう少し検索を絞ってみてください</p>
                )}
                {results.length > 0 && !hasMore && results.length < MAX_DISPLAY && (
                    <p className="message load-more-message">これで全てです。お疲れ様でした！<br/>もし見つからない場合は他の単語で検索してみてください</p>
                )}
                {results.length > 0 && hasMore && (
                    <p id="loadMoreButton" className="message load-more-link" onClick={() => handleSearch(true)}>もっと読み込む</p>
                )}
            </div>
        </div>
    );
}

export default Home;
