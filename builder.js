// builder.js (ボタン下通知・修正版)

import { createRakutenLink, createJalanLink, createIkkyuLink, createYahooLink, createIHGLink, createTripcomLink} from './af_link.js';

document.addEventListener('DOMContentLoaded', () => {
    // --- 1. DOM要素の取得 ---
    const hotelNameInput = document.getElementById('hotelName');
    const imageUrlInput = document.getElementById('imageUrl');
    const searchKeywordInput = document.getElementById('searchKeyword');
    const siteCheckboxes = document.querySelectorAll('.site-selection input[type="checkbox"]');
    const generateBtn = document.getElementById('generateBtn');
    const outputSection = document.getElementById('outputSection');
    const outputCode = document.getElementById('outputCode');
    const copyBtn = document.getElementById('copyBtn');
    const previewSection = document.getElementById('previewSection');
    const previewArea = document.getElementById('previewArea');
    const designButtons = document.querySelectorAll('.design-btn');
    const siteSelectionSection = document.getElementById('siteSelectionSection'); 
    const designEditSection = document.getElementById('designEditSection');     
    const singleJumpText = document.getElementById('singleJumpText');         
    const siteSelectionGuide = document.getElementById('siteSelectionGuide');
    const modalButtonText = document.getElementById('modalButtonText');
    const multipleBtnText = document.getElementById('multipleBtnText'); 
    const showImageCheckbox = document.getElementById('showImageCheckbox');
    const showAddressCheckbox = document.getElementById('showAddressCheckbox');
    const hotelAddressDisplay = document.getElementById('hotelAddressDisplay');
    const imageUrlSection = document.getElementById('imageUrlSection');
    const hotelAddressSection = document.getElementById('hotelAddressSection');

    // --- 2. 設定情報の読み込み ---
    const settings = JSON.parse(localStorage.getItem('linkBuilderSettings')) || {};
    const rakutenAffiliateId = settings.rakutenAffiliateId || '40dba8c4.a3a6d6ce.40dba8c5.0eaf9b42';
    const vcSid = settings.vcSid || '';
    const vcPidJalan = settings.vcPidJalan || '';
    const vcPidIkkyu = settings.vcPidIkkyu || '';
    const vcPidYahoo = settings.vcPidYahoo || '';    
    const atIhgRk = settings.atIhgRk || '0100mmq100o520';
    const tripcomLsid = settings.lsid || '';
    
    let currentDesignMode = null; 
    let originalRakutenUrl = '';
    let hotelAddress = '';

    // --- 3. 初期化処理 ---
    initializePage();
    
    // --- 4. イベントリスナーの設定 ---
    setupEventListeners();
    
    // --- 5. 関数定義 ---
    
    function initializePage() {
        const hotelDataJSON = sessionStorage.getItem('selectedHotel');
        if (hotelDataJSON) {
            const hotelData = JSON.parse(hotelDataJSON);
            hotelNameInput.value = hotelData.name;
            imageUrlInput.value = hotelData.imageUrl;
            searchKeywordInput.value = hotelData.keyword;
            originalRakutenUrl = hotelData.url;
            hotelAddress = hotelData.address || '';

            const rakutenUrlInput = document.getElementById('rakutenUrl');
            if (rakutenUrlInput) rakutenUrlInput.value = originalRakutenUrl;
            if (hotelAddressDisplay) hotelAddressDisplay.value = hotelAddress;
        } else {
            window.location.href = 'home.html';
        }
        if (siteSelectionSection) siteSelectionSection.hidden = true; 
        if (designEditSection) designEditSection.hidden = true; 
        if (imageUrlSection) imageUrlSection.hidden = true;
        if (hotelAddressSection) hotelAddressSection.hidden = true; 
    }

    function setupEventListeners() {
        siteCheckboxes.forEach(checkbox => { checkbox.addEventListener('change', handleSiteSelectionChange); });
        if (showImageCheckbox) showImageCheckbox.addEventListener('change', updateMultipleModeVisibility);
        if (showAddressCheckbox) showAddressCheckbox.addEventListener('change', updateMultipleModeVisibility);
        designButtons.forEach(button => { button.addEventListener('click', handleDesignButtonClick); });
        generateBtn.addEventListener('click', generateCode);
        copyBtn.addEventListener('click', copyCode);
        hotelNameInput.addEventListener('input', generateDefaultTexts);
    }
    
    function handleDesignButtonClick(e) {
        currentDesignMode = e.currentTarget.dataset.design;
        designButtons.forEach(btn => btn.classList.remove('active'));
        e.currentTarget.classList.add('active');
        if (siteSelectionSection) siteSelectionSection.hidden = false;
        updateDesignEditSectionVisibility();
        const isSingle = currentDesignMode === 'single', isModal = currentDesignMode === 'modal', isMultiple = currentDesignMode === 'multiple';
        document.getElementById('singleJumpEdit').hidden = !isSingle;
        document.getElementById('modalEdit').hidden = !isModal; 
        document.getElementById('multipleEdit').hidden = !isMultiple; 
        let message = '';
        if (isSingle) message = '<p class="guide-message">単一ジャンプモード。サイトを一つだけ選択してください。</p>';
        else if (isModal || isMultiple) message = '<p class="guide-message">複数サイト選択モード。表示したいサイトを複数チェックできます。</p>';
        if (siteSelectionGuide) siteSelectionGuide.innerHTML = message;
        if (isSingle) {
            siteCheckboxes.forEach(cb => { cb.checked = false; });
            updateVisibleInputs();
        }
        generateDefaultTexts();
        updateMultipleModeVisibility();
    }
    
    function handleSiteSelectionChange(event) {
        if (currentDesignMode === 'single' && event.target.checked) {
            siteCheckboxes.forEach(cb => { if (cb !== event.target) cb.checked = false; });
        }
        updateVisibleInputs();
        updateDesignEditSectionVisibility();
        generateDefaultTexts();
        const siteId = event.target.id;
        const isChecked = event.target.checked;
        const linkGenerationHandlers = {
            'select-rakuten': () => handleRakutenLinkGeneration(isChecked),
            'select-jalan': () => handleJalanLinkGeneration(isChecked),
            'select-ikkyu': () => handleIkkyuLinkGeneration(isChecked),
            'select-yahoo': () => handleYahooLinkGeneration(isChecked),
            'select-ihg': () => handleIhgLinkGeneration(isChecked),
            'select-tripcom': () => handleTripcomLinkGeneration(isChecked),
        };
        if (linkGenerationHandlers[siteId]) linkGenerationHandlers[siteId]();
    }

    function updateMultipleModeVisibility() {
        if (imageUrlSection) imageUrlSection.hidden = !(currentDesignMode === 'multiple' && showImageCheckbox && showImageCheckbox.checked);
        if (hotelAddressSection) hotelAddressSection.hidden = !(currentDesignMode === 'multiple' && showAddressCheckbox && showAddressCheckbox.checked);
    }

    function updateDesignEditSectionVisibility() {
        const isAnySiteChecked = document.querySelectorAll('.site-selection input[type="checkbox"]:checked').length > 0;
        if (designEditSection) designEditSection.hidden = !(isAnySiteChecked && currentDesignMode);
        if (currentDesignMode === 'multiple' && !designEditSection.hidden) {
             if (showImageCheckbox) showImageCheckbox.checked = true;
             if (showAddressCheckbox) showAddressCheckbox.checked = true;
             updateMultipleModeVisibility();
        }
    }
    
    function generateDefaultTexts() {
        const hotelName = hotelNameInput.value;
        if (currentDesignMode === 'single' && singleJumpText) {
            const checked = document.querySelectorAll('.site-selection input[type="checkbox"]:checked');
            let siteName = checked.length === 1 ? document.querySelector(`label[for="${checked[0].id}"]`).textContent.trim() : 'サイト名';
            singleJumpText.value = `${siteName}で「${hotelName}」を今すぐみてみる`;
        } else if (currentDesignMode === 'modal' && modalButtonText) {
            modalButtonText.value = `「${hotelName}」を各サイトで比較する`;
        } else if (currentDesignMode === 'multiple' && multipleBtnText) {
            multipleBtnText.value = `で今すぐみる`;
        }
    }

    function updateVisibleInputs() {
        siteCheckboxes.forEach(checkbox => {
            const formGroup = document.getElementById(`form-group-${checkbox.dataset.site}`);
            if (formGroup) formGroup.hidden = !checkbox.checked;
        });
    }

    function handleRakutenLinkGeneration(isChecked) { const input = document.getElementById('rakutenUrl'); if (!input) return; input.value = isChecked ? createRakutenLink(rakutenAffiliateId, originalRakutenUrl) : originalRakutenUrl; }
    function handleJalanLinkGeneration(isChecked) { const input = document.getElementById('jalanUrl'); if (isChecked && input) input.value = createJalanLink(vcSid, vcPidJalan, searchKeywordInput.value); }
    function handleIkkyuLinkGeneration(isChecked) { const input = document.getElementById('ikkyuUrl'); if (isChecked && input) input.value = createIkkyuLink(vcSid, vcPidIkkyu, searchKeywordInput.value); }
    function handleYahooLinkGeneration(isChecked) { const input = document.getElementById('yahooUrl'); if (isChecked && input) input.value = createYahooLink(vcSid, vcPidYahoo, searchKeywordInput.value); }
    function handleIhgLinkGeneration(isChecked) { const input = document.getElementById('ihgUrl'); if (isChecked && input) input.value = createIHGLink(atIhgRk, searchKeywordInput.value); }
    function handleTripcomLinkGeneration(isChecked) { const input = document.getElementById('tripcomUrl'); if (isChecked && input) input.value = createTripcomLink(tripcomLsid, searchKeywordInput.value); }
    
    function generateCode() {
        const hotelName = hotelNameInput.value;
        const links = [];
        siteCheckboxes.forEach(checkbox => {
            if (checkbox.checked) {
                const siteName = checkbox.dataset.site;
                const siteLabel = document.querySelector(`label[for="select-${siteName}"]`).textContent;
                const urlInput = document.getElementById(`${siteName}Url`);
                if (urlInput && urlInput.value.trim() !== '') {
                    links.push({ name: siteLabel, url: urlInput.value.trim(), site: siteName });
                }
            }
        });

        if (links.length === 0 || !hotelName) { 
            showNotification('ホテル名と最低1つのURLを入力してください。', 'error', 'generateBtnNotification'); 
            return; 
        }

        if (currentDesignMode === 'modal' && links.length < 2) {
            showNotification('モーダル表示モードでは、2つ以上のサイトを選択する必要があります。', 'error', 'generateBtnNotification');
            return;
        }

        let generatedHtml = '';
        const uniqueId = 'af-hotel-' + Math.random().toString(36).substr(2, 9);
        switch (currentDesignMode) {
            case 'single':
                generatedHtml = buildSingleJumpHtml(uniqueId, links[0], singleJumpText.value);
                break;
            case 'modal':
                generatedHtml = buildModalHtml(uniqueId, hotelName, links, modalButtonText.value);
                break;
            case 'multiple':
                generatedHtml = buildMultipleHtml(uniqueId, hotelName, links, {
                    buttonText: multipleBtnText.value,
                    showImage: showImageCheckbox.checked,
                    showAddress: showAddressCheckbox.checked,
                    imageUrl: imageUrlInput.value,
                    address: hotelAddress,
                });
                break;
            default:
                showNotification('デザインモードを選択してください。', 'error', 'generateBtnNotification');
                return;
        }
        outputCode.value = generatedHtml.trim();
        outputSection.hidden = false;
        showPreview(generatedHtml);
        showNotification('ブログ用コードの生成に成功しました！', 'success', 'generateBtnNotification');
    }

    function buildSingleJumpHtml(id, link, text) { return `<div class="link-builder-wrapper"><a href="${link.url}" id="${id}" target="_blank" rel="nofollow sponsored noopener" class="af-single-jump-btn btn-${link.site}">${text}</a></div>`; }
    function buildModalHtml(id, hotelName, links, buttonText) { const linksHtml = links.map(link => `<li class="af-link-item"><a href="${link.url}" target="_blank" rel="nofollow sponsored noopener">${link.name}で見る</a></li>`).join(''); return `<div class="af-hotel-container" id="${id}">\n    <div class="af-hotel-button">${buttonText}</div>\n    <div class="af-modal-backdrop"><div class="af-modal-content"><div class="af-modal-header">${hotelName}</div><ul class="af-link-list">${linksHtml}</ul></div></div>\n    <script>(function(){var c=document.getElementById('${id}');if(c.dataset.initialized)return;var o=c.querySelector('.af-hotel-button');var m=c.querySelector('.af-modal-backdrop');var l=${links.length};if(l===1){o.outerHTML=o.outerHTML.replace(/^<div/,'<a').replace(/div>$/,'a>');var btn=c.querySelector('.af-hotel-button');btn.href=c.querySelector('a').href;btn.target='_blank';btn.rel='nofollow sponsored noopener';}else{o.addEventListener('click',function(e){e.preventDefault();m.style.display='flex';});}m.addEventListener('click',function(e){if(e.target===m)m.style.display='none';});c.dataset.initialized='true';}())<\/script>\n</div>`; }
    function buildMultipleHtml(id, hotelName, links, options) { const imageHtml = options.showImage && options.imageUrl ? `<div class="af-image-wrapper"><img src="${options.imageUrl}" alt="${hotelName}"></div>` : ''; const addressHtml = options.showAddress && options.address ? `<p class="af-hotel-address">${options.address}</p>` : ''; const linksHtml = links.map(link => `<a href="${link.url}" target="_blank" rel="nofollow sponsored noopener" class="af-multi-btn btn-${link.site}"><span class="af-btn-text">${link.name}${options.buttonText}</span></a>`).join(''); return `<div class="af-multi-container" id="${id}">\n    ${imageHtml}\n    <div class="af-info-wrapper">\n        <div class="af-hotel-name">${hotelName}</div>\n        ${addressHtml}\n        <div class="af-links-wrapper">${linksHtml}</div>\n    </div>\n</div>`; }
    
    function showPreview(html) { 
        previewArea.innerHTML = ''; 
        previewSection.hidden = false; 
        previewArea.innerHTML = html; 
        const scriptRegex = /<script>([\s\S]*?)<\/script>/; 
        const scriptMatch = html.match(scriptRegex); 
        if (scriptMatch && scriptMatch[1]) { 
            const scriptElement = document.createElement('script'); 
            scriptElement.textContent = scriptMatch[1]; 
            document.body.appendChild(scriptElement).parentNode.removeChild(scriptElement); 
        } 
        outputSection.scrollIntoView({ behavior: 'smooth' }); 
    }
    
    // ★★★ここから下の2つの関数を修正★★★
    function copyCode() { 
        if (!outputCode.value) { 
            showNotification('先にコードを生成してください。', 'error', 'copyBtnNotification'); 
            return; 
        } 
        navigator.clipboard.writeText(outputCode.value).then(() => { 
            showNotification('コードをクリップボードにコピーしました！', 'success', 'copyBtnNotification'); 
        }).catch(() => { 
            showNotification('コピーに失敗しました。', 'error', 'copyBtnNotification'); 
        }); 
    }
    
    function showNotification(message, type = 'success', targetId) { 
        const notificationEl = document.getElementById(targetId);
        if (!notificationEl) return; 

        notificationEl.className = 'btn-notification'; 
        notificationEl.classList.add(`notification-${type}`);
        notificationEl.textContent = message; 
        
        notificationEl.style.display = 'block'; 
        setTimeout(() => { 
            notificationEl.style.opacity = '1'; 
        }, 10); 
        
        setTimeout(() => { 
            notificationEl.style.opacity = '0'; 
            setTimeout(() => { 
                notificationEl.style.display = 'none'; 
            }, 500); 
        }, 3000); 
    }
});