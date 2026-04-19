// Cloudflare Pages Function for Amazon Creators API Search Proxy
// Uses standard OAuth 2.0 (Client Credentials Grant)

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

        // Step 1: Obtain Access Token using OAuth 2.0
        const tokenResponse = await fetch('https://api.amazon.com/auth/o2/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `grant_type=client_credentials&client_id=${clientId}&client_secret=${clientSecret}`
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

        // Step 2: Call PA-API SearchItems with the Access Token
        const host = 'webservices.amazon.co.jp';
        const target = 'com.amazon.paapi5.v1.ProductAdvertisingAPIv1.SearchItems';
        const uri = '/paapi5/searchitems';

        const payload = {
            Keywords: keyword,
            Resources: [
                'Images.Primary.Medium',
                'ItemInfo.Title',
                'Offers.Listings.Price'
            ],
            PartnerTag: partnerTag,
            PartnerType: 'Associates',
            Marketplace: 'www.amazon.co.jp'
        };

        const searchResponse = await fetch(`https://${host}${uri}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json; charset=utf-8',
                'Content-Encoding': 'amz-1.0',
                'X-Amz-Target': target,
                'Host': host
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
