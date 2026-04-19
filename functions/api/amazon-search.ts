// Cloudflare Pages Function for Amazon Creators API Search Proxy
// Supports both v2.x (Cognito) and v3.x (LwA) credentials via automatic fallback.

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

        clientId = clientId.trim();
        clientSecret = clientSecret.trim();
        partnerTag = partnerTag.trim();

        let accessToken = '';
        let credentialVersion = '2.3'; // Default to FE (Japan) v2.x version
        let authError = null;

        // Step 1: Try Cognito Endpoint (v2.x) as explicitly requested by user
        try {
            const basicAuth = btoa(`${clientId}:${clientSecret}`);
            const cognitoResp = await fetch('https://creatorsapi.auth.us-west-2.amazoncognito.com/oauth2/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Basic ${basicAuth}`
                },
                body: 'grant_type=client_credentials&scope=creatorsapi/default'
            });

            const cognitoData = await cognitoResp.json() as any;
            if (cognitoResp.ok && cognitoData.access_token) {
                accessToken = cognitoData.access_token;
            } else {
                authError = cognitoData;
            }
        } catch (e) {
            console.error('Cognito attempt failed');
        }

        // Step 2: Fallback to LwA Endpoint (v3.x) if Cognito failed or was rejected (common for amzn1 IDs)
        if (!accessToken) {
            try {
                const lwaResp = await fetch('https://api.amazon.com/auth/o2/token', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        grant_type: "client_credentials",
                        client_id: clientId,
                        client_secret: clientSecret,
                        scope: "creatorsapi::default"
                    })
                });
                const lwaData = await lwaResp.json() as any;
                if (lwaResp.ok && lwaData.access_token) {
                    accessToken = lwaData.access_token;
                    credentialVersion = ''; // v3.x doesn't use version header usually
                } else {
                    // If both fail, return the last error (likely the one from Cognito)
                    const details = lwaData.error_description || lwaData.error || authError?.error_description || authError?.error || 'Authentication Failed';
                    return new Response(JSON.stringify({ 
                        error: 'Authentication Failed', 
                        details, 
                        cognitoError: authError, 
                        lwaError: lwaData 
                    }), {
                        status: 401,
                        headers: { 'Content-Type': 'application/json' }
                    });
                }
            } catch (e) {
                return new Response(JSON.stringify({ error: 'Auth pool fallback failed', details: authError }), {
                    status: 502,
                    headers: { 'Content-Type': 'application/json' }
                });
            }
        }

        // Step 3: Call Creators API SearchItems
        const authHeader = credentialVersion 
            ? `Bearer ${accessToken}, Version ${credentialVersion}`
            : `Bearer ${accessToken}`;

        const searchResponse = await fetch('https://creatorsapi.amazon/catalog/v1/searchItems', {
            method: 'POST',
            headers: {
                'Authorization': authHeader,
                'Content-Type': 'application/json',
                'x-marketplace': 'www.amazon.co.jp'
            },
            body: JSON.stringify({
                keywords: keyword,
                marketplace: 'www.amazon.co.jp',
                partnerTag: partnerTag,
                resources: [
                    'itemInfo.title',
                    'images.primary.medium',
                    'offersV2.listings.price'
                ]
            })
        });

        const rawText = await searchResponse.text();
        let searchData: any;
        try {
            searchData = JSON.parse(rawText);
        } catch (e) {
            return new Response(JSON.stringify({ error: 'Search parse failed', status: searchResponse.status, rawBody: rawText }), {
                status: 502,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        if (!searchResponse.ok) {
            return new Response(JSON.stringify({
                error: 'Search API Error',
                status: searchResponse.status,
                details: searchData.message || searchData.error || 'Forbidden',
                rawBody: rawText
            }), {
                status: searchResponse.status,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        return new Response(JSON.stringify(searchData), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (e: any) {
        return new Response(JSON.stringify({ error: 'Internal Server Error', details: e.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
