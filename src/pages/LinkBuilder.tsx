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
    createYahooShoppingLink
} from '../utils/af_link';

function LinkBuilder() {
    const navigate = useNavigate();
    
    const [hotelData, setHotelData] = useState<any>({
        name: '', imageUrl: '', keyword: '', url: '', address: ''
    });
    const [settings, setSettings] = useState<any>({});
    const [designMode, setDesignMode] = useState<string | null>(null);
    const [selectedSites, setSelectedSites] = useState<Record<string, boolean>>({
        rakuten: false, jalan: false, ikkyu: false, yahoo: false,
        booking: false, hotelscom: false, ihg: false, tripcom: false, agoda: false, custom: false,
        amazon: false, rakuten_ichiba: false, yahoo_shopping: false
    });
    const [urls, setUrls] = useState<Record<string, string>>({
        rakuten: '', jalan: '', ikkyu: '', yahoo: '',
        booking: '', hotelscom: '', ihg: '', tripcom: '', agoda: '', custom: '',
        amazon: '', rakuten_ichiba: '', yahoo_shopping: ''
    });
    const [siteOrder, setSiteOrder] = useState<string[]>(['rakuten', 'jalan', 'ikkyu', 'yahoo', 'booking', 'hotelscom', 'ihg', 'tripcom', 'agoda', 'custom']);
    const [customSiteName, setCustomSiteName] = useState('任意サイト');
    const [emphasizedSites, setEmphasizedSites] = useState<Record<string, boolean>>({});
    const [emphasizeTexts, setEmphasizeTexts] = useState<Record<string, string>>({});
    const [designTexts, setDesignTexts] = useState<any>({
        singleJumpText: '', modalButtonText: '', multipleBtnText: '',
        showImage: true, showAddress: true, customImageUrl: '', customAddress: ''
    });
    const [generatedCode, setGeneratedCode] = useState('');
    const [previewHtml, setPreviewHtml] = useState('');
    const [notification, setNotification] = useState({ message: '', type: '', id: '' });
    
    const previewRef = useRef<HTMLDivElement>(null);
    const outputRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        const stored = sessionStorage.getItem('selectedHotel');
        let initialData: any = { name: '', url: '', imageUrl: '', address: '', type: 'hotel' };
        
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                initialData = parsed;
                setHotelData(parsed);
                setUrls(prev => ({ ...prev, rakuten: parsed.url }));
                setDesignTexts((prev: any) => ({
                    ...prev, customImageUrl: parsed.imageUrl, customAddress: parsed.address || ''
                }));
            } catch (e) {}
        }
        
        const storedSettings = JSON.parse(localStorage.getItem('linkBuilderSettings') || '{}');
        const currentSettings = {
            rakutenAffiliateId: storedSettings.rakutenAffiliateId || '40dba8c4.a3a6d6ce.40dba8c5.0eaf9b42',
            vcSid: storedSettings.vcSid || '',
            vcPidJalan: storedSettings.vcPidJalan || '',
            vcPidIkkyu: storedSettings.vcPidIkkyu || '',
            vcPidYahoo: storedSettings.vcPidYahoo || '',
            atIhgRk: storedSettings.atRkihg || '0100mmq100o520',
            tripcomLsid: storedSettings.lsid || '',
            a8mat: storedSettings.a8mat || '',
            amazonTag: storedSettings.amazonTrackingId || '',
            yahooSid: storedSettings.yahooSid || '',
            yahooPid: storedSettings.yahooPid || ''
        };
        setSettings(currentSettings);

        const isProduct = initialData.type === 'product';
        const defaultOrder = isProduct 
            ? ['amazon', 'rakuten_ichiba', 'yahoo_shopping', 'custom']
            : ['rakuten', 'jalan', 'ikkyu', 'yahoo', 'booking', 'hotelscom', 'ihg', 'tripcom', 'agoda', 'custom'];

        if (isProduct) {
            setSelectedSites({
                rakuten: false, jalan: false, ikkyu: false, yahoo: false,
                booking: false, hotelscom: false, ihg: false, tripcom: false, agoda: false, custom: false,
                amazon: true, rakuten_ichiba: true, yahoo_shopping: true
            });
            // Auto generate product links
            // If initialData.url exists for Amazon, it means it came from PA-API and already has the Tag embedded.
            setUrls(prev => ({
                ...prev,
                amazon: initialData.url || createAmazonLink(currentSettings.amazonTag, initialData.name),
                rakuten_ichiba: createRakutenLink(currentSettings.rakutenAffiliateId, initialData.url),
                yahoo_shopping: createYahooShoppingLink(currentSettings.yahooSid, currentSettings.yahooPid, initialData.name)
            }));
            setSiteOrder(defaultOrder);
        } else {
            const storedOrder = localStorage.getItem('siteOrder');
            if (storedOrder) {
                try {
                    const parsedOrder = JSON.parse(storedOrder);
                    if (Array.isArray(parsedOrder) && parsedOrder.length > 0) {
                        const merged = [...parsedOrder, ...defaultOrder.filter((s: string) => !parsedOrder.includes(s))];
                        setSiteOrder(merged);
                    } else {
                        setSiteOrder(defaultOrder);
                    }
                } catch (e) {
                    setSiteOrder(defaultOrder);
                }
            } else {
                setSiteOrder(defaultOrder);
            }
        }
    }, [navigate]);

    const moveSite = (index: number, direction: 'up' | 'down') => {
        const newOrder = [...siteOrder];
        if (direction === 'up' && index > 0) {
            [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
        } else if (direction === 'down' && index < newOrder.length - 1) {
            [newOrder[index + 1], newOrder[index]] = [newOrder[index], newOrder[index + 1]];
        } else {
            return;
        }
        setSiteOrder(newOrder);
        localStorage.setItem('siteOrder', JSON.stringify(newOrder));
    };

    const handleSiteToggle = (site: string) => {
        const isCurrentlyChecked = selectedSites[site];
        const newCheckedState = !isCurrentlyChecked;
        
        let newSelections: Record<string, boolean> = { ...selectedSites, [site]: newCheckedState };
        if (designMode === 'single' && newCheckedState) {
            newSelections = Object.keys(newSelections).reduce((acc: Record<string, boolean>, key) => {
                acc[key] = key === site;
                return acc;
            }, {});
        }
        setSelectedSites(newSelections);

        if (newCheckedState) {
            let autoUrl = urls[site];
            const keyword = hotelData.keyword;
            if (site === 'rakuten') autoUrl = createRakutenLink(settings.rakutenAffiliateId, hotelData.url);
            if (site === 'jalan') autoUrl = createJalanLink(settings.vcSid, settings.vcPidJalan, keyword);
            if (site === 'ikkyu') autoUrl = createIkkyuLink(settings.vcSid, settings.vcPidIkkyu, keyword);
            if (site === 'yahoo') autoUrl = createYahooLink(settings.vcSid, settings.vcPidYahoo, keyword);
            if (site === 'ihg') autoUrl = createIHGLink(settings.atIhgRk, keyword);
            if (site === 'tripcom') autoUrl = createTripcomLink(settings.tripcomLsid);
            if (site === 'agoda') {
                const baseAgoda = `https://www.agoda.com/ja-jp/search?textToSearch=${encodeURIComponent(keyword)}`;
                if (settings.a8mat) {
                    autoUrl = `https://px.a8.net/svt/ejp?a8mat=${settings.a8mat}&a8ejpredirect=${encodeURIComponent(baseAgoda)}`;
                } else {
                    autoUrl = baseAgoda;
                }
            }
            if (site === 'amazon') autoUrl = createAmazonLink(settings.amazonTag, hotelData.name);
            if (site === 'rakuten_ichiba') autoUrl = createRakutenLink(settings.rakutenAffiliateId, hotelData.url);
            if (site === 'yahoo_shopping') autoUrl = createYahooShoppingLink(settings.yahooSid, settings.yahooPid, hotelData.name);

            setUrls(prev => ({ ...prev, [site]: autoUrl || prev[site] }));
        }
        updateDefaultTexts(newSelections, designMode, hotelData.name);
    };

    const handleDesignClick = (mode: string) => {
        setDesignMode(mode);
        let newSelections: Record<string, boolean> = { ...selectedSites };
        if (mode === 'single') {
            newSelections = Object.keys(newSelections).reduce((acc: Record<string, boolean>, key) => { acc[key] = false; return acc; }, {});
            setSelectedSites(newSelections);
        } else if (mode === 'multiple') {
            setDesignTexts((prev: any) => ({ ...prev, showImage: true, showAddress: true }));
        }
        updateDefaultTexts(newSelections, mode, hotelData.name);
    };

    const updateDefaultTexts = (selections: any, mode: string | null, hotelName: string) => {
        let singleText = designTexts.singleJumpText;
        if (mode === 'single') {
            const checkedSites = Object.keys(selections).filter(k => selections[k]);
            const siteName = checkedSites.length === 1 ? (siteLabels as any)[checkedSites[0]] : 'サイト名';
            singleText = `${siteName}で「${hotelName}」を今すぐみてみる`;
        }
        setDesignTexts((prev: any) => ({
            ...prev,
            singleJumpText: singleText || prev.singleJumpText,
            modalButtonText: hotelData.type === 'product' ? `「${hotelName}」を各サイトで比較する` : `「${hotelName}」を各サイトで比較する`
        }));
    };

    const showNotification = (message: string, type: string, id: string) => {
        setNotification({ message, type, id });
        setTimeout(() => setNotification({ message: '', type: '', id: '' }), 3000);
    };

    const buildSingleJumpHtml = (id: string, link: any, text: string) => `<div class="link-builder-wrapper"><a href="${link.url}" id="${id}" target="_blank" rel="nofollow sponsored noopener" class="af-single-jump-btn btn-${link.site}">${text}</a></div>`;
    
    const buildModalHtml = (id: string, hotelName: string, links: any[], buttonText: string) => {
        const linksHtml = links.map(link => `<li class="af-link-item"><a href="${link.url}" target="_blank" rel="nofollow sponsored noopener">${link.name}で見る</a></li>`).join(''); 
        return `<div class="af-hotel-container" id="${id}">\n    <div class="af-hotel-button">${buttonText}</div>\n    <div class="af-modal-backdrop"><div class="af-modal-content"><div class="af-modal-header">${hotelName}</div><ul class="af-link-list">${linksHtml}</ul></div></div>\n    <script>(function(){var c=document.getElementById('${id}');if(c.dataset.initialized)return;var o=c.querySelector('.af-hotel-button');var m=c.querySelector('.af-modal-backdrop');var l=${links.length};if(l===1){o.outerHTML=o.outerHTML.replace(/^<div/,'<a').replace(/div>$/,'a>');var btn=c.querySelector('.af-hotel-button');btn.href=c.querySelector('a').href;btn.target='_blank';btn.rel='nofollow sponsored noopener';}else{o.addEventListener('click',function(e){e.preventDefault();m.style.display='flex';});}m.addEventListener('click',function(e){if(e.target===m)m.style.display='none';});c.dataset.initialized='true';}())<\/script>\n</div>`;
    };

    const buildMultipleHtml = (id: string, hotelName: string, links: any[], options: any) => {
        const imageHtml = options.showImage && options.imageUrl ? `<div class="af-image-wrapper"><img src="${options.imageUrl}" alt="${hotelName}"></div>` : ''; 
        const addressHtml = options.showAddress && options.address ? `<p class="af-hotel-address">${options.address}</p>` : ''; 
        
        const cqiVal = (95 / Math.max(1, hotelName.length)).toFixed(2);
        const nameStyle = `font-size: clamp(0.65rem, ${cqiVal}cqi, 1.15rem);`;

        const linksHtml = links.map(link => {
            const isEmp = options.emphasizedSites && options.emphasizedSites[link.site];
            const defaultEmpText = link.site === 'ihg' ? '＼最安値保証&レイトチェックアウト／' : '＼期間限定セール／';
            const empText = options.emphasizeTexts && options.emphasizeTexts[link.site] !== undefined 
                ? options.emphasizeTexts[link.site] 
                : defaultEmpText;

            let finalUrl = link.url;

            if (isEmp) {
                return `<div class="af-emphasize-wrapper"><div class="af-emphasize-badge">${empText}</div><a href="${finalUrl}" target="_blank" rel="nofollow sponsored noopener" class="af-multi-btn btn-${link.site}"><span class="af-btn-text">${link.name}${options.buttonText}</span></a></div>`;
            }
            return `<a href="${finalUrl}" target="_blank" rel="nofollow sponsored noopener" class="af-multi-btn btn-${link.site}"><span class="af-btn-text">${link.name}${options.buttonText}</span></a>`;
        }).join(''); 
        return `<div class="af-multi-container" id="${id}">\n    ${imageHtml}\n    <div class="af-info-wrapper">\n        <div class="af-name-container" style="container-type: inline-size; width: 100%;"><div class="af-hotel-name" style="${nameStyle}">${hotelName}</div></div>\n        ${addressHtml}\n        <div class="af-links-wrapper">${linksHtml}</div>\n    </div>\n</div>`; 
    };

    const generateCode = () => {
        const links = siteOrder
            .filter(site => selectedSites[site] && urls[site].trim() !== '')
            .map(site => {
                let finalUrl = urls[site].trim();
                // Apply A8.net Agoda Affiliate Tracking if not already applied
                if (site === 'agoda' && settings.a8mat && !finalUrl.startsWith('https://px.a8.net')) {
                    finalUrl = `https://px.a8.net/svt/ejp?a8mat=${settings.a8mat}&a8ejpredirect=${encodeURIComponent(finalUrl)}`;
                }
                return { name: (siteLabels as any)[site], url: finalUrl, site };
            });

        if (links.length === 0 || !hotelData.name) {
            showNotification('ホテル名と最低1つのURLを入力してください。', 'error', 'generateBtnNotification');
            return;
        }

        if (designMode === 'modal' && links.length < 2) {
            showNotification('モーダル表示モードでは、2つ以上のサイトを選択する必要があります。', 'error', 'generateBtnNotification');
            return;
        }

        let html = '';
        const uniqueId = 'af-hotel-' + Math.random().toString(36).substr(2, 9);
        
        switch (designMode) {
            case 'single': html = buildSingleJumpHtml(uniqueId, links[0], designTexts.singleJumpText); break;
            case 'modal': html = buildModalHtml(uniqueId, hotelData.name, links, designTexts.modalButtonText); break;
            case 'multiple': html = buildMultipleHtml(uniqueId, hotelData.name, links, {
                buttonText: designTexts.multipleBtnText, showImage: designTexts.showImage, showAddress: designTexts.showAddress,
                imageUrl: designTexts.customImageUrl, address: designTexts.customAddress,
                emphasizedSites, emphasizeTexts, settings
            }); break;
            default: showNotification('デザインモードを選択してください。', 'error', 'generateBtnNotification'); return;
        }

        const finalHtml = html.replace(/>\s+</g, '><').replace(/\n\s*/g, ' ').trim();
        setGeneratedCode(finalHtml);
        setPreviewHtml(finalHtml);
        showNotification('ブログ用コードの生成に成功しました！', 'success', 'generateBtnNotification');
        
        setTimeout(() => {
            if (outputRef.current) outputRef.current.scrollIntoView({ behavior: 'smooth' });
            if (previewRef.current) {
                const scripts = previewRef.current.getElementsByTagName('script');
                for (let i = 0; i < scripts.length; i++) {
                    const newScript = document.createElement('script');
                    newScript.text = scripts[i].text;
                    document.body.appendChild(newScript).parentNode?.removeChild(newScript);
                }
            }
        }, 100);
    };

    const copyCode = () => {
        if (!generatedCode) {
            showNotification('先にコードを生成してください。', 'error', 'copyBtnNotification');
            return;
        }
        navigator.clipboard.writeText(generatedCode).then(() => {
            showNotification('コードをクリップボードにコピーしました！', 'success', 'copyBtnNotification');
        }).catch(() => {
            showNotification('コピーに失敗しました。', 'error', 'copyBtnNotification');
        });
    };

    const siteLabels: Record<string, string> = {
        rakuten: '楽天トラベル', jalan: 'じゃらんnet', ikkyu: '一休.com', yahoo: 'Yahoo!トラベル',
        booking: 'Booking.com', hotelscom: 'jp.Hotels.com', ihg: 'IHG公式', tripcom: 'Trip.com', agoda: 'Agoda',
        amazon: 'Amazon', rakuten_ichiba: '楽天市場', yahoo_shopping: 'Yahoo!ショッピング',
        custom: customSiteName || '任意サイト'
    };

    const isAnySiteChecked = Object.values(selectedSites).some(Boolean);

    return (
        <div className="container page-builder">
            <h1>リンクを作成</h1>
            <p>選択したホテルの情報をもとに、ブログに貼り付けるリンクを作成します。</p>

            <div className="form-group">
                <label>{hotelData.type === 'product' ? '商品名' : 'ホテル名'}</label>
                <input type="text" value={hotelData.name} onChange={e => setHotelData({...hotelData, name: e.target.value})} />
            </div>

            <div className="form-group">
                <label>検索ワード</label>
                <input type="text" value={hotelData.keyword} onChange={e => setHotelData({...hotelData, keyword: e.target.value})} />
            </div>

            <hr />

            <h3>デザインを選択</h3>
            <p>各デザインの導入前に予めブログやサイトに指定のCSSを設定していただく必要があります。</p>

            <div className="form-group">
                <div className="design-selection">
                    <button className={`design-btn ${designMode === 'single' ? 'active' : ''}`} onClick={() => handleDesignClick('single')}>
                        特定のサイトへジャンプ
                    </button>
                    <button className={`design-btn ${designMode === 'modal' ? 'active' : ''}`} onClick={() => handleDesignClick('modal')}>
                        ひとつのボタンから複数のサイトを選択
                    </button>
                    <button className={`design-btn ${designMode === 'multiple' ? 'active' : ''}`} onClick={() => handleDesignClick('multiple')}>
                        それぞれの予約サイトへのボタンを用意
                    </button>
                </div>
            </div>

            <hr />

            {designMode && (
                <div>
                    <h3>アフィリエイトサイトを選択</h3>
                    <p className="guide-message">
                        {designMode === 'single' ? '単一ジャンプモード。サイトを一つだけ選択してください。' : '複数サイト選択モード。表示したいサイトを複数チェックできます。'}
                    </p>
                    
                    <div className="site-selection">
                        {siteOrder.map(site => (
                            <div key={site}>
                                <input type="checkbox" id={`select-${site}`} checked={selectedSites[site]} onChange={() => handleSiteToggle(site)} />
                                <label htmlFor={`select-${site}`}>{(siteLabels as any)[site]}</label>
                            </div>
                        ))}
                    </div>

                    <div id="link-inputs-container">
                        {siteOrder.map((site, index) => (
                            selectedSites[site] && (
                                <div key={`url-${site}`} className="form-group url-sort-wrapper">
                                    <div className="url-sort-controls">
                                        <button className="sort-btn" onClick={() => moveSite(index, 'up')} disabled={index === 0}>▲</button>
                                        <button className="sort-btn" onClick={() => moveSite(index, 'down')} disabled={index === siteOrder.length - 1}>▼</button>
                                    </div>
                                    <div className="url-sort-content">
                                        <label>{site === 'custom' ? (customSiteName || '任意サイト') : siteLabels[site]} URL</label>
                                        {site === 'custom' && (
                                            <input
                                                type="text"
                                                value={customSiteName}
                                                onChange={e => setCustomSiteName(e.target.value)}
                                                placeholder="サイト名を入力"
                                                style={{ marginBottom: '6px', fontWeight: 'bold' }}
                                            />
                                        )}
                                        <input type="text" value={urls[site]} onChange={e => setUrls({...urls, [site]: e.target.value})} placeholder={`アフィリエイトリンクを貼り付け`} />
                                        
                                        {designMode === 'multiple' && (
                                            <>
                                                <div className="checkbox-control" style={{ marginTop: '10px' }}>
                                                    <input 
                                                        type="checkbox" 
                                                        id={`emp-cb-${site}`} 
                                                        checked={!!emphasizedSites[site]} 
                                                        onChange={e => setEmphasizedSites(prev => ({...prev, [site]: e.target.checked}))} 
                                                    />
                                                    <label htmlFor={`emp-cb-${site}`}>このボタンを強調表示する</label>
                                                </div>
                                                {emphasizedSites[site] && (
                                                    <div style={{marginTop: '8px'}}>
                                                        <label style={{ fontSize: '0.85rem' }}>アンカーテキスト</label>
                                                        <input 
                                                            type="text" 
                                                            value={emphasizeTexts[site] ?? (site === 'ihg' ? '＼最安値保証&レイトチェックアウト／' : '＼期間限定セール／')} 
                                                            onChange={e => setEmphasizeTexts(prev => ({...prev, [site]: e.target.value}))} 
                                                            placeholder={site === 'ihg' ? '＼最安値保証&レイトチェックアウト／' : '＼期間限定セール／'}
                                                        />
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            )
                        ))}
                    </div>

                    <hr />

                    {isAnySiteChecked && (
                        <div className="form-group">
                            <h3>デザインを編集</h3>
                            
                            {designMode === 'single' && (
                                <div className="design-edit-control">
                                    <label>ボタンテキスト</label>
                                    <p className="edit-guide">サイト名の後に表示されるテキストです。改行には&lt;br&gt;タグを使用できます。</p>
                                    <input type="text" value={designTexts.singleJumpText} onChange={e => setDesignTexts((prev: any) => ({...prev, singleJumpText: e.target.value}))} />
                                </div>
                            )}

                            {designMode === 'modal' && (
                                <div className="design-edit-control">
                                    <label>ボタンテキスト</label>
                                    <p className="edit-guide">改行には&lt;br&gt;タグを使用できます。</p>
                                    <input type="text" value={designTexts.modalButtonText} onChange={e => setDesignTexts((prev: any) => ({...prev, modalButtonText: e.target.value}))} />
                                </div>
                            )}

                            {designMode === 'multiple' && (
                                <div className="design-edit-control">
                                    <label>ボタンテキスト</label>
                                    <p className="edit-guide">サイト名の後に表示されるテキストです。</p>
                                    <input type="text" value={designTexts.multipleBtnText} onChange={e => setDesignTexts((prev: any) => ({...prev, multipleBtnText: e.target.value}))} />
                                    
                                    <div className="checkbox-control">
                                        <input type="checkbox" id="showImg" checked={designTexts.showImage} onChange={e => setDesignTexts((prev: any) => ({...prev, showImage: e.target.checked}))} />
                                        <label htmlFor="showImg">ホテル画像を表示</label>
                                    </div>
                                    
                                    {designTexts.showImage && (
                                        <div className="form-group">
                                            <label>画像のURL</label>
                                            <input type="text" value={designTexts.customImageUrl} onChange={e => setDesignTexts((prev: any) => ({...prev, customImageUrl: e.target.value}))} />
                                        </div>
                                    )}

                                    <div className="checkbox-control">
                                        <input type="checkbox" id="showAddr" checked={designTexts.showAddress} onChange={e => setDesignTexts((prev: any) => ({...prev, showAddress: e.target.checked}))} />
                                        <label htmlFor="showAddr">住所情報を表示</label>
                                    </div>

                                    {designTexts.showAddress && (
                                        <div className="form-group" id="hotelAddressSection">
                                            <label>{hotelData.type === 'product' ? '備考 / 価格情報' : '住所情報'}</label>
                                            <input type="text" value={designTexts.customAddress} onChange={e => setDesignTexts((prev: any) => ({...prev, customAddress: e.target.value}))} />
                                        </div>
                                    )}


                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            <button id="generateBtn" onClick={generateCode}>ブログ用コードを生成</button>
            {notification.id === 'generateBtnNotification' && (
                <div className={`btn-notification notification-${notification.type}`} style={{ display: 'block', opacity: 1 }}>{notification.message}</div>
            )}

            {generatedCode && (
                <div ref={outputRef as any} style={{ marginTop: '20px' }}>
                    <h2>生成されたコード</h2>
                    <textarea rows={12} className="code-display" readOnly value={generatedCode} />
                    <button className="btn-secondary" onClick={copyCode}>コードをコピー</button>
                    {notification.id === 'copyBtnNotification' && (
                        <div className={`btn-notification notification-${notification.type}`} style={{ display: 'block', opacity: 1 }}>{notification.message}</div>
                    )}
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
