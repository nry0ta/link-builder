document.addEventListener('DOMContentLoaded', () => {
    // --- DOM要素の取得 ---
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const resultsContainer = document.getElementById('results');
    const realTimeMessage = document.getElementById('realTimeMessage'); 
    const MIN_LENGTH = 3;
    
    // --- 状態管理用の変数 ---
    let currentKeyword = '';
    const MAX_HITS = 5;       
    const MAX_DISPLAY = 15;   
    let currentHits = 0;      
    let currentPage = 1;      

    // --- イベントリスナーの設定 ---
    searchButton.addEventListener('click', () => handleSearch(false)); 
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleSearch(false);
    });
    // リアルタイム検索を無効化する場合は、以下のリスナーをコメントアウトまたは削除します。
    searchInput.addEventListener('input', () => handleSearch(false));

    /**
     * すべてのメッセージ表示をクリアする
     */
    function clearAllMessages() {
        const oldMessages = resultsContainer.querySelectorAll('.load-more-message, .load-more-link');
        oldMessages.forEach(msg => msg.remove());
    }

    /**
     * 検索処理のメイン関数
     * @param {boolean} isLoadMore - 「もっと読み込む」からの呼び出しかどうか
     */
    async function handleSearch(isLoadMore) {
        searchButton.disabled = true;
        const keyword = searchInput.value.trim();
        
        function resetRealTimeMessage() {
             if(realTimeMessage) realTimeMessage.textContent = '';
        }

        // 初回検索時の初期化処理
        if (!isLoadMore) { 
            clearAllMessages();
            resultsContainer.innerHTML = ''; 
            resetRealTimeMessage();

            if (!keyword || keyword.length < MIN_LENGTH) {
                if (keyword.length >= 1) { 
                    realTimeMessage.textContent = `${MIN_LENGTH}文字以上入力してください`;
                }
                resultsContainer.innerHTML = '';
                searchButton.disabled = false;
                return; 
            }
            resetRealTimeMessage();
            currentKeyword = keyword;
            currentHits = 0;
            currentPage = 1;
            resultsContainer.innerHTML = '<p class="message">検索中...</p>';
        }

        // ★★★ ここからがAPI呼び出しの核心部分です ★★★
        const settings = JSON.parse(localStorage.getItem('linkBuilderSettings')) || {};
        const appId = settings.rakutenAppId;
        
        if (!appId) {
            resultsContainer.innerHTML = '<p class="message" style="color: #d9534f;">エラー: 楽天アプリケーションID(AppID)が未設定です。<a href="setting.html">設定画面</a>から登録してください。</p>';
            searchButton.disabled = false;
            return;
        }

        const params = new URLSearchParams({
            format: 'json',
            keyword: currentKeyword,
            page: currentPage,
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
                        if (isLoadMore) appendResults([]); else displayResults([]);
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
            
            if (isLoadMore) {
                appendResults(data.hotels);
            } else {
                displayResults(data.hotels);
            }
        } catch (error) {
            console.error('Search failed:', error);
            resultsContainer.innerHTML = `<p class="message">検索に失敗しました。<br>${error.message}</p>`;
        } finally {
            searchButton.disabled = false;
        }
        // ★★★ ここまでがAPI呼び出しの核心部分です ★★★
    }

    /**
     * 検索結果を画面に表示する（初回検索時）
     */
    function displayResults(hotels) {
        resultsContainer.innerHTML = '';
        currentHits = 0;
        if (!hotels || hotels.length === 0) {
            resultsContainer.innerHTML = '<p class="message">該当するホテルが見つかりませんでした。</p>';
            return;
        }
        appendResults(hotels);
    }

    /**
     * 取得した検索結果を画面に追加する
     */
    function appendResults(hotels) {
        const loadMoreButton = document.getElementById('loadMoreButton');
        if (loadMoreButton) loadMoreButton.remove();

        if (!hotels || hotels.length === 0) {
            updateLoadMoreButton(0); 
            return;
        }

        hotels.forEach(hotelData => {
            if (currentHits >= MAX_DISPLAY) return;

            const hotel = hotelData.hotel[0].hotelBasicInfo;
            const card = document.createElement('div');
            card.className = 'result-card';
            
            const fullAddress = `${hotel.address1 || ''}${hotel.address2 || ''}`;

            card.dataset.hotelName = hotel.hotelName;
            card.dataset.hotelUrl = hotel.hotelInformationUrl;
            card.dataset.imageUrl = hotel.hotelImageUrl;
            card.dataset.hotelAddress = fullAddress;
            
            const placeholderUrl = 'https://placehold.co/120x120/cccccc/333333?text=No+Image';
            const imageUrl = hotel.hotelImageUrl || placeholderUrl;

            card.innerHTML = `
                <img src="${imageUrl}" alt="${hotel.hotelName}" class="result-image" onerror="this.onerror=null; this.src='${placeholderUrl}';">
                <div class="result-info">
                    <h3>${hotel.hotelName}</h3>
                    <p>${fullAddress}</p>
                    <button class="select-button">このホテルを選択</button>
                </div>
            `;
            resultsContainer.appendChild(card);
            currentHits++; 
        });
        updateLoadMoreButton(hotels.length);
    }

    /**
     * 「もっと読み込む」ボタンの状態を更新する
     */
    function updateLoadMoreButton(lastHitCount) {
        const existingMessages = resultsContainer.querySelectorAll('.load-more-message, .load-more-link');
        existingMessages.forEach(msg => msg.remove());

        if (currentHits >= MAX_DISPLAY) {
            resultsContainer.insertAdjacentHTML('beforeend', '<p class="message load-more-message">これ以上表示することはできません。<br>もう少し検索を絞ってみてください</p>');
            return;
        }
        if (lastHitCount < MAX_HITS) {
            resultsContainer.insertAdjacentHTML('beforeend', '<p class="message load-more-message">これで全てです。お疲れ様でした！<br>もし見つからない場合は他の単語で検索してみてください</p>');
            return;
        }
        resultsContainer.insertAdjacentHTML('beforeend', '<p id="loadMoreButton" class="message load-more-link">もっと読み込む</p>');
    }

    /**
     * 結果カードのクリックイベントを処理
     */
    resultsContainer.addEventListener('click', (e) => {
        // 「このホテルを選択」ボタンがクリックされた場合
        if (e.target.classList.contains('select-button')) {
            const card = e.target.closest('.result-card');
            
            const hotelData = {
                name: card.dataset.hotelName,
                url: card.dataset.hotelUrl,
                imageUrl: card.dataset.imageUrl,
                address: card.dataset.hotelAddress || '', 
                keyword: currentKeyword 
            };
            sessionStorage.setItem('selectedHotel', JSON.stringify(hotelData));
            window.location.href = 'link_builder.html';
        }
        
        // 「もっと読み込む」リンクがクリックされた場合
        if (e.target.id === 'loadMoreButton') {
            currentPage++;
            handleSearch(true);
        }
    });
});
