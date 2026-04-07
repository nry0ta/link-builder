document.addEventListener('DOMContentLoaded', () => {
    // --- DOM要素の取得 ---
    const rakutenAppIdInput = document.getElementById('rakutenAppId');
    const rakutenAffiliateIdInput = document.getElementById('rakutenAffiliateId');
    // ▼▼▼ 追加 ▼▼▼
    const vcSidInput = document.getElementById('vcSid');
    const vcPidJalanInput = document.getElementById('vcPidJalan');
    const vcPidIkkyuInput = document.getElementById('vcPidIkkyu');
    const vcPidYahooInput = document.getElementById('vcPidYahoo');
    const atRkihgInput = document.getElementById('atRkihg');
    const lsid = document.getElementById('lsid')

    const saveButton = document.getElementById('saveButton');
    const notificationArea = document.getElementById('notificationArea');

    // ページ読み込み時に、保存されている値を読み込んで表示する
    loadSettings();

    // 保存ボタンが押されたら、入力値を保存する
    saveButton.addEventListener('click', saveSettings);

    function loadSettings() {
        const settings = JSON.parse(localStorage.getItem('linkBuilderSettings')) || {};
        rakutenAppIdInput.value = settings.rakutenAppId || '';
        rakutenAffiliateIdInput.value = settings.rakutenAffiliateId || '';
        // ▼▼▼ 追加 ▼▼▼
        vcSidInput.value = settings.vcSid || '';
        vcPidJalanInput.value = settings.vcPidJalan || '';
        vcPidIkkyuInput.value = settings.vcPidIkkyu || '';
        vcPidYahooInput.value = settings.vcPidYahoo || '';
        atRkihgInput.value = settings.atRkihg || '';
        lsid.value = settings.lsid || '';
    }

    function saveSettings() {
        const settings = {
            rakutenAppId: rakutenAppIdInput.value.trim(),
            rakutenAffiliateId: rakutenAffiliateIdInput.value.trim(),
            // ▼▼▼ 追加 ▼▼▼
            vcSid: vcSidInput.value.trim(),
            vcPidJalan: vcPidJalanInput.value.trim(),
            vcPidIkkyu: vcPidIkkyuInput.value.trim(),
            vcPidYahoo: vcPidYahooInput.value.trim(),
            atRkihg: atRkihgInput.value.trim(),
            lsid: lsid.value.trim(),
        };
        
        localStorage.setItem('linkBuilderSettings', JSON.stringify(settings));
        showNotification('設定を保存しました。');
    }

    function showNotification(message) {
        notificationArea.textContent = message;
        notificationArea.className = 'notification-success';
        notificationArea.style.display = 'block';
        setTimeout(() => {
            notificationArea.style.opacity = '1';
        }, 10);

        setTimeout(() => {
            notificationArea.style.opacity = '0';
            setTimeout(() => {
                notificationArea.style.display = 'none';
            }, 500);
        }, 3000);
    }
});