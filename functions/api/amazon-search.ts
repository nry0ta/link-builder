// Cloudflare Pages Function for Amazon Creators API Search Proxy
// Uses Amazon Cognito OAuth 2.0 (Client Credentials Grant)

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

        // Step 1: Obtain Access Token using OAuth 2.0 (Cognito Basic Auth)
        // Japan (FE) region uses ap-northeast-1
        const basicAuth = btoa(`${clientId}:${clientSecret}`);

        let tokenResponse: Response;
        try {
            tokenResponse = await fetch('https://creatorsapi.auth.ap-northeast-1.amazoncognito.com/oauth2/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Basic ${basicAuth}`
                },
                body: `grant_type=client_credentials&scope=creatorsapi/default`
            });
        } catch (fetchErr: any) {
            return new Response(JSON.stringify({ error: 'Token fetch failed', details: fetchErr.message }), {
                status: 502,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        let tokenData: any;
        let rawTokenText = '';
        try {
            rawTokenText = await tokenResponse.text();
            tokenData = JSON.parse(rawTokenText);
        } catch {
            return new Response(JSON.stringify({ error: 'Token parse failed', status: tokenResponse.status, rawBody: rawTokenText }), {
                status: 502,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        if (!tokenResponse.ok || !tokenData.access_token) {
            return new Response(JSON.stringify({
                error: 'Authentication Failed',
                details: tokenData.error_description || tokenData.error || 'Invalid Client ID or Secret',
                rawBody: rawTokenText
            }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const accessToken = tokenData.access_token;
        const credentialVersion = '2.3'; // FE Region version

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

        let searchResponse: Response;
        try {
            searchResponse = await fetch('https://creatorsapi.amazon/catalog/v1/searchItems', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}, Version ${credentialVersion}`,
                    'Content-Type': 'application/json',
                    'x-marketplace': 'www.amazon.co.jp'
                },
                body: JSON.stringify(payload)
            });
        } catch (fetchErr: any) {
            return new Response(JSON.stringify({ error: 'Search fetch failed', details: fetchErr.message }), {
                status: 502,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        let searchData: any;
        let rawText = '';
        try {
            rawText = await searchResponse.text();
            searchData = JSON.parse(rawText);
        } catch (parseErr: any) {
            return new Response(JSON.stringify({ 
                error: 'Search parse failed', 
                status: searchResponse.status, 
                rawBody: rawText,
                parseError: parseErr.message
            }), {
                status: 502,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        return new Response(JSON.stringify(searchData), {
            status: searchResponse.status,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (e: any) {
        return new Response(JSON.stringify({ error: 'Internal Server Error', details: e.message, stack: e.stack }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
