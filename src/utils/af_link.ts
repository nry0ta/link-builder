// @ts-ignore
import Encoding from 'encoding-japanese';

// --------------------------------------------------------------------------
// 楽天トラベル / 楽天トラベル観光体験
// --------------------------------------------------------------------------

/**
 * 楽天トラベルのアフィリエイトリンクを生成します。
 */
export function createRakutenLink(affiliateId: string, destinationUrl: string): string {
    const activeId = affiliateId || (import.meta.env.VITE_RAKUTEN_AFFILIATE_ID as string) || '';
    if (!activeId || !destinationUrl) {
        return destinationUrl || '';
    }
    const encodedUrl = encodeURIComponent(destinationUrl);
    return `https://hb.afl.rakuten.co.jp/hgc/${activeId}/?pc=${encodedUrl}&link_type=text&ut=eyJwYWdlIjoidXJsIiwidHlwZSI6InRleHQiLCJjb2wiOjF9`;
}

/**
 * 楽天トラベル 観光体験のアフィリエイトリンクを生成します。
 */
export function createRakutenActivityLink(affiliateId: string, keyword: string, url?: string): string {
    const targetUrl = url || `https://experience.travel.rakuten.co.jp/search?q=${encodeURIComponent(keyword)}`;
    return createRakutenLink(affiliateId, targetUrl);
}

// --------------------------------------------------------------------------
// バリューコマース (旅行・ホテル)
// --------------------------------------------------------------------------

/**
 * バリューコマース経由のじゃらん検索結果ページへのリンクを生成します。
 */
export function createJalanLink(sid: string, pid: string, keyword: string): string {
    const activeSid = sid || (import.meta.env.VITE_VC_SID as string) || '';
    const activePid = pid || (import.meta.env.VITE_VC_PID_JALAN as string) || '';
    if (!activeSid || !activePid || !keyword) {
        return `https://www.jalan.net/uw/uwp2011/uww2011init.do?keyword=${encodeURIComponent(keyword)}&distCd=01`;
    }

    const sjisByteArray = Encoding.convert(keyword, {
        to: 'SJIS',
        from: 'UNICODE',
        type: 'array'
    });

    const sjisEncodedKeyword = Encoding.urlEncode(sjisByteArray);
    const jalanSearchUrl = `https://www.jalan.net/uw/uwp2011/uww2011init.do?keyword=${sjisEncodedKeyword}&distCd=01`;
    const encodedJalanUrl = encodeURIComponent(jalanSearchUrl);

    return `https://ck.jp.ap.valuecommerce.com/servlet/referral?sid=${activeSid}&pid=${activePid}&vc_url=${encodedJalanUrl}`;
}

export function createIkkyuLink(sid: string, pid: string, keyword: string): string {
    const activeSid = sid || (import.meta.env.VITE_VC_SID as string) || '';
    const activePid = pid || (import.meta.env.VITE_VC_PID_IKKYU as string) || '';
    const ikkyuSearchUrl = `https://www.ikyu.com/search?kwd=${encodeURIComponent(keyword)}`;

    if (!activeSid || !activePid || !keyword) {
        return ikkyuSearchUrl;
    }
    const encodedUrl = encodeURIComponent(ikkyuSearchUrl);
    return `https://ck.jp.ap.valuecommerce.com/servlet/referral?sid=${activeSid}&pid=${activePid}&vc_url=${encodedUrl}`;
}

export function createYahooLink(sid: string, pid: string, keyword: string): string {
    const activeSid = sid || (import.meta.env.VITE_VC_SID as string) || '';
    const activePid = pid || (import.meta.env.VITE_VC_PID_YAHOO as string) || '';
    const yahooSearchUrl = `https://travel.yahoo.co.jp/search?kwd=${encodeURIComponent(keyword)}`;

    if (!activeSid || !activePid || !keyword) {
        return yahooSearchUrl;
    }
    const encodedUrl = encodeURIComponent(yahooSearchUrl);
    return `https://ck.jp.ap.valuecommerce.com/servlet/referral?sid=${activeSid}&pid=${activePid}&vc_url=${encodedUrl}`;
}

// --------------------------------------------------------------------------
// バリューコマース (アクティビティ・体験)
// --------------------------------------------------------------------------

/**
 * Klookアフィリエイトリンクを生成します（公式アソシエイトまたはバリューコマース）。
 */
export function createKlookLink(priority: string, sid: string, pid: string, aid: string, adid: string, keyword: string, url?: string): string {
    const targetUrl = url || `https://www.klook.com/ja/search/result/?query=${encodeURIComponent(keyword)}`;
    const activePriority = priority || (import.meta.env.VITE_KLOOK_PRIORITY as string) || 'valuecommerce';

    if (activePriority === 'official') {
        const activeAid = aid || (import.meta.env.VITE_KLOOK_AID as string) || '';
        const activeAdid = adid || (import.meta.env.VITE_KLOOK_ADID as string) || '';
        if (!activeAid || !activeAdid) return targetUrl;
        return `https://affiliate.klook.com/redirect?aid=${activeAid}&aff_adid=${activeAdid}&k_site=${encodeURIComponent(targetUrl)}`;
    } else {
        const activeSid = sid || (import.meta.env.VITE_VC_SID as string) || '';
        const activePid = pid || (import.meta.env.VITE_VC_PID_KLOOK as string) || '';
        if (!activeSid || !activePid) return targetUrl;
        return `https://ck.jp.ap.valuecommerce.com/servlet/referral?sid=${activeSid}&pid=${activePid}&vc_url=${encodeURIComponent(targetUrl)}`;
    }
}

/**
 * バリューコマース経由のKKdayリンクを生成します。
 */
export function createKkdayLink(sid: string, pid: string, keyword: string, url?: string): string {
    const activeSid = sid || (import.meta.env.VITE_VC_SID as string) || '';
    const activePid = pid || (import.meta.env.VITE_VC_PID_KKDAY as string) || '';
    const targetUrl = url || `https://www.kkday.com/ja/product/productlist?keyword=${encodeURIComponent(keyword)}`;

    if (!activeSid || !activePid) return targetUrl;
    return `https://ck.jp.ap.valuecommerce.com/servlet/referral?sid=${activeSid}&pid=${activePid}&vc_url=${encodeURIComponent(targetUrl)}`;
}

/**
 * バリューコマース経由のアソビュー！リンクを生成します。
 */
export function createAsoviewLink(sid: string, pid: string, keyword: string, url?: string): string {
    const activeSid = sid || (import.meta.env.VITE_VC_SID as string) || '';
    const activePid = pid || (import.meta.env.VITE_VC_PID_ASOVIEW as string) || '';
    
    // アソビューは自動検索が使えないため、指定がなければ公式トップページにフォールバック
    const targetUrl = url || `https://www.asoview.com/`;

    if (!activeSid || !activePid) return targetUrl;
    return `https://ck.jp.ap.valuecommerce.com/servlet/referral?sid=${activeSid}&pid=${activePid}&vc_url=${encodeURIComponent(targetUrl)}`;
}

/**
 * バリューコマース経由のじゃらん遊び・体験リンクを生成します。
 */
export function createJalanActivityLink(sid: string, pid: string, keyword: string, url?: string): string {
    const activeSid = sid || (import.meta.env.VITE_VC_SID as string) || '';
    const activePid = pid || (import.meta.env.VITE_VC_PID_JALAN_ACTIVITY as string) || '';
    
    // じゃらん体験も自動検索が使えないため、指定がなければ体験トップページにフォールバック
    const targetUrl = url || `https://www.jalan.net/activity/`;

    if (!activeSid || !activePid) return targetUrl;
    return `https://ck.jp.ap.valuecommerce.com/servlet/referral?sid=${activeSid}&pid=${activePid}&vc_url=${encodeURIComponent(targetUrl)}`;
}

/**
 * リンクシェア経由のTrip.com 体験リンクを生成します（バリューコマース枠はありません）。
 */
export function createTripcomActivityLink(lsid: string, keyword: string, url?: string): string {
    const targetUrl = url || `https://jp.trip.com/things-to-do/search?keyword=${encodeURIComponent(keyword)}`;

    const activeLsid = lsid || (import.meta.env.VITE_TRIPCOM_LSID as string) || '';
    if (activeLsid) {
        return `https://click.linksynergy.com/deeplink?id=${activeLsid}&mid=1664685&murl=${encodeURIComponent(targetUrl)}`;
    }

    return targetUrl;
}

// --------------------------------------------------------------------------
// アクセストレード / リンクシェア / A8
// --------------------------------------------------------------------------

/**
 * アクセストレード経由のIHG検索結果ページへのリンクを生成します。
 */
export function createIHGLink(atRkihg: string, keyword: string): string {
    const activeRk = atRkihg || (import.meta.env.VITE_AT_RK_IHG as string) || '';
    const ihgSearchUrl = `https://www.ihg.com/hotels/jp/ja/find-hotels/hotel-search?qDest=${encodeURIComponent(keyword)}`;
    if (!activeRk || !keyword) {
        return ihgSearchUrl;
    }
    const encodedUrl = encodeURIComponent(ihgSearchUrl);
    return `https://h.accesstrade.net/sp/cc?rk=${activeRk}&url=${encodedUrl}`;
}

/**
 * リンクシェア経由のTrip.com宿泊リンクを生成します。
 */
export function createTripcomLink(lsid: string): string {
    const activeLsid = lsid || (import.meta.env.VITE_TRIPCOM_LSID as string) || '';
    if (!activeLsid) {
        return 'https://jp.trip.com/';
    }
    return `https://click.linksynergy.com/fs-bin/click?id=${activeLsid}&offerid=1664685.2&type=3&subid=0`;
}

// --------------------------------------------------------------------------
// Amazon / 楽天市場 / Yahoo!ショッピング / Anker
// --------------------------------------------------------------------------

/**
 * Amazonのリンクを生成します。
 */
export function createAmazonLink(tag: string, keyword: string, asin?: string): string {
    const activeTag = tag || (import.meta.env.VITE_AMAZON_TRACKING_ID as string) || 'default-22';
    if (asin) {
        return `https://www.amazon.co.jp/dp/${asin}?tag=${activeTag}&linkCode=ll1`;
    }
    return `https://www.amazon.co.jp/s?k=${encodeURIComponent(keyword)}&linkCode=ll2&tag=${activeTag}`;
}

/**
 * Amazonの検索リンクを生成します（バリューコマース経由）。
 */
export function createValueCommerceAmazonLink(sid: string, pid: string, keyword: string): string {
    const activeSid = sid || (import.meta.env.VITE_VC_SID as string) || '';
    const activePid = pid || (import.meta.env.VITE_VC_PID_AMAZON as string) || '';
    const searchUrl = `https://www.amazon.co.jp/s?k=${encodeURIComponent(keyword)}`;

    if (!activeSid || !activePid || !keyword) {
        return searchUrl;
    }
    return `https://ck.jp.ap.valuecommerce.com/servlet/referral?sid=${activeSid}&pid=${activePid}&vc_url=${encodeURIComponent(searchUrl)}`;
}

/**
 * Ankerの検索リンクを生成します（バリューコマース経由）。
 */
export function createAnkerLink(sid: string, pid: string, keyword: string): string {
    const activeSid = sid || (import.meta.env.VITE_VC_SID as string) || '';
    const activePid = pid || (import.meta.env.VITE_VC_PID_ANKER as string) || '';
    const searchUrl = `https://www.ankerjapan.com/search?type=product&filter.v.availability=1&q=${encodeURIComponent(keyword)}`;

    if (!activeSid || !activePid || !keyword) {
        return searchUrl;
    }
    return `https://ck.jp.ap.valuecommerce.com/servlet/referral?sid=${activeSid}&pid=${activePid}&vc_url=${encodeURIComponent(searchUrl)}`;
}

/**
 * 楽天市場の検索リンクを生成します。
 */
export function createRakutenSearchLink(affiliateId: string, keyword: string): string {
    const searchUrl = `https://search.rakuten.co.jp/search/mall/${encodeURIComponent(keyword)}/`;
    return createRakutenLink(affiliateId, searchUrl);
}

/**
 * Yahoo!ショッピングの検索リンクを生成します（バリューコマース経由）。
 */
export function createYahooShoppingLink(sid: string, pid: string, keyword: string): string {
    const activeSid = sid || (import.meta.env.VITE_VC_SID as string) || '';
    const activePid = pid || (import.meta.env.VITE_YAHOO_PID as string) || '';
    const searchUrl = `https://shopping.yahoo.co.jp/search/${encodeURIComponent(keyword)}/0/`;

    if (!activeSid || !activePid || !keyword) {
        return searchUrl;
    }
    return `https://ck.jp.ap.valuecommerce.com/servlet/referral?sid=${activeSid}&pid=${activePid}&vc_url=${encodeURIComponent(searchUrl)}`;
}
