import { useState, useEffect } from 'react';

type SettingsState = {
    rakutenAppId: string;
    rakutenAffiliateId: string;
    vcSid: string;
    vcPidJalan: string;
    vcPidIkkyu: string;
    vcPidYahoo: string;
    atRkihg: string;
    atRkjphotels: string;
    lsid: string;
    a8mat: string;
    amazonClientId: string;
    amazonClientSecret: string;
    amazonTrackingId: string;
    yahooSid: string;
    yahooPid: string;
    [key: string]: string; // Allow dynamic key access
};

function Settings() {
    const [settings, setSettings] = useState<SettingsState>({
        rakutenAppId: '',
        rakutenAffiliateId: '',
        vcSid: '',
        vcPidJalan: '',
        vcPidIkkyu: '',
        vcPidYahoo: '',
        atRkihg: '',
        atRkjphotels: '',
        lsid: '',
        a8mat: '',
        amazonClientId: '',
        amazonClientSecret: '',
        amazonTrackingId: '',
        yahooSid: '',
        yahooPid: ''
    });

    const [notification, setNotification] = useState('');

    useEffect(() => {
        const storedSettings = JSON.parse(localStorage.getItem('linkBuilderSettings') || '{}');
        setSettings(prev => ({ ...prev, ...storedSettings }));
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setSettings(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const saveSettings = () => {
        const trimmedSettings: SettingsState = { ...settings };
        for (const key in trimmedSettings) {
             trimmedSettings[key] = typeof trimmedSettings[key] === 'string' ? trimmedSettings[key].trim() : trimmedSettings[key];
        }
        localStorage.setItem('linkBuilderSettings', JSON.stringify(trimmedSettings));
        setSettings(trimmedSettings);
        
        setNotification('設定を保存しました。');
        setTimeout(() => setNotification(''), 3000);
    };

    return (
        <div className="container page-setting">
            <h1>設定</h1>
            <p>APIキーやアフィリエイトIDを保存します。この情報はあなたのブラウザ内にのみ保存されます。<br/>各プラットフォームのIDの取得方法などはこちらをご覧ください。</p>

            <hr/> <h3>楽天アフィリエイト</h3>
            
            <div className="form-group">
                <label>楽天アプリケーションID (AppID)</label>
                <input type="text" name="rakutenAppId" value={settings.rakutenAppId} onChange={handleChange} placeholder="楽天ウェブサービスから取得したID" />
            </div>

            <div className="form-group">
                <label>楽天アフィリエイトID</label>
                <input type="text" name="rakutenAffiliateId" value={settings.rakutenAffiliateId} onChange={handleChange} placeholder="楽天アフィリエイトのID" />
            </div>

            <hr/> <h3>バリューコマース</h3>

            <div className="form-group">
                <label>SID (サイトID)</label>
                <input type="text" name="vcSid" value={settings.vcSid} onChange={handleChange} placeholder="バリューコマースのサイトID" />
            </div>

            <div className="form-group">
                <label>じゃらんnet PID (広告ID)</label>
                <input type="text" name="vcPidJalan" value={settings.vcPidJalan} onChange={handleChange} placeholder="じゃらんnetの広告ID (PID)" />
            </div>

            <div className="form-group">
                <label>一休.com PID (広告ID)</label>
                <input type="text" name="vcPidIkkyu" value={settings.vcPidIkkyu} onChange={handleChange} placeholder="一休.comの広告ID (PID)" />
            </div>

            <div className="form-group">
                <label>Yahoo!トラベル PID (広告ID)</label>
                <input type="text" name="vcPidYahoo" value={settings.vcPidYahoo} onChange={handleChange} placeholder="Yahoo!トラベルの広告ID (PID)" />
            </div>

            <hr/> <h3>アクセストレード</h3>
            
            <div className="form-group">
                <label>IHG (rk)</label>
                <input type="text" name="atRkihg" value={settings.atRkihg} onChange={handleChange} placeholder="商品リンクのcc?rk=〇〇の部分" />
            </div>

            <div className="form-group">
                <label>jp.hotels.com (rk)</label>
                <input type="text" name="atRkjphotels" value={settings.atRkjphotels} onChange={handleChange} placeholder="商品リンクのcc?rk=〇〇の部分" />
            </div>

            <hr/> <h3>リンクシェア</h3>
            <p>リンクシェアのIDは楽天トラベル、Trip.com、トリバゴ共通です。</p>
            
            <div className="form-group">
                <label>リンクシェア (ID)</label>
                <input type="text" name="lsid" value={settings.lsid} onChange={handleChange} placeholder="リンクシェアのID" />
            </div>

            <hr/> <h3>A8.net</h3>
            <p>A8.net経由のアゴダ(Agoda)などで使用します。</p>
            <div className="form-group">
                <label>a8mat</label>
                <input type="text" name="a8mat" value={settings.a8mat} onChange={handleChange} placeholder="例: 3ZHPHD+247I7M+4X1W+BWGDT" />
            </div>
            
            <hr/> <h3>Amazon・Yahoo!ショッピング</h3>
            <p>商品紹介モードで使用します。</p>

            <div className="form-group">
                <label>Amazon アソシエイト (トラッキングID)</label>
                <input type="text" name="amazonTrackingId" value={settings.amazonTrackingId} onChange={handleChange} placeholder="例: your-id-22" />
            </div>
            
            <p style={{ marginTop: '15px' }}>Amazon Creators API 認証情報 (商品検索用)</p>
            <div className="form-group">
                <label>クライアントID (Client ID)</label>
                <input type="text" name="amazonClientId" value={settings.amazonClientId} onChange={handleChange} placeholder="amzn1.application-oa2-client..." />
            </div>
            <div className="form-group">
                <label>クライアントシークレット (Client Secret)</label>
                <input type="text" name="amazonClientSecret" value={settings.amazonClientSecret} onChange={handleChange} placeholder="シークレットを入力" />
            </div>

            <p style={{ marginTop: '15px' }}>Yahoo!ショッピング (バリューコマース)</p>
            <div className="form-group">
                <label>SID (サイトID)</label>
                <input type="text" name="yahooSid" value={settings.yahooSid} onChange={handleChange} placeholder="バリューコマースのサイトID" />
            </div>
            <div className="form-group">
                <label>PID (広告ID)</label>
                <input type="text" name="yahooPid" value={settings.yahooPid} onChange={handleChange} placeholder="Yahoo!ショッピングの広告ID (PID)" />
            </div>

            <hr/>

            <button id="saveButton" onClick={saveSettings}>設定を保存</button>

            {notification && (
                <div className="btn-notification notification-success" style={{ display: 'block', opacity: 1 }}>
                    {notification}
                </div>
            )}
        </div>
    );
}

export default Settings;
