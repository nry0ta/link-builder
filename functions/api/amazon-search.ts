// Cloudflare Pages Function for Amazon Creators API Search Proxy
// Uses OAuth 2.0 (Client Credentials Grant) with scope: creatorsapi::default

export async function onRequestPost(context: any) {
    try {
        const body = await context.request.json() as any;
        let { keyword, clientId, clientSecret, partnerTag } = body;

        if (!keyword || !clientId || !clientSecret || !partnerTag) {
            return new Response(JSON.stringify({ error: 'Missing required parameters' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Remove accidental whitespaces
        clientId = clientId.trim();
        clientSecret = clientSecret.trim();
        partnerTag = partnerTag.trim();

        // Step 1: Obtain Access Token using OAuth 2.0 (Japanese marketplace endpoint)
        const tokenResponse = await fetch('https://api.amazon.co.jp/auth/o2/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `grant_type=client_credentials&client_id=${encodeURIComponent(clientId)}&client_secret=${encodeURIComponent(clientSecret)}&scope=creatorsapi%3A%3Adefault`
        });

        const tokenData = await tokenResponse.json() as any;

        if (!tokenResponse.ok || !tokenData.access_token) {
            return new Response(JSON.stringify({
                error: 'Authentication Failed',
                details: tokenData.error_description || tokenData.error || 'Invalid Client ID or Secret'
            }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const accessToken = tokenData.access_token;

        // Step 2: Call Creators API SearchItems
        const payload = {
            keywords: keyword,
            marketplace: 'www.amazon.co.jp',
            partnerTag: partnerTag,
            resources: [
                'itemInfo.title',
                'images.primary.medium',
                'offersV2.listings.price'
            ]
        };

        const searchResponse = await fetch('https://creatorsapi.amazon.com/catalog/v1/searchItems', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
                'x-marketplace': 'www.amazon.co.jp'
            },
            body: JSON.stringify(payload)
        });

        const searchData = await searchResponse.json();

        return new Response(JSON.stringify(searchData), {
            status: searchResponse.status,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (e: any) {
        return new Response(JSON.stringify({ error: 'Internal Server Error', details: e.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
