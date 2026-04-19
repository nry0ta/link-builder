// @ts-ignore
import Encoding from 'encoding-japanese';

/**
 * 楽天トラベルのアフィリエイトリンクを生成します。
 */
export function createRakutenLink(affiliateId: string, destinationUrl: string): string {
    if (!affiliateId || !destinationUrl) {
        return destinationUrl || '';
    }
    const encodedUrl = encodeURIComponent(destinationUrl);
    return `https://hb.afl.rakuten.co.jp/hgc/${affiliateId}/?pc=${encodedUrl}&link_type=text&ut=eyJwYWdlIjoidXJsIiwidHlwZSI6InRleHQiLCJjb2wiOjF9`;
}

/**
 * バリューコマース経由のじゃらん検索結果ページへのリンクを生成します。
 */
export function createJalanLink(sid: string, pid: string, keyword: string): string {
    if (!sid || !pid || !keyword) {
        return '';
    }

    const sjisByteArray = Encoding.convert(keyword, {
        to: 'SJIS',
        from: 'UNICODE',
        type: 'array'
    });

    const sjisEncodedKeyword = Encoding.urlEncode(sjisByteArray);
    const jalanSearchUrl = `https://www.jalan.net/uw/uwp2011/uww2011init.do?keyword=${sjisEncodedKeyword}&distCd=01`;
    const encodedJalanUrl = encodeURIComponent(jalanSearchUrl);
    
    return `https://ck.jp.ap.valuecommerce.com/servlet/referral?sid=${sid}&pid=${pid}&vc_url=${encodedJalanUrl}`;
}

export function createIkkyuLink(sid: string, pid: string, keyword: string): string {
    if (!sid || !pid || !keyword) { return ''; }
    
    const ikkyuSearchUrl = `https://www.ikyu.com/search?kwd=${encodeURIComponent(keyword)}`;
    const encodedUrl = encodeURIComponent(ikkyuSearchUrl);

    return `https://ck.jp.ap.valuecommerce.com/servlet/referral?sid=${sid}&pid=${pid}&vc_url=${encodedUrl}`;
}

export function createYahooLink(sid: string, pid: string, keyword: string): string {
    if (!sid || !pid || !keyword) { return ''; }

    const yahooSearchUrl = `https://travel.yahoo.co.jp/search?kwd=${encodeURIComponent(keyword)}`;
    const encodedUrl = encodeURIComponent(yahooSearchUrl);
    
    return `https://ck.jp.ap.valuecommerce.com/servlet/referral?sid=${sid}&pid=${pid}&vc_url=${encodedUrl}`;
}

/**
 * アクセストレード経由のIHG検索結果ページへのリンクを生成します。
 */
export function createIHGLink(atRkihg: string, keyword: string): string {
    if (!atRkihg || !keyword) { return ''; }

    const ihgSearchUrl = `https://www.ihg.com/hotels/jp/ja/find-hotels/hotel-search?qDest=${encodeURIComponent(keyword)}`;
    const encodedUrl = encodeURIComponent(ihgSearchUrl);
    
    return `https://h.accesstrade.net/sp/cc?rk=${atRkihg}&url=${encodedUrl}`;
}

export function createTripcomLink(lsid: string): string {
    if (!lsid) { return 'nothing'; }
    return `https://click.linksynergy.com/fs-bin/click?id=${lsid}&offerid=1664685.2&type=3&subid=0`;
}

/**
 * Amazonの検索リンクを生成します。
 */
export function createAmazonLink(tag: string, keyword: string): string {
    const base = `https://www.amazon.co.jp/s?k=${encodeURIComponent(keyword)}&linkCode=ll2&tag=${tag || 'default-22'}`;
    return base;
}

/**
 * Yahoo!ショッピングの検索リンクを生成します（バリューコマース経由）。
 */
export function createYahooShoppingLink(sid: string, pid: string, keyword: string): string {
    if (!sid || !pid || !keyword) { return ''; }
    const searchUrl = `https://shopping.yahoo.co.jp/search?p=${encodeURIComponent(keyword)}`;
    return `https://ck.jp.ap.valuecommerce.com/servlet/referral?sid=${sid}&pid=${pid}&vc_url=${encodeURIComponent(searchUrl)}`;
}
