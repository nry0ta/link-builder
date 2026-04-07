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
        from: 'UNICODE'
    });

    const sjisEncodedKeyword = Encoding.urlEncode(sjisByteArray);
    const jalanSearchUrl = `https://www.jalan.net/uw/uwp2011/uww2011init.do?keyword=${sjisEncodedKeyword}&distCd=01`;
    const encodedJalanUrl = encodeURIComponent(jalanSearchUrl);
    
    return `//ck.jp.ap.valuecommerce.com/servlet/referral?sid=${sid}&pid=${pid}&vc_url=${encodedJalanUrl}`;
}

export function createIkkyuLink(sid: string, pid: string, keyword: string): string {
    if (!sid || !pid || !keyword) { return ''; }
    
    const ikkyuSearchUrl = `https://www.ikyu.com/search?kwd=${encodeURIComponent(keyword)}`;
    const encodedUrl = encodeURIComponent(ikkyuSearchUrl);

    return `//ck.jp.ap.valuecommerce.com/servlet/referral?sid=${sid}&pid=${pid}&vc_url=${encodedUrl}`;
}

export function createYahooLink(sid: string, pid: string, keyword: string): string {
    if (!sid || !pid || !keyword) { return ''; }

    const yahooSearchUrl = `https://travel.yahoo.co.jp/search?kwd=${encodeURIComponent(keyword)}`;
    const encodedUrl = encodeURIComponent(yahooSearchUrl);
    
    return `//ck.jp.ap.valuecommerce.com/servlet/referral?sid=${sid}&pid=${pid}&vc_url=${encodedUrl}`;
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
