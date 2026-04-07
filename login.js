// login.js
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('loginForm');
    const messageElement = document.getElementById('message');
    
    // Workersの新しい認証エンドポイント
    const AUTH_API_URL = 'https://buildastay-system.nrtlog.com/api/v1/auth/login';

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        messageElement.textContent = '';
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch(AUTH_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                // 認証成功！リダイレクト先に移動
                window.location.href = data.redirect;
            } else {
                messageElement.textContent = data.message || 'ログイン情報が正しくありません。';
            }
        } catch (error) {
            messageElement.textContent = 'ネットワークエラーが発生しました。';
            console.error(error);
        }
    });
});