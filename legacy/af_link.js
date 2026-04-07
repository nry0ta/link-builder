// af_link.js

/**
 * 楽天トラベルのアフィリエイトリンクを生成します。
 * @param {string} affiliateId - あなたの楽天アフィリエイトID
 * @param {string} destinationUrl - 遷移先のホテルのURL
 * @returns {string} 生成されたアフィリエイトリンク。IDがない場合は元のURLを返す。
 */
export function createRakutenLink(affiliateId, destinationUrl) {
    if (!affiliateId || !destinationUrl) {
        return destinationUrl || '';
    }
    const encodedUrl = encodeURIComponent(destinationUrl);
    return `https://hb.afl.rakuten.co.jp/hgc/${affiliateId}/?pc=${encodedUrl}&link_type=text&ut=eyJwYWdlIjoidXJsIiwidHlwZSI6InRleHQiLCJjb2wiOjF9`;
}

/**
 * バリューコマース経由のじゃらん検索結果ページへのリンクを生成します。
 * @param {string} sid - バリューコマースのサイトID
 * @param {string} pid - じゃらんnetの広告ID
 * @param {string} keyword - 検索キーワード
 * @returns {string} 生成されたアフィリエイトリンク
 */

export function createJalanLink(sid, pid, keyword) {
    if (!sid || !pid || !keyword) {
        return '';
    }

    // 1. キーワードをShift_JISのバイト配列に変換
    const sjisByteArray = Encoding.convert(keyword, {
        to: 'SJIS',
        from: 'UNICODE'
    });

    // 2. バイト配列をURLエンコード形式 (%83%65%83%58%83%67 など) に変換
    const sjisEncodedKeyword = Encoding.urlEncode(sjisByteArray);

    // 3. 遷移先となる、じゃらんの検索結果ページのURLを組み立てる
    //    (ここでは encodeURIComponent は使わない)
    const jalanSearchUrl = `https://www.jalan.net/uw/uwp2011/uww2011init.do?keyword=${sjisEncodedKeyword}&distCd=01`;

    // 4. 遷移先URL全体を、バリューコマースの仕様に合わせてエンコード
    const encodedJalanUrl = encodeURIComponent(jalanSearchUrl);

    // 5. 最終的なアフィリエイトリンクを組み立てる
    const affiliateLink = `//ck.jp.ap.valuecommerce.com/servlet/referral?sid=${sid}&pid=${pid}&vc_url=${encodedJalanUrl}`;
    
    return affiliateLink;
}

export function createIkkyuLink(sid, pid, keyword) {
    if (!sid || !pid || !keyword) { return ''; }
    
    // 遷移先のURLを作成 (キーワードは標準のUTF-8でエンコード)
    const ikkyuSearchUrl = `https://www.ikyu.com/search?kwd=${encodeURIComponent(keyword)}`;
    
    // 遷移先URL全体をエンコード
    const encodedUrl = encodeURIComponent(ikkyuSearchUrl);

    return `//ck.jp.ap.valuecommerce.com/servlet/referral?sid=${sid}&pid=${pid}&vc_url=${encodedUrl}`;
}

export function createYahooLink(sid, pid, keyword) {
    if (!sid || !pid || !keyword) { return ''; }

    // 遷移先のURLを作成 (キーワードは標準のUTF-8でエンコード)
    const yahooSearchUrl = `https://travel.yahoo.co.jp/search?kwd=${encodeURIComponent(keyword)}`;

    // 遷移先URL全体をエンコード
    const encodedUrl = encodeURIComponent(yahooSearchUrl);
    
    return `//ck.jp.ap.valuecommerce.com/servlet/referral?sid=${sid}&pid=${pid}&vc_url=${encodedUrl}`;
}

/**
 * アクセストレード経由のIHG検索結果ページへのリンクを生成します。
 * @param {string} atRkihg - アクセストレードのrkID
 * @param {string} keyword - 検索キーワード
 * @returns {string} 生成されたアフィリエイトリンク
 */

export function createIHGLink(atRkihg, keyword) {
    if (!atRkihg || !keyword) { return ''; }

    // 遷移先のURLを作成 (キーワードは標準のUTF-8でエンコード)
    const ihgSearchUrl = `https://www.ihg.com/hotels/jp/ja/find-hotels/hotel-search?qDest=${encodeURIComponent(keyword)}`;

    // 遷移先URL全体をエンコード
    const encodedUrl = encodeURIComponent(ihgSearchUrl);
    
    return `https://h.accesstrade.net/sp/cc?rk=${atRkihg}&url=${encodedUrl}`;
}

/**
 * @param {string} lsid - linkshareのID
 */

export function createTripcomLink(lsid) {
    if (!lsid) { return 'nothing'; }

    // tripcomはトップページ遷移のみのため特定リンクのエンコード工程なし
    
    return `https://click.linksynergy.com/fs-bin/click?id=${lsid}&offerid=1664685.2&type=3&subid=0`;
}

