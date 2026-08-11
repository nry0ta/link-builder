// Cloudflare Pages Function for Rakuten Web Service Search Proxy (Ichiba Item Search / Travel KeywordHotelSearch)
// Both APIs now require an applicationId + accessKey pair. accessKey is a per-app secret
// and is therefore never accepted from the client - it is always injected server-side.

const ICHIBA_ITEM_SEARCH_URL = 'https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20260701';
const KEYWORD_HOTEL_SEARCH_URL = 'https://openapi.rakuten.co.jp/engine/api/Travel/KeywordHotelSearch/20260731';

const safeTrim = (val: any): string => {
    if (typeof val === 'string') return val.trim();
    return '';
};

const corsHeaders = (origin: string) => ({
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400',
    'Content-Type': 'application/json'
});

export async function onRequestOptions(context: any) {
    const origin = context.request.headers.get('Origin') || '*';
    return new Response(null, { status: 200, headers: corsHeaders(origin) });
}

// Normalizes a mediumImageUrls entry which may be either a plain URL string
// (current API) or a legacy { imageUrl } object, into a plain URL string.
const extractImageUrl = (entry: any): string | undefined => {
    if (typeof entry === 'string') return entry;
    if (entry && typeof entry === 'object') return entry.imageUrl;
    return undefined;
};

function normalizeItemSearch(data: any) {
    const rawItems = data.items || data.Items || [];
    const items = rawItems.map((raw: any) => {
        const item = raw.item || raw.Item || raw;
        const images = item.mediumImageUrls || item.MediumImageUrls || [];
        return {
            itemCode: item.itemCode,
            itemName: item.itemName,
            itemUrl: item.itemUrl,
            itemPrice: item.itemPrice,
            mediumImageUrls: images.map(extractImageUrl).filter(Boolean),
            shopName: item.shopName
        };
    });
    return { items };
}

function normalizeHotelSearch(data: any) {
    const rawHotels = data.hotels || data.Hotels || [];
    const hotels = rawHotels.map((raw: any) => {
        const nested = Array.isArray(raw.hotel) ? raw.hotel[0] : raw.hotel;
        const basicInfo = raw.hotelBasicInfo || nested?.hotelBasicInfo || raw;
        return {
            hotelNo: basicInfo.hotelNo,
            hotelName: basicInfo.hotelName,
            hotelInformationUrl: basicInfo.hotelInformationUrl,
            hotelImageUrl: basicInfo.hotelImageUrl,
            address1: basicInfo.address1,
            address2: basicInfo.address2
        };
    });
    return { hotels };
}

export async function onRequestGet(context: any) {
    const origin = context.request.headers.get('Origin') || '*';
    const headers = corsHeaders(origin);

    try {
        const requestUrl = new URL(context.request.url);
        const type = requestUrl.searchParams.get('type');
        const keyword = requestUrl.searchParams.get('keyword') || '';
        const page = requestUrl.searchParams.get('page') || '1';
        const hits = requestUrl.searchParams.get('hits') || '5';

        if (type !== 'item' && type !== 'hotel') {
            return new Response(JSON.stringify({ error: 'invalid_type', error_description: 'Invalid type parameter' }), { status: 400, headers });
        }
        if (!keyword) {
            return new Response(JSON.stringify({ error: 'missing_keyword', error_description: 'keyword is required' }), { status: 400, headers });
        }

        const applicationId = safeTrim(requestUrl.searchParams.get('applicationId')) || safeTrim(context.env.RAKUTEN_APP_ID) || safeTrim(context.env.VITE_RAKUTEN_APP_ID);
        const accessKey = safeTrim(context.env.RAKUTEN_ACCESS_KEY);

        if (!applicationId) {
            return new Response(JSON.stringify({ error: 'missing_application_id', error_description: '楽天AppIDが設定されていません。' }), { status: 400, headers });
        }
        if (!accessKey) {
            return new Response(JSON.stringify({ error: 'missing_access_key', error_description: '楽天Access Keyが未設定です。Cloudflare PagesのシークレットにRAKUTEN_ACCESS_KEYを設定してください。' }), { status: 500, headers });
        }

        const upstreamParams = new URLSearchParams({
            format: 'json',
            formatVersion: '2',
            keyword,
            page,
            hits,
            applicationId
        });
        const upstreamUrl = `${type === 'item' ? ICHIBA_ITEM_SEARCH_URL : KEYWORD_HOTEL_SEARCH_URL}?${upstreamParams.toString()}`;

        const upstreamResponse = await fetch(upstreamUrl, {
            headers: { accessKey }
        });
        const data = await upstreamResponse.json() as any;

        if (!upstreamResponse.ok || data.error || data.errors) {
            const code = data.error || data.errors?.errorCode || 'rakuten_api_error';
            const description = data.error_description || data.errors?.errorMessage || `楽天APIエラー (status: ${upstreamResponse.status})`;
            return new Response(JSON.stringify({ error: code, error_description: description }), {
                status: upstreamResponse.status || 502,
                headers
            });
        }

        const normalized = type === 'item' ? normalizeItemSearch(data) : normalizeHotelSearch(data);
        return new Response(JSON.stringify(normalized), { status: 200, headers });
    } catch (e: any) {
        return new Response(JSON.stringify({ error: 'Internal Server Error', details: e.message }), { status: 500, headers });
    }
}
