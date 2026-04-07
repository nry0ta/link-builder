document.addEventListener('DOMContentLoaded', () => {

    // --- DOM要素の取得 ---
    const resultsContainer = document.getElementById('results');
    const linkBuilderSection = document.getElementById('linkBuilderSection');
    const outputSection = document.getElementById('outputSection');

    const hotelNameInput = document.getElementById('hotelName');
    const rakutenUrlInput = document.getElementById('rakutenUrl');
    
    const generateBtn = document.getElementById('generateBtn');
    const outputCode = document.getElementById('outputCode');
    const copyBtn = document.getElementById('copyBtn');


    // --- イベントリスナーの設定 ---

    // 検索結果の「選択」ボタンクリック時（イベント移譲）
    resultsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('select-button')) {
            const card = e.target.closest('.result-card');
            selectHotel(card.dataset);
        }
    });
    
    // 「コードを生成」ボタンクリック時
    generateBtn.addEventListener('click', generateCode);
    
    // 「コードをコピー」ボタンクリック時
    copyBtn.addEventListener('click', copyCode);


    // --- 関数定義 ---
    
    /**
     * ホテルを選択し、リンクビルダーを表示
     * @param {Object} hotelData - data属性から取得したホテル情報
     */
    function selectHotel(hotelData) {
        hotelNameInput.value = hotelData.hotelName;
        rakutenUrlInput.value = hotelData.hotelUrl; // 注意：これはアフィリエイトリンクではありません
        
        linkBuilderSection.hidden = false;
        outputSection.hidden = true;
        
        // 選択されたらビルダーの位置までスクロール
        linkBuilderSection.scrollIntoView({ behavior: 'smooth' });
        
        // 楽天URLの入力欄にフォーカスを当てる
        rakutenUrlInput.focus();
        alert(`「${hotelData.hotelName}」を選択しました。\n楽天トラベルのURLは、ご自身のアフィリエイトリンクに変換して貼り付けてください。`);
    }

    /**
     * ブログ用のHTMLコードを生成
     */
    function generateCode() {
        const hotelName = document.getElementById('hotelName').value;
        const links = [
            { name: '楽天トラベル', url: document.getElementById('rakutenUrl').value },
            { name: 'じゃらんnet', url: document.getElementById('jalanUrl').value },
            { name: 'Booking.com', url: document.getElementById('bookingUrl').value },
            { name: 'IHG公式', url: document.getElementById('ihgUrl').value },

        ];
        
        const validLinks = links.filter(link => link.url.trim() !== '');

        if (validLinks.length === 0 || !hotelName) {
            alert('ホテル名と最低1つのURLを入力してください。');
            return;
        }
        
        const uniqueId = 'af-hotel-' + Math.random().toString(36).substr(2, 9);
        
        const generatedHtml = `
<div class="af-hotel-container" id="${uniqueId}">
    <style>
        /* ここにブログに貼り付けるボタンのCSSが入ります。デザインは適宜調整してください */
        #${uniqueId} .af-hotel-button { display: block; max-width: 400px; margin: 20px auto; padding: 15px; background: linear-gradient(135deg, #FF6B6B, #FFC107); color: white; text-align: center; font-size: 18px; font-weight: bold; border-radius: 8px; cursor: pointer; box-shadow: 0 4px 15px rgba(0,0,0,0.2); transition: all 0.3s ease; text-decoration: none; }
        #${uniqueId} .af-hotel-button:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.3); }
        /* モーダルウィンドウのスタイルなどもここに追加します */
    </style>
    <a href="${validLinks[0].url}" target="_blank" rel="noopener sponsored" class="af-hotel-button">${hotelName}の料金・予約をチェック</a>
    </div>
`;
        
        outputCode.value = generatedHtml.trim().replace(/^    /gm, ''); // インデントを削除
        outputSection.hidden = false;
        outputSection.scrollIntoView({ behavior: 'smooth' });
    }
    
    /**
     * 生成されたコードをクリップボードにコピー
     */
    function copyCode() {
        if (!outputCode.value) return;
        navigator.clipboard.writeText(outputCode.value).then(() => {
            alert('コードをクリップボードにコピーしました！');
        }).catch(err => {
            alert('コピーに失敗しました。');
            console.error('Copy failed:', err);
        });
    }
});