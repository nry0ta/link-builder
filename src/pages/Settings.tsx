import { useState, useEffect } from 'react';

type SettingsState = {
    rakutenAppId: string;
    rakutenAffiliateId: string;
    vcSid: string;
    vcPidJalan: string;
    vcPidIkkyu: string;
    vcPidYahoo: string;
    vcPidAmazon: string;
    vcPidAnker: string;
    atRkihg: string;
    atRkjphotels: string;
    lsid: string;
    a8mat: string;
    amazonClientId: string;
    amazonClientSecret: string;
    amazonTrackingId: string;
    amazonPriority: string;
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
        vcPidAmazon: '',
        vcPidAnker: '',
        atRkihg: '',
        atRkjphotels: '',
        lsid: '',
        a8mat: '',
        amazonClientId: '',
        amazonClientSecret: '',
        amazonTrackingId: '',
        amazonPriority: 'associate',
        yahooSid: '',
        yahooPid: ''
    });

    const [notification, setNotification] = useState('');

    useEffect(() => {
        const storedSettings = JSON.parse(localStorage.getItem('linkBuilderSettings') || '{}');
        setSettings(prev => ({ ...prev, ...storedSettings }));
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setSettings(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const saveSettings = () => {
        const trimmedSettings: SettingsState = { ...settings };
        for (const key in trimmedSettings) {
             if (typeof trimmedSettings[key] === 'string') {
                 trimmedSettings[key] = (trimmedSettings[key] as string).trim();
             }
        }
        localStorage.setItem('linkBuilderSettings', JSON.stringify(trimmedSettings));
        setSettings(trimmedSettings);
        
        setNotification('設定を保存しました。');
        setTimeout(() => setNotification(''), 3000);
    };

    return (
        <div className="container page-setting">
            <h1>設定</h1>
            <p>APIキーやアフィリエイトIDを保存します。この情報はあなたのブラウザ内にのみ保存されます。</p>

            <hr/> <h3>楽天アフィリエイト</h3>
            <div className="form-group">
                <label>楽天アプリケーションID (AppID)</label>
                <input type="text" name="rakutenAppId" value={settings.rakutenAppId} onChange={handleChange} placeholder="楽天ウェブサービスから取得したID" />
            </div>
            <div className="form-group">
                <label>楽天アフィリエイトID</label>
                <input type="text" name="rakutenAffiliateId" value={settings.rakutenAffiliateId} onChange={handleChange} placeholder="楽天アフィリエイトのID" />
            </div>

            <hr/> <h3>バリューコマース (共通・旅行)</h3>
            <div className="form-group">
                <label>SID (サイトID)</label>
                <input type="text" name="vcSid" value={settings.vcSid} onChange={handleChange} placeholder="バリューコマースのサイトID" />
            </div>
            <div className="form-group">
                <label>じゃらんnet PID</label>
                <input type="text" name="vcPidJalan" value={settings.vcPidJalan} onChange={handleChange} />
            </div>
            <div className="form-group">
                <label>一休.com PID</label>
                <input type="text" name="vcPidIkkyu" value={settings.vcPidIkkyu} onChange={handleChange} />
            </div>
            <div className="form-group">
                <label>Yahoo!トラベル PID</label>
                <input type="text" name="vcPidYahoo" value={settings.vcPidYahoo} onChange={handleChange} />
            </div>

            <hr/> <h3>バリューコマース (ショッピング・Anker)</h3>
            <div className="form-group">
                <label>Yahoo!ショッピング PID</label>
                <input type="text" name="yahooPid" value={settings.yahooPid} onChange={handleChange} />
            </div>
            <div className="form-group">
                <label>Amazon PID</label>
                <input type="text" name="vcPidAmazon" value={settings.vcPidAmazon || ''} onChange={handleChange} />
            </div>
            <div className="form-group">
                <label>Anker PID</label>
                <input type="text" name="vcPidAnker" value={settings.vcPidAnker || ''} onChange={handleChange} />
            </div>

            <hr/> <h3>Amazon・Yahoo!ショッピング 詳細設定</h3>
            <div className="form-group">
                <label>Amazonリンク優先度</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <input type="radio" name="amazonPriority" value="associate" checked={settings.amazonPriority === 'associate'} onChange={handleChange} />
                        Amazonアソシエイト
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <input type="radio" name="amazonPriority" value="valuecommerce" checked={settings.amazonPriority === 'valuecommerce'} onChange={handleChange} />
                        バリューコマース
                    </label>
                </div>
            </div>

            <div className="form-group">
                <label>Amazon アソシエイト (トラッキングID)</label>
                <p className="edit-guide" style={{ fontSize: '0.85rem', color: '#666' }}>カンマ(,)区切りで複数登録できます。Link Builderで選択可能です。</p>
                <input type="text" name="amazonTrackingId" value={settings.amazonTrackingId} onChange={handleChange} placeholder="your-1-22, your-2-22" />
            </div>
            
            <p style={{ marginTop: '20px', fontWeight: 'bold' }}>Amazon Creators API (商品検索用)</p>
            <div className="form-group">
                <label>Client ID</label>
                <input type="text" name="amazonClientId" value={settings.amazonClientId} onChange={handleChange} />
            </div>
            <div className="form-group">
                <label>Client Secret</label>
                <input type="text" name="amazonClientSecret" value={settings.amazonClientSecret} onChange={handleChange} />
            </div>

            <hr/> <h3>その他アフィリエイト</h3>
            <div className="form-group">
                <label>アクセストレード (rk)</label>
                <input type="text" name="atRkihg" value={settings.atRkihg} onChange={handleChange} placeholder="IHGなど" />
            </div>
            <div className="form-group">
                <label>リンクシェア ID</label>
                <input type="text" name="lsid" value={settings.lsid} onChange={handleChange} />
            </div>
            <div className="form-group">
                <label>A8.net (a8mat)</label>
                <input type="text" name="a8mat" value={settings.a8mat} onChange={handleChange} />
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
