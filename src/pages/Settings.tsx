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
    vcPidKlook: string;
    vcPidKkday: string;
    vcPidAsoview: string;
    vcPidJalanActivity: string;
    vcPidTripActivity: string;
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
        vcPidKlook: '',
        vcPidKkday: '',
        vcPidAsoview: '',
        vcPidJalanActivity: '',
        vcPidTripActivity: '',
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

    // Helper to render env variable status
    const renderEnvBadge = (envValue: any) => {
        if (envValue) {
            return (
                <span style={{
                    fontSize: '0.75rem',
                    color: '#28a745',
                    backgroundColor: '#e8f5e9',
                    padding: '2px 8px',
                    borderRadius: '50px',
                    marginLeft: '10px',
                    fontWeight: 'bold',
                    display: 'inline-block'
                }}>
                    ✓ CF環境変数で設定されています
                </span>
            );
        }
        return null;
    };

    return (
        <div className="container page-setting">
            <h1>設定</h1>
            <p>APIキーやアフィリエイトIDを保存します。未入力の項目はCloudflare環境変数のデフォルト値が自動適用されます。</p>

            <hr /> <h3>楽天アフィリエイト</h3>
            <div className="form-group">
                <label>
                    楽天アプリケーションID (AppID)
                    {renderEnvBadge(import.meta.env.VITE_RAKUTEN_APP_ID)}
                </label>
                <input type="text" name="rakutenAppId" value={settings.rakutenAppId} onChange={handleChange} placeholder="楽天ウェブサービスから取得したID" />
            </div>
            <div className="form-group">
                <label>
                    楽天アフィリエイトID
                    {renderEnvBadge(import.meta.env.VITE_RAKUTEN_AFFILIATE_ID)}
                </label>
                <input type="text" name="rakutenAffiliateId" value={settings.rakutenAffiliateId} onChange={handleChange} placeholder="楽天アフィリエイトのID" />
            </div>

            <hr /> <h3>バリューコマース (共通・旅行)</h3>
            <div className="form-group">
                <label>
                    SID (サイトID)
                    {renderEnvBadge(import.meta.env.VITE_VC_SID)}
                </label>
                <input type="text" name="vcSid" value={settings.vcSid} onChange={handleChange} placeholder="バリューコマースのサイトID" />
            </div>
            <div className="form-group">
                <label>
                    じゃらんnet (宿泊) PID
                    {renderEnvBadge(import.meta.env.VITE_VC_PID_JALAN)}
                </label>
                <input type="text" name="vcPidJalan" value={settings.vcPidJalan} onChange={handleChange} />
            </div>
            <div className="form-group">
                <label>
                    一休.com PID
                    {renderEnvBadge(import.meta.env.VITE_VC_PID_IKKYU)}
                </label>
                <input type="text" name="vcPidIkkyu" value={settings.vcPidIkkyu} onChange={handleChange} />
            </div>
            <div className="form-group">
                <label>
                    Yahoo!トラベル PID
                    {renderEnvBadge(import.meta.env.VITE_VC_PID_YAHOO)}
                </label>
                <input type="text" name="vcPidYahoo" value={settings.vcPidYahoo} onChange={handleChange} />
            </div>

            <hr /> <h3>バリューコマース (アクティビティ・体験)</h3>
            <div className="form-group">
                <label>
                    Klook PID
                    {renderEnvBadge(import.meta.env.VITE_VC_PID_KLOOK)}
                </label>
                <input type="text" name="vcPidKlook" value={settings.vcPidKlook} onChange={handleChange} placeholder="Klookの提携PID" />
            </div>
            <div className="form-group">
                <label>
                    KKday PID
                    {renderEnvBadge(import.meta.env.VITE_VC_PID_KKDAY)}
                </label>
                <input type="text" name="vcPidKkday" value={settings.vcPidKkday} onChange={handleChange} placeholder="KKdayの提携PID" />
            </div>
            <div className="form-group">
                <label>
                    アソビュー！ PID
                    {renderEnvBadge(import.meta.env.VITE_VC_PID_ASOVIEW)}
                </label>
                <input type="text" name="vcPidAsoview" value={settings.vcPidAsoview} onChange={handleChange} placeholder="アソビュー！の提携PID" />
            </div>
            <div className="form-group">
                <label>
                    じゃらん 遊び・体験 PID
                    {renderEnvBadge(import.meta.env.VITE_VC_PID_JALAN_ACTIVITY)}
                </label>
                <input type="text" name="vcPidJalanActivity" value={settings.vcPidJalanActivity} onChange={handleChange} placeholder="じゃらん遊び・体験の提携PID" />
            </div>
            <div className="form-group">
                <label>
                    Trip.com 体験 PID
                    {renderEnvBadge(import.meta.env.VITE_VC_PID_TRIP_ACTIVITY)}
                </label>
                <input type="text" name="vcPidTripActivity" value={settings.vcPidTripActivity} onChange={handleChange} placeholder="Trip.com体験の提携PID (バリューコマース経由)" />
            </div>

            <hr /> <h3>バリューコマース (ショッピング・Anker)</h3>
            <div className="form-group">
                <label>
                    Yahoo!ショッピング PID
                    {renderEnvBadge(import.meta.env.VITE_YAHOO_PID)}
                </label>
                <input type="text" name="yahooPid" value={settings.yahooPid} onChange={handleChange} />
            </div>
            <div className="form-group">
                <label>
                    Amazon PID
                    {renderEnvBadge(import.meta.env.VITE_VC_PID_AMAZON)}
                </label>
                <input type="text" name="vcPidAmazon" value={settings.vcPidAmazon || ''} onChange={handleChange} />
            </div>
            <div className="form-group">
                <label>
                    Anker PID
                    {renderEnvBadge(import.meta.env.VITE_VC_PID_ANKER)}
                </label>
                <input type="text" name="vcPidAnker" value={settings.vcPidAnker || ''} onChange={handleChange} />
            </div>

            <hr /> <h3>Amazon・Yahoo!ショッピング 詳細設定</h3>
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
                <label>
                    Amazon アソシエイト (トラッキングID)
                    {renderEnvBadge(import.meta.env.VITE_AMAZON_TRACKING_ID)}
                </label>
                <p className="edit-guide" style={{ fontSize: '0.85rem', color: '#666' }}>カンマ(,)区切りで複数登録できます。Link Builderで選択可能です。</p>
                <input type="text" name="amazonTrackingId" value={settings.amazonTrackingId} onChange={handleChange} placeholder="your-1-22, your-2-22" />
            </div>

            <p style={{ marginTop: '20px', fontWeight: 'bold' }}>Amazon Creators API (商品検索用)</p>
            <p className="edit-guide" style={{ fontSize: '0.85rem', color: '#666', marginBottom: '15px' }}>
                ※Cloudflare Pagesの環境変数（Secret）に <strong>AMAZON_CLIENT_ID</strong> と <strong>AMAZON_CLIENT_SECRET</strong> が設定されている場合は、以下の入力欄は空欄のままで商品検索機能が利用できます。
            </p>
            <div className="form-group">
                <label>Client ID</label>
                <input type="text" name="amazonClientId" value={settings.amazonClientId} onChange={handleChange} />
            </div>
            <div className="form-group">
                <label>Client Secret</label>
                <input type="text" name="amazonClientSecret" value={settings.amazonClientSecret} onChange={handleChange} />
            </div>

            <hr /> <h3>その他アフィリエイト</h3>
            <div className="form-group">
                <label>
                    アクセストレード (rk)
                    {renderEnvBadge(import.meta.env.VITE_AT_RK_IHG)}
                </label>
                <input type="text" name="atRkihg" value={settings.atRkihg} onChange={handleChange} placeholder="IHGなど" />
            </div>
            <div className="form-group">
                <label>
                    リンクシェア ID
                    {renderEnvBadge(import.meta.env.VITE_TRIPCOM_LSID)}
                </label>
                <input type="text" name="lsid" value={settings.lsid} onChange={handleChange} />
            </div>
            <div className="form-group">
                <label>
                    A8.net (a8mat)
                    {renderEnvBadge(import.meta.env.VITE_A8MAT)}
                </label>
                <input type="text" name="a8mat" value={settings.a8mat} onChange={handleChange} />
            </div>

            <hr />
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
