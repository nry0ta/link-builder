/**
 * Cloudflare Pages Middleware
 * Zero Trust Access対応: すべてのリクエストをここで受け取り、
 * /api/* → Pages Functions へ転送
 * それ以外 → 静的アセット（ASSETS binding）へ転送
 * これにより Zero Trust が _routes.json をバイパスしても正しく動作する
 */
export async function onRequest(context: any) {
    const { request, next, env } = context;
    const url = new URL(request.url);

    // API ルートは Functions ハンドラに渡す
    if (url.pathname.startsWith('/api/')) {
        return next();
    }

    // それ以外はすべて静的アセットとして返す
    try {
        const response = await env.ASSETS.fetch(request);
        // 静的ファイルが見つからない場合はindex.htmlを返す (SPA対応)
        if (response.status === 404) {
            return env.ASSETS.fetch(
                new Request(new URL('/', url).toString(), request)
            );
        }
        return response;
    } catch (e: any) {
        // フォールバック: index.html を返す
        return env.ASSETS.fetch(
            new Request(new URL('/', url).toString(), request)
        );
    }
}
