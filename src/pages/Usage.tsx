import { useState } from 'react';

const affiliateCss = `/* ==========================================================================
   Link Builder - Distributable Stylesheet
   ========================================================================== */

/* --- 中央揃え用のラッパー --- */
.link-builder-wrapper {
    text-align: center;
}

/* --- 単一ジャンプモード --- */
.af-single-jump-btn { 
    display: inline-block; 
    padding: 12px 24px; 
    color: white !important; 
    text-decoration: none; 
    border-radius: 50px; 
    font-weight: bold; 
    box-shadow: 0 4px 10px rgba(0,0,0,0.1);
    transition: all 0.3s ease;
}

/* --- モーダルモード --- */
.af-hotel-button { 
    display: block; 
    width: 100%; 
    max-width: 500px; 
    margin: 20px auto; 
    padding: 15px; 
    background: linear-gradient(135deg, #FF6B6B, #FFC107); 
    color: white !important; 
    text-align: center; 
    font-size: 18px; 
    font-weight: bold; 
    border-radius: 8px; 
    cursor: pointer; 
    box-shadow: 0 4px 15px rgba(0,0,0,0.2); 
    transition: all 0.3s ease; 
    text-decoration:none; 
}
.af-modal-backdrop { 
    position: fixed; 
    top: 0; left: 0; 
    width: 100%; 
    height: 100%; 
    background-color: rgba(0,0,0,0.6); 
    z-index: 1000; 
    display: none; 
    justify-content: center; 
    align-items: center; 
}
.af-modal-content { background-color: #fff; padding: 20px 30px; border-radius: 8px; width: 90%; max-width: 500px; }
.af-modal-header { font-size: 20px; font-weight: bold; margin-bottom: 15px; border-bottom: 1px solid #eee; padding-bottom: 10px; }
.af-link-list { list-style: none; padding: 0; margin: 0; }
.af-link-item a { display: block; padding: 12px 10px; text-decoration: none; color: #333; border-radius: 5px; transition: background-color 0.2s; margin-bottom: 8px; border: 1px solid #ddd; font-weight: bold; }

/* --- 複数ボタンモード --- */
.af-multi-container {
    border: 1px solid #e1e7ec; 
    border-radius: 12px; 
    max-width: 600px; 
    margin: 20px auto; 
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    box-shadow: 0 4px 20px rgba(0,0,0,0.06); 
    overflow: hidden;
    display: flex;
    flex-wrap: wrap;
    background-color: #fff;
    padding: 20px;
    gap: 20px;
}
.af-image-wrapper {
    flex: 1 1 200px;
    max-width: 250px;
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0 auto;
}
.af-multi-container img { 
    width: 100%; 
    height: auto; 
    border-radius: 8px;
    object-fit: cover;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}
.af-info-wrapper {
    flex: 2 1 280px;
    display: block;
    min-width: 0;
}
.af-hotel-name {
    font-size: 1.15rem; 
    font-weight: 700;
    margin-bottom: 8px;
    color: #1e293b;
    line-height: 1.4;
    display: -webkit-box;
    line-clamp: 1;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
}
.af-hotel-address {
    font-size: 0.85rem; 
    color: #64748b; 
    margin: 0 0 16px; 
    line-height: 1.4;
}
.af-links-wrapper { 
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    margin-top: 16px;
}
.af-emphasize-wrapper {
    grid-column: span 2;
    display: flex;
    flex-direction: column;
}
.af-emphasize-badge {
    text-align: center;
    color: #e11d48;
    font-size: 0.8rem;
    font-weight: 700;
    margin-bottom: 2px;
}
.af-emphasize-wrapper .af-multi-btn {
    width: 100%;
    margin-bottom: 0;
    box-sizing: border-box;
}
.af-multi-btn { 
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 10px 8px; 
    color: white !important; 
    text-decoration: none; 
    border-radius: 6px; 
    text-align: center; 
    font-size: 0.85rem;
    font-weight: bold; 
    transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

@media (max-width: 520px) {
    .af-multi-container {
        flex-direction: column;
        padding: 15px;
    }
    .af-image-wrapper, .af-info-wrapper {
        flex: none;
    }
    .af-image-wrapper {
        max-width: 100%;
        margin-bottom: 5px;
    }
    .af-hotel-name {
        font-size: 1.1rem;
    }
}

/* --- ホバーエフェクト --- */
.af-single-jump-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 15px rgba(0,0,0,0.2); }
.af-hotel-button:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.3); }
.af-link-item a:hover { background-color: #f5f5f5; }
.af-multi-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 6px rgba(0,0,0,0.15); filter: brightness(105%); }

/* --- ブランドカラー定義 --- */
.btn-rakuten { background-color: #28a745; }
.btn-jalan { background-color: #ff9900; }
.btn-ikkyu { background-color: #b38d4a; }
.btn-yahoo { background-color: #FF0033; }
.btn-booking { background-color: #003580; }
.btn-hotelscom { background-color: #d32f2f; }
.btn-ihg { background-color: #005c64; }
.btn-tripcom { background-color: #3273f6; }
.btn-agoda { background-color: #1A74E2; }
.btn-custom { background-color: #6c757d; }
.btn-single-default { background: linear-gradient(135deg, #007bff, #0056b3); }
`;

const compressCss = (css: string) => {
    const minified = css
        .replace(/\/\*[\s\S]*?\*\//g, '') 
        .replace(/\s+/g, ' ') 
        .replace(/\s*([{:;,>])\s*/g, '$1') 
        .trim();
    return `/* ========================================\n   Link Builder - Affiliate Buttons\n   https://github.com/nry0ta/link-builder\n   ======================================== */\n${minified}\n/* --- Powered by Link Builder --- */`;
};

function Usage() {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(compressCss(affiliateCss)).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 3000);
        });
    };

    return (
        <div className="container">
            <h1>使い方</h1>
            <hr />
            <h2>1. CSSコードの設置 (初回のみ)</h2>
            <p>当ツールで生成したアフィリエイトリンクのデザインをブログで正しく表示するために、以下のCSSコードをあなたのサイトのCSSファイルに一度だけコピー＆ペーストしてください。</p>
            <p>（WordPressテーマをご利用の場合、「外観」&gt;「カスタマイズ」&gt;「追加CSS」の欄に貼り付けるのが最も簡単です）</p>

            <textarea className="code-display" readOnly rows={4} value={compressCss(affiliateCss)}></textarea>
            <button className="btn-secondary" onClick={handleCopy}>
                {copied ? 'CSSコードをコピーしました！' : 'CSSをコピー'}
            </button>
            <div style={{ minHeight: '30px' }}></div>
            
            <hr />
            <h2>2. 初期設定</h2>
            <p>当サイトは国内ホテルの情報取得において、Rakuten Web Service等のAPIを利用してホテルの情報を取得しています。</p>
            <p>そのため、本ツールのご利用にあたってはご自身で楽天アフィリエイトIDなどを取得いただき、「設定画面」よりご登録をお願いいたします。未登録の場合、正しいアフィリエイトリンクが生成されません。</p>
            <hr />
            <h2>3. 検索結果・リンク生成について</h2>
            <p>ホテル検索機能からホテルを探し、クリックするとリンク作成画面に遷移します。「設定画面」で入力したID情報と「リンク作成画面」で登録した各サイトのURLが組み合わさり、ブログ用の最適なレイアウトHTMLコードが自動生成されます。コード出力後、そのままブログのHTML編集画面に貼り付けてご利用ください。</p>
        </div>
    );
}

export default Usage;
