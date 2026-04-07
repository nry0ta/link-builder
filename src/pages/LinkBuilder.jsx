import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    createRakutenLink, 
    createJalanLink, 
    createIkkyuLink, 
    createYahooLink, 
    createIHGLink, 
    createTripcomLink 
} from '../utils/af_link';

function LinkBuilder() {
    const navigate = useNavigate();
    
    // Original hotel data from Session Storage
    const [hotelData, setHotelData] = useState({
        name: '',
        imageUrl: '',
        keyword: '',
        url: '',
        address: ''
    });

    const [settings, setSettings] = useState({});

    // Design state
    const [designMode, setDesignMode] = useState(null);
    
    // Site Selection state
    const [selectedSites, setSelectedSites] = useState({
        rakuten: false, jalan: false, ikkyu: false, yahoo: false,
        booking: false, hotelscom: false, ihg: false, tripcom: false, agoda: false
    });

    // URLs state
    const [urls, setUrls] = useState({
        rakuten: '', jalan: '', ikkyu: '', yahoo: '',
        booking: '', hotelscom: '', ihg: '', tripcom: '', agoda: ''
    });

    // Custom Design Texts
    const [designTexts, setDesignTexts] = useState({
        singleJumpText: '',
        modalButtonText: '',
        multipleBtnText: 'で見てみる',
        showImage: true,
        showAddress: true,
        customImageUrl: '',
        customAddress: ''
    });

    const [generatedCode, setGeneratedCode] = useState('');
    const [previewHtml, setPreviewHtml] = useState('');
    const [notification, setNotification] = useState({ message: '', type: '', id: '' });
    
    const previewRef = useRef(null);
    const outputRef = useRef(null);

    // Initialization
    useEffect(() => {
        const stored = sessionStorage.getItem('selectedHotel');
        if (stored) {
            const parsed = JSON.parse(stored);
            setHotelData(parsed);
            setUrls(prev => ({ ...prev, rakuten: parsed.url }));
            setDesignTexts(prev => ({
                ...prev,
                customImageUrl: parsed.imageUrl,
                customAddress: parsed.address || ''
            }));
        } else {
            navigate('/');
        }

        const storedSettings = JSON.parse(localStorage.getItem('linkBuilderSettings')) || {};
        setSettings({
            rakutenAffiliateId: storedSettings.rakutenAffiliateId || '40dba8c4.a3a6d6ce.40dba8c5.0eaf9b42',
            vcSid: storedSettings.vcSid || '',
            vcPidJalan: storedSettings.vcPidJalan || '',
            vcPidIkkyu: storedSettings.vcPidIkkyu || '',
            vcPidYahoo: storedSettings.vcPidYahoo || '',
            atIhgRk: storedSettings.atRkihg || '0100mmq100o520',
            tripcomLsid: storedSettings.lsid || ''
        });
    }, [navigate]);

    // Handle site selection with link auto-generation
    const handleSiteToggle = (site) => {
        const isCurrentlyChecked = selectedSites[site];
        const newCheckedState = !isCurrentlyChecked;
        
        let newSelections = { ...selectedSites, [site]: newCheckedState };
        
        // Single jump mode logic: only one selected
        if (designMode === 'single' && newCheckedState) {
            newSelections = Object.keys(newSelections).reduce((acc, key) => {
                acc[key] = key === site;
                return acc;
            }, {});
        }
        setSelectedSites(newSelections);

        // Auto-generate URLs
        if (newCheckedState) {
            let autoUrl = urls[site];
            const keyword = hotelData.keyword;
            if (site === 'rakuten') autoUrl = createRakutenLink(settings.rakutenAffiliateId, hotelData.url);
            if (site === 'jalan') autoUrl = createJalanLink(settings.vcSid, settings.vcPidJalan, keyword);
            if (site === 'ikkyu') autoUrl = createIkkyuLink(settings.vcSid, settings.vcPidIkkyu, keyword);
            if (site === 'yahoo') autoUrl = createYahooLink(settings.vcSid, settings.vcPidYahoo, keyword);
            if (site === 'ihg') autoUrl = createIHGLink(settings.atIhgRk, keyword);
            if (site === 'tripcom') autoUrl = createTripcomLink(settings.tripcomLsid);

            setUrls(prev => ({ ...prev, [site]: autoUrl || prev[site] }));
        }

        // Auto text update
        updateDefaultTexts(newSelections, designMode, hotelData.name);
    };

    const handleDesignClick = (mode) => {
        setDesignMode(mode);
        let newSelections = { ...selectedSites };
        if (mode === 'single') {
            newSelections = Object.keys(newSelections).reduce((acc, key) => { acc[key] = false; return acc; }, {});
            setSelectedSites(newSelections);
        } else if (mode === 'multiple') {
            setDesignTexts(prev => ({ ...prev, showImage: true, showAddress: true }));
        }
        updateDefaultTexts(newSelections, mode, hotelData.name);
    };

    const updateDefaultTexts = (selections, mode, hotelName) => {
        let singleText = designTexts.singleJumpText;
        if (mode === 'single') {
            const checkedSites = Object.keys(selections).filter(k => selections[k]);
            const siteName = checkedSites.length === 1 ? siteLabels[checkedSites[0]] : 'サイト名';
            singleText = `${siteName}で「${hotelName}」を今すぐみてみる`;
        }
        
        setDesignTexts(prev => ({
            ...prev,
            singleJumpText: singleText || prev.singleJumpText,
            modalButtonText: `「${hotelName}」を各サイトで比較する`,
            multipleBtnText: 'で見てみる'
        }));
    };

    const showNotification = (message, type, id) => {
        setNotification({ message, type, id });
        setTimeout(() => setNotification({ message: '', type: '', id: '' }), 3000);
    };

    // Code generators
    const buildSingleJumpHtml = (id, link, text) => `<div class="link-builder-wrapper"><a href="${link.url}" id="${id}" target="_blank" rel="nofollow sponsored noopener" class="af-single-jump-btn btn-${link.site}">${text}</a></div>`;
    
    const buildModalHtml = (id, hotelName, links, buttonText) => {
        const linksHtml = links.map(link => `<li class="af-link-item"><a href="${link.url}" target="_blank" rel="nofollow sponsored noopener">${link.name}で見る</a></li>`).join(''); 
        return `<div class="af-hotel-container" id="${id}">\n    <div class="af-hotel-button">${buttonText}</div>\n    <div class="af-modal-backdrop"><div class="af-modal-content"><div class="af-modal-header">${hotelName}</div><ul class="af-link-list">${linksHtml}</ul></div></div>\n    <script>(function(){var c=document.getElementById('${id}');if(c.dataset.initialized)return;var o=c.querySelector('.af-hotel-button');var m=c.querySelector('.af-modal-backdrop');var l=${links.length};if(l===1){o.outerHTML=o.outerHTML.replace(/^<div/,'<a').replace(/div>$/,'a>');var btn=c.querySelector('.af-hotel-button');btn.href=c.querySelector('a').href;btn.target='_blank';btn.rel='nofollow sponsored noopener';}else{o.addEventListener('click',function(e){e.preventDefault();m.style.display='flex';});}m.addEventListener('click',function(e){if(e.target===m)m.style.display='none';});c.dataset.initialized='true';}())<\/script>\n</div>`;
    };

    const buildMultipleHtml = (id, hotelName, links, options) => {
        const imageHtml = options.showImage && options.imageUrl ? `<div class="af-image-wrapper"><img src="${options.imageUrl}" alt="${hotelName}"></div>` : ''; 
        const addressHtml = options.showAddress && options.address ? `<p class="af-hotel-address">${options.address}</p>` : ''; 
        const linksHtml = links.map(link => {
            if (link.site === 'ihg') {
                return `<div class="af-ihg-wrapper"><div class="af-ihg-badge">＼最安値保証&amp;レイトチェックアウト／</div><a href="${link.url}" target="_blank" rel="nofollow sponsored noopener" class="af-multi-btn btn-${link.site}"><span class="af-btn-text">${link.name}${options.buttonText}</span></a></div>`;
            }
            return `<a href="${link.url}" target="_blank" rel="nofollow sponsored noopener" class="af-multi-btn btn-${link.site}"><span class="af-btn-text">${link.name}${options.buttonText}</span></a>`;
        }).join(''); 
        return `<div class="af-multi-container" id="${id}">\n    ${imageHtml}\n    <div class="af-info-wrapper">\n        <div class="af-hotel-name">${hotelName}</div>\n        ${addressHtml}\n        <div class="af-links-wrapper">${linksHtml}</div>\n    </div>\n</div>`; 
    };

    const generateCode = () => {
        const links = Object.keys(selectedSites)
            .filter(site => selectedSites[site] && urls[site].trim() !== '')
            .map(site => ({ name: siteLabels[site], url: urls[site].trim(), site }));

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
                imageUrl: designTexts.customImageUrl, address: designTexts.customAddress
            }); break;
            default: showNotification('デザインモードを選択してください。', 'error', 'generateBtnNotification'); return;
        }

        setGeneratedCode(html.trim());
        setPreviewHtml(html.trim());
        showNotification('ブログ用コードの生成に成功しました！', 'success', 'generateBtnNotification');
        
        setTimeout(() => {
            if (outputRef.current) outputRef.current.scrollIntoView({ behavior: 'smooth' });
            
            // Execute script tags inside preview
            if (previewRef.current) {
                const scripts = previewRef.current.getElementsByTagName('script');
                for (let i = 0; i < scripts.length; i++) {
                    const newScript = document.createElement('script');
                    newScript.text = scripts[i].text;
                    document.body.appendChild(newScript).parentNode.removeChild(newScript);
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

    const siteLabels = {
        rakuten: '楽天トラベル', jalan: 'じゃらんnet', ikkyu: '一休.com', yahoo: 'Yahoo!トラベル',
        booking: 'Booking.com', hotelscom: 'jp.Hotels.com', ihg: '【最安値】IHG公式', tripcom: 'Trip.com', agoda: 'Agoda'
    };

    const isAnySiteChecked = Object.values(selectedSites).some(Boolean);

    return (
        <div className="container page-builder">
            <h1>リンクを作成</h1>
            <p>選択したホテルの情報をもとに、ブログに貼り付けるリンクを作成します。</p>

            <div className="form-group">
                <label>ホテル名</label>
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
                        {Object.keys(siteLabels).map(site => (
                            <div key={site}>
                                <input type="checkbox" id={`select-${site}`} checked={selectedSites[site]} onChange={() => handleSiteToggle(site)} />
                                <label htmlFor={`select-${site}`}>{siteLabels[site]}</label>
                            </div>
                        ))}
                    </div>

                    <div id="link-inputs-container">
                        {Object.keys(siteLabels).map(site => (
                            selectedSites[site] && (
                                <div key={`url-${site}`} className="form-group">
                                    <label>{siteLabels[site]} URL</label>
                                    <input type="text" value={urls[site]} onChange={e => setUrls({...urls, [site]: e.target.value})} placeholder={`アフィリエイトリンクを貼り付け`} />
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
                                    <input type="text" value={designTexts.singleJumpText} onChange={e => setDesignTexts({...designTexts, singleJumpText: e.target.value})} />
                                </div>
                            )}

                            {designMode === 'modal' && (
                                <div className="design-edit-control">
                                    <label>ボタンテキスト</label>
                                    <p className="edit-guide">改行には&lt;br&gt;タグを使用できます。</p>
                                    <input type="text" value={designTexts.modalButtonText} onChange={e => setDesignTexts({...designTexts, modalButtonText: e.target.value})} />
                                </div>
                            )}

                            {designMode === 'multiple' && (
                                <div className="design-edit-control">
                                    <label>ボタンテキスト ({designTexts.multipleBtnText})</label>
                                    <p className="edit-guide">サイト名の後に表示されるテキストです。</p>
                                    <input type="text" value={designTexts.multipleBtnText} onChange={e => setDesignTexts({...designTexts, multipleBtnText: e.target.value})} />
                                    
                                    <div className="checkbox-control">
                                        <input type="checkbox" id="showImg" checked={designTexts.showImage} onChange={e => setDesignTexts({...designTexts, showImage: e.target.checked})} />
                                        <label htmlFor="showImg">ホテル画像を表示</label>
                                    </div>
                                    
                                    {designTexts.showImage && (
                                        <div className="form-group">
                                            <label>画像のURL</label>
                                            <input type="text" value={designTexts.customImageUrl} onChange={e => setDesignTexts({...designTexts, customImageUrl: e.target.value})} />
                                        </div>
                                    )}

                                    <div className="checkbox-control">
                                        <input type="checkbox" id="showAddr" checked={designTexts.showAddress} onChange={e => setDesignTexts({...designTexts, showAddress: e.target.checked})} />
                                        <label htmlFor="showAddr">住所情報を表示</label>
                                    </div>

                                    {designTexts.showAddress && (
                                        <div className="form-group">
                                            <label>住所情報</label>
                                            <textarea rows="3" readOnly value={designTexts.customAddress} />
                                        </div>
                                    )}
                                    <hr />
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
                <div ref={outputRef} style={{ marginTop: '20px' }}>
                    <h2>生成されたコード</h2>
                    <textarea rows="12" className="code-display" readOnly value={generatedCode} />
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
