import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    createRakutenLink, 
    createJalanLink, 
    createIkkyuLink, 
    createYahooLink, 
    createIHGLink, 
    createTripcomLink,
    createAmazonLink,
    createValueCommerceAmazonLink,
    createAnkerLink,
    createRakutenSearchLink,
    createYahooShoppingLink
} from '../utils/af_link';

function LinkBuilder() {
    const navigate = useNavigate();
    
    const [hotelData, setHotelData] = useState<any>({
        name: '', imageUrl: '', keyword: '', url: '', address: '', asin: '', 
        type: 'hotel', source: 'manual', engine: 'amazon'
    });
    const [settings, setSettings] = useState<any>({});
    const [trackingIds, setTrackingIds] = useState<string[]>([]);
    const [selectedTrackingId, setSelectedTrackingId] = useState('');
    const [designMode, setDesignMode] = useState<string | null>(null);
    
    const [selectedSites, setSelectedSites] = useState<Record<string, boolean>>({
        rakuten: false, jalan: false, ikkyu: false, yahoo: false,
        booking: false, hotelscom: false, ihg: false, tripcom: false, agoda: false, custom: false,
        amazon: false, rakuten_ichiba: false, yahoo_shopping: false, anker: false
    });
    const [urls, setUrls] = useState<Record<string, string>>({
        rakuten: '', jalan: '', ikkyu: '', yahoo: '',
        booking: '', hotelscom: '', ihg: '', tripcom: '', agoda: '', custom: '',
        amazon: '', rakuten_ichiba: '', yahoo_shopping: '', anker: ''
    });
    const [siteOrder, setSiteOrder] = useState<string[]>(['rakuten', 'jalan', 'ikkyu', 'yahoo', 'booking', 'hotelscom', 'ihg', 'tripcom', 'agoda', 'custom']);
    const [customSiteName, setCustomSiteName] = useState('任意サイト');
    const [emphasizedSites, setEmphasizedSites] = useState<Record<string, boolean>>({});
    const [emphasizeTexts, _setEmphasizeTexts] = useState<Record<string, string>>({});
    const [designTexts, setDesignTexts] = useState<any>({
        singleJumpText: '', modalButtonText: '', multipleBtnText: '',
        showImage: true, showAddress: true, customImageUrl: '', customAddress: ''
    });
    const [generatedCode, setGeneratedCode] = useState('');
    const [previewHtml, setPreviewHtml] = useState('');
    const [_notification, setNotification] = useState({ message: '', type: '', id: '' });
    
    const previewRef = useRef<HTMLDivElement>(null);
    const outputRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        const stored = sessionStorage.getItem('selectedHotel');
        let initialData: any = { name: '', url: '', imageUrl: '', address: '', keyword: '', type: 'hotel', source: 'manual', engine: 'amazon' };
        
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                initialData = parsed;
                setHotelData(parsed);
                setDesignTexts((prev: any) => ({
                    ...prev, customImageUrl: parsed.imageUrl, customAddress: parsed.price || parsed.address || ''
                }));
            } catch (e) {}
        }
        
        const storedSettings = JSON.parse(localStorage.getItem('linkBuilderSettings') || '{}');
        const ids = (storedSettings.amazonTrackingId || '').split(',').map((s: string) => s.trim()).filter(Boolean);
        setTrackingIds(ids);
        const initialTag = ids[0] || '';
        setSelectedTrackingId(initialTag);

        const currentSettings = {
            rakutenAppId: storedSettings.rakutenAppId || '',
            rakutenAffiliateId: storedSettings.rakutenAffiliateId || '',
            vcSid: storedSettings.vcSid || '',
            vcPidJalan: storedSettings.vcPidJalan || '',
            vcPidIkkyu: storedSettings.vcPidIkkyu || '',
            vcPidYahoo: storedSettings.vcPidYahoo || '',
            vcPidAmazon: storedSettings.vcPidAmazon || '',
            vcPidAnker: storedSettings.vcPidAnker || '',
            amazonPriority: storedSettings.amazonPriority || 'associate',
            atIhgRk: storedSettings.atRkihg || '',
            tripcomLsid: storedSettings.lsid || '',
            a8mat: storedSettings.a8mat || '',
            yahooSid: storedSettings.yahooSid || '',
            yahooPid: storedSettings.yahooPid || ''
        };
        setSettings(currentSettings);

        const isProduct = initialData.type === 'product';
        const defaultOrder = isProduct 
            ? ['amazon', 'rakuten_ichiba', 'yahoo_shopping', 'anker', 'custom']
            : ['rakuten', 'jalan', 'ikkyu', 'yahoo', 'booking', 'hotelscom', 'ihg', 'tripcom', 'agoda', 'custom'];

        if (isProduct) {
            setSelectedSites({
                rakuten: false, jalan: false, ikkyu: false, yahoo: false,
                booking: false, hotelscom: false, ihg: false, tripcom: false, agoda: false, custom: false,
                amazon: true, rakuten_ichiba: true, yahoo_shopping: true, anker: true
            });
            
            // Logic for product links
            const amazonUrl = generateAmazonUrl(initialData, currentSettings, initialTag);
            const rakutenUrl = generateRakutenUrl(initialData, currentSettings);
            const yahooUrl = createYahooShoppingLink(currentSettings.vcSid, currentSettings.yahooPid, initialData.keyword || initialData.name);
            const ankerUrl = createAnkerLink(currentSettings.vcSid, currentSettings.vcPidAnker, initialData.keyword || initialData.name);

            setUrls(prev => ({
                ...prev,
                amazon: amazonUrl,
                rakuten_ichiba: rakutenUrl,
                yahoo_shopping: yahooUrl,
                anker: ankerUrl
            }));
            setSiteOrder(defaultOrder);
        } else {
            const storedOrder = localStorage.getItem('siteOrder');
            setUrls(prev => ({ ...prev, rakuten: initialData.url }));
            if (storedOrder) {
                try {
                    const parsedOrder = JSON.parse(storedOrder);
                    if (Array.isArray(parsedOrder) && parsedOrder.length > 0) {
                        const merged = [...parsedOrder, ...defaultOrder.filter((s: string) => !parsedOrder.includes(s))];
                        setSiteOrder(merged);
                    } else {
                        setSiteOrder(defaultOrder);
                    }
                } catch (e) { setSiteOrder(defaultOrder); }
            } else {
                setSiteOrder(defaultOrder);
            }
        }
    }, [navigate]);

    // Helpers for dynamic links
    const generateAmazonUrl = (data: any, sett: any, tag: string) => {
        const useVC = sett.amazonPriority === 'valuecommerce';
        if (useVC) return createValueCommerceAmazonLink(sett.vcSid, sett.vcPidAmazon, data.keyword || data.name);
        
        const isDirect = data.engine === 'amazon' && data.source === 'api' && data.asin;
        return createAmazonLink(tag, data.keyword || data.name, isDirect ? data.asin : undefined);
    };

    const generateRakutenUrl = (data: any, sett: any) => {
        const isDirect = data.engine === 'rakuten' && data.source === 'api' && data.url;
        if (isDirect) return createRakutenLink(sett.rakutenAffiliateId, data.url);
        return createRakutenSearchLink(sett.rakutenAffiliateId, data.keyword || data.name);
    };

    useEffect(() => {
        if (hotelData.type === 'product' && selectedTrackingId) {
            setUrls(prev => ({
                ...prev,
                amazon: generateAmazonUrl(hotelData, settings, selectedTrackingId)
            }));
        }
    }, [selectedTrackingId]);

    const moveSite = (index: number, direction: 'up' | 'down') => {
        const newOrder = [...siteOrder];
        if (direction === 'up' && index > 0) [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
        else if (direction === 'down' && index < newOrder.length - 1) [newOrder[index + 1], newOrder[index]] = [newOrder[index], newOrder[index + 1]];
        else return;
        setSiteOrder(newOrder);
        localStorage.setItem('siteOrder', JSON.stringify(newOrder));
    };

    const handleSiteToggle = (site: string) => {
        const isChecked = !selectedSites[site];
        let newSelections = { ...selectedSites, [site]: isChecked };
        if (designMode === 'single' && isChecked) {
            newSelections = Object.keys(newSelections).reduce((acc: any, key) => { acc[key] = key === site; return acc; }, {});
        }
        setSelectedSites(newSelections);

        if (isChecked) {
            let autoUrl = urls[site];
            const kw = hotelData.keyword || hotelData.name;
            if (site === 'rakuten') autoUrl = createRakutenLink(settings.rakutenAffiliateId, hotelData.url);
            if (site === 'jalan') autoUrl = createJalanLink(settings.vcSid, settings.vcPidJalan, kw);
            if (site === 'ikkyu') autoUrl = createIkkyuLink(settings.vcSid, settings.vcPidIkkyu, kw);
            if (site === 'yahoo') autoUrl = createYahooLink(settings.vcSid, settings.vcPidYahoo, kw);
            if (site === 'ihg') autoUrl = createIHGLink(settings.atIhgRk, kw);
            if (site === 'tripcom') autoUrl = createTripcomLink(settings.tripcomLsid);
            if (site === 'agoda') {
                const base = `https://www.agoda.com/ja-jp/search?textToSearch=${encodeURIComponent(kw)}`;
                autoUrl = settings.a8mat ? `https://px.a8.net/svt/ejp?a8mat=${settings.a8mat}&a8ejpredirect=${encodeURIComponent(base)}` : base;
            }
            if (site === 'amazon') autoUrl = generateAmazonUrl(hotelData, settings, selectedTrackingId);
            if (site === 'rakuten_ichiba') autoUrl = generateRakutenUrl(hotelData, settings);
            if (site === 'yahoo_shopping') autoUrl = createYahooShoppingLink(settings.vcSid, settings.yahooPid, kw);
            if (site === 'anker') autoUrl = createAnkerLink(settings.vcSid, settings.vcPidAnker, kw);

            setUrls(prev => ({ ...prev, [site]: autoUrl || prev[site] }));
        }
        updateDefaultTexts(newSelections, designMode, hotelData.name);
    };

    const handleDesignClick = (mode: string) => {
        setDesignMode(mode);
        let newSelections = { ...selectedSites };
        if (mode === 'single') {
            newSelections = Object.keys(newSelections).reduce((acc: any, key) => { acc[key] = false; return acc; }, {});
            setSelectedSites(newSelections);
        }
        updateDefaultTexts(newSelections, mode, hotelData.name);
    };

    const updateDefaultTexts = (selections: any, mode: string | null, name: string) => {
        let singleText = designTexts.singleJumpText;
        if (mode === 'single') {
            const checked = Object.keys(selections).filter(k => selections[k]);
            const siteName = checked.length === 1 ? (siteLabels as any)[checked[0]] : 'サイト名';
            singleText = `${siteName}で「${name}」を今すぐみてみる`;
        }
        setDesignTexts((prev: any) => ({
            ...prev,
            singleJumpText: singleText || prev.singleJumpText,
            modalButtonText: `「${name}」を各サイトで比較する`,
            multipleBtnText: ''
        }));
    };

    const showNotification = (message: string, type: string, id: string) => {
        setNotification({ message, type, id });
        setTimeout(() => setNotification({ message: '', type: '', id: '' }), 3000);
    };

    const generateCode = () => {
        const links = siteOrder
            .filter(site => selectedSites[site] && urls[site].trim() !== '')
            .map(site => ({ name: (siteLabels as any)[site], url: urls[site].trim(), site }));

        if (links.length === 0 || !hotelData.name) {
            showNotification('名称と最低1つのURLを入力してください。', 'error', 'generateBtnNotification');
            return;
        }

        let html = '';
        const uniqueId = 'af-item-' + Math.random().toString(36).substr(2, 9);
        
        switch (designMode) {
            case 'single': 
                html = `<div class="af-single-wrapper"><a href="${links[0].url}" id="${uniqueId}" target="_blank" rel="nofollow sponsored noopener" class="af-single-jump-btn btn-${links[0].site}">${designTexts.singleJumpText}</a></div>`;
                break;
            case 'modal': 
                const linksHtml = links.map(l => `<li class="af-link-item"><a href="${l.url}" target="_blank" rel="nofollow sponsored noopener">${l.name}で見る</a></li>`).join(''); 
                html = `<div class="af-item-container" id="${uniqueId}">\n    <div class="af-item-button">${designTexts.modalButtonText}</div>\n    <div class="af-modal-backdrop"><div class="af-modal-content"><div class="af-modal-header">${hotelData.name}</div><ul class="af-link-list">${linksHtml}</ul></div></div>\n    <script>(function(){var c=document.getElementById('${uniqueId}');if(c.dataset.initialized)return;var o=c.querySelector('.af-item-button');var m=c.querySelector('.af-modal-backdrop');var l=${links.length};if(l===1){o.outerHTML=o.outerHTML.replace(/^<div/,'<a').replace(/div>$/,'a>');var btn=c.querySelector('.af-item-button');btn.href=c.querySelector('a').href;btn.target='_blank';btn.rel='nofollow sponsored noopener';}else{o.addEventListener('click',function(e){e.preventDefault();m.style.display='flex';});}m.addEventListener('click',function(e){if(e.target===m)m.style.display='none';});c.dataset.initialized='true';}())<\/script>\n</div>`;
                break;
            case 'multiple': 
                const img = designTexts.showImage && designTexts.customImageUrl ? `<div class="af-image-wrapper"><img src="${designTexts.customImageUrl}" alt="${hotelData.name}"></div>` : ''; 
                const addr = designTexts.showAddress && designTexts.customAddress ? `<p class="af-item-address">${designTexts.customAddress}</p>` : ''; 
                const btnHtml = links.map(l => {
                    const isEmp = emphasizedSites[l.site];
                    const empText = emphasizeTexts[l.site] || (l.site === 'ihg' ? '＼最安値保証&レイトチェックアウト／' : '＼期間限定セール／');
                    if (isEmp) return `<div class="af-emphasize-wrapper"><div class="af-emphasize-badge">${empText}</div><a href="${l.url}" target="_blank" rel="nofollow sponsored noopener" class="af-multi-btn btn-${l.site}"><span class="af-btn-text">${l.name}${designTexts.multipleBtnText}</span></a></div>`;
                    return `<a href="${l.url}" target="_blank" rel="nofollow sponsored noopener" class="af-multi-btn btn-${l.site}"><span class="af-btn-text">${l.name}${designTexts.multipleBtnText}</span></a>`;
                }).join(''); 
                const cqiVal = (95 / Math.max(1, hotelData.name.length)).toFixed(2);
                html = `<div class="af-multi-container" id="${uniqueId}">\n    ${img}\n    <div class="af-info-wrapper">\n        <div class="af-name-container" style="container-type: inline-size; width: 100%;"><div class="af-item-name" style="font-size: clamp(0.65rem, ${cqiVal}cqi, 1.15rem);">${hotelData.name}</div></div>\n        ${addr}\n        <div class="af-links-wrapper">${btnHtml}</div>\n    </div>\n</div>`; 
                break;
            default: showNotification('デザインモードを選択してください。', 'error', 'generateBtnNotification'); return;
        }

        const finalHtml = html.replace(/>\s+</g, '><').replace(/\n\s*/g, ' ').trim();
        setGeneratedCode(finalHtml);
        setPreviewHtml(finalHtml);
        showNotification('コード生成成功！', 'success', 'generateBtnNotification');
        
        setTimeout(() => {
            if (outputRef.current) outputRef.current.scrollIntoView({ behavior: 'smooth' });
            if (previewRef.current) {
                const scripts = previewRef.current.getElementsByTagName('script');
                for (let i = 0; i < scripts.length; i++) {
                    const s = document.createElement('script');
                    s.text = scripts[i].text;
                    document.body.appendChild(s).parentNode?.removeChild(s);
                }
            }
        }, 100);
    };

    const copyCode = () => {
        if (!generatedCode) return;
        navigator.clipboard.writeText(generatedCode).then(() => showNotification('コピーしました！', 'success', 'copyBtnNotification'));
    };

    const siteLabels: any = {
        rakuten: '楽天トラベル', jalan: 'じゃらんnet', ikkyu: '一休.com', yahoo: 'Yahoo!トラベル',
        booking: 'Booking.com', hotelscom: 'Hotels.com', ihg: 'IHG公式', tripcom: 'Trip.com', agoda: 'Agoda',
        amazon: 'Amazon', rakuten_ichiba: '楽天市場', yahoo_shopping: 'Yahoo!ショッピング', anker: 'Anker公式', custom: customSiteName
    };

    return (
        <div className="container page-builder">
            <h1>リンクを作成</h1>
            
            <div className="form-group">
                <label>名称 ({hotelData.type === 'product' ? '商品名' : 'ホテル名'})</label>
                <input type="text" value={hotelData.name} onChange={e => setHotelData({...hotelData, name: e.target.value})} />
            </div>

            <div className="form-group">
                <label>キーワード (検索用)</label>
                <input type="text" value={hotelData.keyword} onChange={e => setHotelData({...hotelData, keyword: e.target.value})} />
            </div>

            {hotelData.type === 'product' && settings.amazonPriority === 'associate' && trackingIds.length > 1 && (
                <div className="form-group">
                    <label>Amazon トラッキングID 選択</label>
                    <select value={selectedTrackingId} onChange={e => setSelectedTrackingId(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ced4da' }}>
                        {trackingIds.map(id => <option key={id} value={id}>{id}</option>)}
                    </select>
                </div>
            )}

            <hr /> <h3>デザインを選択</h3>
            <div className="design-selection">
                <button className={`design-btn ${designMode === 'single' ? 'active' : ''}`} onClick={() => handleDesignClick('single')}>特定サイトジャンプ</button>
                <button className={`design-btn ${designMode === 'modal' ? 'active' : ''}`} onClick={() => handleDesignClick('modal')}>モーダル選択</button>
                <button className={`design-btn ${designMode === 'multiple' ? 'active' : ''}`} onClick={() => handleDesignClick('multiple')}>複数ボタン並列</button>
            </div>

            {designMode && (
                <div style={{ marginTop: '30px' }}>
                    <hr /> <h3>アフィリエイトサイトを選択</h3>
                    <div className="site-selection">
                        {siteOrder.map(site => (
                            <div key={site}>
                                <input type="checkbox" id={`select-${site}`} checked={selectedSites[site]} onChange={() => handleSiteToggle(site)} />
                                <label htmlFor={`select-${site}`}>{siteLabels[site]}</label>
                            </div>
                        ))}
                    </div>

                    <div id="link-inputs-container">
                        {siteOrder.map((site, idx) => selectedSites[site] && (
                            <div key={site} className="form-group url-sort-wrapper">
                                <div className="url-sort-controls">
                                    <button onClick={() => moveSite(idx, 'up')} disabled={idx === 0}>▲</button>
                                    <button onClick={() => moveSite(idx, 'down')} disabled={idx === siteOrder.length - 1}>▼</button>
                                </div>
                                <div className="url-sort-content">
                                    <label>{siteLabels[site]} URL</label>
                                    {site === 'custom' && <input type="text" value={customSiteName} onChange={e => setCustomSiteName(e.target.value)} placeholder="サイト名" style={{ marginBottom: '5px' }} />}
                                    <input type="text" value={urls[site]} onChange={e => setUrls({...urls, [site]: e.target.value})} />
                                    {designMode === 'multiple' && (
                                        <div className="checkbox-control" style={{ marginTop: '8px' }}>
                                            <input type="checkbox" id={`emp-${site}`} checked={!!emphasizedSites[site]} onChange={e => setEmphasizedSites({...emphasizedSites, [site]: e.target.checked})} />
                                            <label htmlFor={`emp-${site}`}>強調表示</label>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <hr /> <h3>デザイン編集</h3>
                    <div className="design-edit-control">
                        <label>メインボタンテキスト</label>
                        <input type="text" value={designMode === 'single' ? designTexts.singleJumpText : (designMode === 'modal' ? designTexts.modalButtonText : designTexts.multipleBtnText)} 
                               onChange={e => setDesignTexts({...designTexts, [designMode === 'single' ? 'singleJumpText' : (designMode === 'modal' ? 'modalButtonText' : 'multipleBtnText')]: e.target.value})} />
                        {designMode === 'multiple' && (
                            <>
                                <div className="checkbox-control"><input type="checkbox" id="shImg" checked={designTexts.showImage} onChange={e => setDesignTexts({...designTexts, showImage: e.target.checked})} /><label htmlFor="shImg">画像表示</label></div>
                                {designTexts.showImage && <input type="text" value={designTexts.customImageUrl} onChange={e => setDesignTexts({...designTexts, customImageUrl: e.target.value})} placeholder="画像URL" />}
                                <div className="checkbox-control"><input type="checkbox" id="shAd" checked={designTexts.showAddress} onChange={e => setDesignTexts({...designTexts, showAddress: e.target.checked})} /><label htmlFor="shAd">価格/備考を表示</label></div>
                                {designTexts.showAddress && <input type="text" value={designTexts.customAddress} onChange={e => setDesignTexts({...designTexts, customAddress: e.target.value})} placeholder="価格情報など" />}
                            </>
                        )}
                    </div>
                </div>
            )}

            <hr />
            <button id="generateBtn" onClick={generateCode} style={{ background: '#007bff', color: '#fff', padding: '15px 30px', fontSize: '1.2rem' }}>コードを生成</button>
            
            {generatedCode && (
                <div style={{ marginTop: '30px' }}>
                    <h2>ブログ用コード</h2>
                    <textarea rows={8} className="code-display" readOnly value={generatedCode} />
                    <button onClick={copyCode} style={{ marginTop: '10px' }}>コピーする</button>
                </div>
            )}

            {previewHtml && (
                <div style={{ marginTop: '30px' }}>
                    <h2>プレビュー</h2>
                    <div id="previewArea" ref={previewRef} dangerouslySetInnerHTML={{ __html: previewHtml }}></div>
                </div>
            )}
        </div>
    );
}

export default LinkBuilder;
