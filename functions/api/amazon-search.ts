// Cloudflare Pages Function for Amazon PA-API Search Proxy
// Uses Web Crypto API for AWS Signature V4

export async function onRequestPost(context: any) {
    try {
        const body = await context.request.json() as any;
        let { keyword, accessKey, secretKey, partnerTag } = body;

        if (!keyword || !accessKey || !secretKey || !partnerTag) {
            return new Response(JSON.stringify({ error: 'Missing required parameters' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Remove accidental whitespaces
        accessKey = accessKey.trim();
        secretKey = secretKey.trim();
        partnerTag = partnerTag.trim();

        const host = 'webservices.amazon.co.jp';
        const region = 'us-west-2'; // Amazon PA-API uses us-west-2 regardless of the marketplace
        const service = 'ProductAdvertisingAPI';
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

        const payloadStr = JSON.stringify(payload);

        // AWS Signature V4 Headers preparation
        const now = new Date();
        const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
        const dateStamp = amzDate.substring(0, 8);

        // Hashing helpers using Web Crypto
        const hash = async (str: string) => {
            const buffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
            return Array.from(new Uint8Array(buffer as ArrayBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
        };

        const hmac = async (key: CryptoKey | Uint8Array, data: string): Promise<Uint8Array> => {
            const cryptoKey = key instanceof CryptoKey 
                ? key 
                : await crypto.subtle.importKey('raw', key as any, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
            const buffer = await crypto.subtle.sign('HMAC', cryptoKey, new TextEncoder().encode(data));
            return new Uint8Array(buffer as ArrayBuffer);
        };

        const hexHmac = async (key: CryptoKey | Uint8Array, data: string): Promise<string> => {
            const result = await hmac(key, data);
            return Array.from(result).map(b => b.toString(16).padStart(2, '0')).join('');
        };

        const getSignatureKey = async (key: string, dateStamp: string, regionName: string, serviceName: string) => {
            const kDate = await hmac(new TextEncoder().encode("AWS4" + key), dateStamp);
            const kRegion = await hmac(kDate, regionName);
            const kService = await hmac(kRegion, serviceName);
            const kSigning = await hmac(kService, "aws4_request");
            return kSigning;
        };

        // Task 1: Create a Canonical Request
        const method = 'POST';
        const canonicalUri = uri;
        const canonicalQuerystring = '';
        const canonicalHeaders = `content-encoding:amz-1.0\ncontent-type:application/json; charset=utf-8\nhost:${host}\nx-amz-date:${amzDate}\nx-amz-target:${target}\n`;
        const signedHeaders = 'content-encoding;content-type;host;x-amz-date;x-amz-target';
        const payloadHash = await hash(payloadStr);
        const canonicalRequest = `${method}\n${canonicalUri}\n${canonicalQuerystring}\n${canonicalHeaders}\n${signedHeaders}\n${payloadHash}`;

        // Task 2: Create the String to Sign
        const algorithm = 'AWS4-HMAC-SHA256';
        const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
        const stringToSign = `${algorithm}\n${amzDate}\n${credentialScope}\n${await hash(canonicalRequest)}`;

        // Task 3: Calculate the Signature
        const signingKey = await getSignatureKey(secretKey, dateStamp, region, service);
        const signature = await hexHmac(signingKey, stringToSign);

        // Task 4: Add signing information to the request
        const authorizationHeader = `${algorithm} Credential=${accessKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

        const headers = new Headers();
        headers.append('Content-Encoding', 'amz-1.0');
        headers.append('Content-Type', 'application/json; charset=utf-8');
        headers.append('Host', host);
        headers.append('X-Amz-Date', amzDate);
        headers.append('X-Amz-Target', target);
        headers.append('Authorization', authorizationHeader);

        // Fire Request
        const response = await fetch(`https://${host}${uri}`, {
            method: 'POST',
            headers: headers,
            body: payloadStr
        });

        const data = await response.json();
        
        return new Response(JSON.stringify(data), {
            status: response.status,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (e: any) {
        return new Response(JSON.stringify({ error: 'Internal Server Error', details: e.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};
