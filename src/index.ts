import path from "node:path";

type Options = {
  version?: string;
  endpoint?: string;

  /** 取得したアプリケーションIDを指定して下さい。 */
  appId?: string,
  limit?:number,
}

const DEFAULT_OPTIONS: Omit<Required<Options>, 'appId' | 'limit'> = {
  version: '3.0',
  endpoint: 'https://api.e-stat.go.jp/rest/',
}

interface Param {
  /**
   * 取得するデータの言語を 以下のいずれかを指定して下さい。
   * ・J：日本語 (省略値)
   * ・E：英語
   */
  lang?: 'J' | 'E'
}

/**
 * 統計表情報取得パラメータ
 */
interface GetStatsListParam extends Param {
  /**
   * 調査年月
   * 以下のいずれかの形式で指定して下さい。
   * ・yyyy：単年検索
   * ・yyyymm：単月検索
   * ・yyyymm-yyyymm：範囲検索
   */
  surveyYears?: string
  /**
   * 公開年月
   * 調査年月と同様です。
   */
  openYears?: string
  /**
   * 	統計分野	－	以下のいずれかの形式で指定して下さい。
   * ・数値2桁：統計大分類で検索
   * ・数値4桁：統計小分類で検索
   */
  statsField?: string
  /**
   * 政府統計コード	－	以下のいずれかの形式で指定して下さい。
   * ・数値5桁：作成機関で検索
   * ・数値8桁：政府統計コードで検索
   */
  statsCode?: string
  /**
   * 検索キーワード	－	任意の文字列
   * 表題やメタ情報等に含まれている文字列を検索します。
   * AND、OR 又は NOT を指定して複数ワードでの検索が可能です。 (東京 AND 人口、東京 OR 大阪 等)
   */
  searchWord?: string
  /**
   * 検索データ種別	－	検索するデータの種別を指定して下さい。
   * ・1：統計情報(省略値)
   * ・2：小地域・地域メッシュ
   */
  searchKind?: '1' | '2'
  /**
   * 集計地域区分	－	検索するデータの集計地域区分を指定して下さい。
   * ・1：全国
   * ・2：都道府県
   * ・3：市区町村
   */
  collectArea?: '1' | '2' | '3'
  /**
   * 解説情報有無	－	統計表及び、提供統計、提供分類の解説を取得するか否かを以下のいずれかから指定して下さい。
   * ・Y：取得する (省略値)
   * ・N：取得しない
   */
  explanationGetFlg?: 'Y' | 'N'
  /**
   * 統計調査名指定	－	統計表情報でなく、統計調査名の一覧を取得する場合に指定して下さい。
   * ・Y：統計調査名一覧
   * 統計調査名一覧を出力します。
   * statsNameListパラメータを省略した場合、又はY以外の値を設定した場合は統計表情報を出力します。
   */
  statsNameList?: 'Y' | 'N'
  /**
   * データ取得開始位置	－	データの取得開始位置（1から始まる行番号）を指定して下さい。省略時は先頭から取得します。
   * 統計データを複数回に分けて取得する場合等、継続データを取得する開始位置を指定するために指定します。
   * 前回受信したデータの<NEXT_KEY>タグの値を指定します。
   */
  startPosition?: number
  /**
   * データ取得件数	－	データの取得行数を指定して下さい。省略時は10万件です。
   * データ件数が指定したlimit値より少ない場合、全件を取得します。データ件数が指定したlimit値より多い場合（継続データが存在する）は、受信したデータの<NEXT_KEY>タグに継続データの開始行が設定されます。
   */
  limit?: number
  /**
   * 更新日付	－	更新日付を指定します。指定された期間で更新された統計表の情報）を提供します。以下のいずれかの形式で指定して下さい。
   * ・yyyy：単年検索
   * ・yyyymm：単月検索
   * ・yyyymmdd：単日検索
   * ・yyyymmdd-yyyymmdd：範囲検索
   */
  updatedDate?: string
}

/**
 * メタ情報取得パラメータ
 */
interface GetMetaInfoParams extends Param {
  /**
   * 「統計表情報取得」で得られる統計表IDです。
   */
  statsDataId: string
}

/**
 * 統計データ取得パラメータ
 */
type GetStatsDataParams = Param & (
  { dataSetId: string; statsDataId?: never } |
  { dataSetId?: never; statsDataId: string }
) & {
  /**
   * 「データセット登録」で登録したデータセットID です。
   */
  dataSetId?: string
  /**
   * 「統計表情報取得」で得られる統計表IDです。
   */
  statsDataId?: string
  /**
   * 絞り込み条件
   * 表章事項	階層レベル	－	以下のいずれかの形式で指定して下さい。
   * (Xは「メタ情報取得」で得られる各メタ情報の階層レベル)
   * ・X：指定階層レベルのみで絞り込み
   * ・X-X：指定階層レベルの範囲で絞り込み
   * ・-X：階層レベル1 から指定階層レベルの範囲で絞り込み
   * ・X-：指定階層レベルから階層レベル 9 の範囲で絞り込み
   */
  lvTab?: string
  /**
   * 単一コード
   * 特定の項目コードでの絞り込み
   * 「メタ情報取得」で得られる各メタ情報の項目コードを指定して下さい。
   * コードはカンマ区切りで100個まで指定可能です。
   */
  cdTab?: string
  /**
   * コード From
   * 項目コードの範囲で絞り込み
   * 絞り込む範囲の開始位置の項目コードを指定して下さい。
   */
  cdTabFrom?: string
  /**
   * コード To
   * 項目コードの範囲で絞り込み
   * 絞り込む範囲の終了位置の項目コードを指定して下さい。
   */
  cdTabTo?: string
  /**
   * 時間軸事項	階層レベル	－	表章事項の階層レベルと同様です。
   */
  lvTime?: string
  /**
   * 単一コード	－	表章事項の単一コードと同様です。
   */
  cdTime?: string
  /**
   * コード From	－	表章事項のコード Fromと同様です。
   */
  cdTimeFrom?: string
  /**
   * コード To	－	表章事項のコード Toと同様です。
   */
  cdTimeTo?: string
  /**
   * 集計地域事項	階層レベル	－	表章事項の階層レベルと同様です。
   */
  lvArea?: string
  /**
   * 単一コード	－	表章事項の単一コードと同様です。
   */
  cdArea?: string
  /**
   * コード From	－	表章事項のコード Fromと同様です。
   */
  cdAreaFrom?: string
  /**
   * コード To	－	表章事項のコード Toと同様です。
   */
  cdAreaTo?: string
  /**
   * 分類事項01	階層レベル	－	表章事項の階層レベルと同様です。
   */
  lvCat01?: string
  /**
   * 単一コード	－	表章事項の単一コードと同様です。
   */
  cdCat01?: string
  /**
   * コード From	－	表章事項のコード Fromと同様です。
   */
  cdCat01From?: string
  /**
   * コード To	－	表章事項のコード Toと同様です。
   */
  cdCat01To?: string
  /**
   * ・・・	分類事項02 ～ 15	－	分類事項01と同様です。
   */
  lvCat02?: string
  cdCat02?: string
  cdCat02From?: string
  cdCat02To?: string
  lvCat03?: string
  cdCat03?: string
  cdCat03From?: string
  cdCat03To?: string
  lvCat04?: string
  cdCat04?: string
  cdCat04From?: string
  cdCat04To?: string
  lvCat05?: string
  cdCat05?: string
  cdCat05From?: string
  cdCat05To?: string
  lvCat06?: string
  cdCat06?: string
  cdCat06From?: string
  cdCat06To?: string
  lvCat07?: string
  cdCat07?: string
  cdCat07From?: string
  cdCat07To?: string
  lvCat08?: string
  cdCat08?: string
  cdCat08From?: string
  cdCat08To?: string
  lvCat09?: string
  cdCat09?: string
  cdCat09From?: string
  cdCat09To?: string
  lvCat10?: string
  cdCat10?: string
  cdCat10From?: string
  cdCat10To?: string
  lvCat11?: string
  cdCat11?: string
  cdCat11From?: string
  cdCat11To?: string
  lvCat12?: string
  cdCat12?: string
  cdCat12From?: string
  cdCat12To?: string
  lvCat13?: string
  cdCat13?: string
  cdCat13From?: string
  cdCat13To?: string
  lvCat14?: string
  cdCat14?: string
  cdCat14From?: string
  cdCat14To?: string
  lvCat15?: string
  cdCat15?: string
  cdCat15From?: string
  cdCat15To?: string
  /**
   * データ取得開始位置	－	データの取得開始位置（1から始まる行番号）を指定して下さい。
   * 省略時は先頭から取得します。
   * 統計データを複数回に分けて取得する場合等、継続データを取得する開始位置を指定するために指定します。
   * 前回受信したデータのタグの値を指定します。
   */
  startPosition?: number
  /**
   * データ取得件数	－	データの取得行数を指定して下さい。省略時は10万件です。
   * データ件数が指定したlimit値より少ない場合、全件を取得します。データ件数が指定したlimit値より多い場合（継続データが存在する）は、受信したデータのタグに継続データの開始行が設定されます。
   */
  limit?: number
  /**
   * メタ情報有無	－	統計データと一緒にメタ情報を取得するか否かを以下のいずれかから指定して下さい。
   * ・Y：取得する (省略値)
   * ・N：取得しない
   */
  metaGetFlg?: 'Y' | 'N'
  /**
   * 件数取得フラグ	－	指定した場合、件数のみ取得できます。metaGetFlg=Yの場合は、メタ情報も同時に返却されます。
   * ・Y：件数のみ取得する。統計データは取得しない。
   * ・N：件数及び統計データを取得する。(省略値)
   */
  cntGetFlg?: 'Y' | 'N'
}

/**
 * データセット登録パラメータ
 */
type PostDatasetParams = Param & (
  { dataSetId: string; statsDataId?: never } |
  { dataSetId?: never; statsDataId: string }
) & {
  /**
   * 以下のいずれかの形式で指定して下さい。 (Xは「メタ情報取得」で得られる各メタ情報の階層レベル)
   * ・X：指定階層レベルのみで絞り込み
   * ・X-X：指定階層レベルの範囲で絞り込み
   * ・-X：階層レベル1 から指定階層レベルの範囲で絞り込み
   * ・X-：指定階層レベルから階層レベル 9 の範囲で絞り込み
   */
  lvTab?: string
  /**
   * 「メタ情報取得」で得られる各メタ情報の項目コードを指定して下さい。
   * コードはカンマ区切りで100個まで指定可能です。
   */
  cdTab?: string
  /**
   * 絞り込む範囲の開始位置の項目コードを指定して下さい。
   */
  cdTabFrom?: string
  /**
   * 絞り込む範囲の終了位置の項目コードを指定して下さい。
   */
  cdTabTo?: string
  /**
   * 表章事項の階層レベルと同様です。
   */
  lvTime?: string
  /**
   * 表章事項の単一コードと同様です。
   */
  cdTime?: string
  /**
   * 表章事項のコード Fromと同様です。
   */
  cdTimeFrom?: string
  /**
   * 表章事項のコード Toと同様です。
   */
  cdTimeTo?: string
  /**
   * 表章事項の階層レベルと同様です。
   */
  lvArea?: string
  /**
   * 表章事項の単一コードと同様です。
   */
  cdArea?: string
  /**
   * 表章事項のコード Fromと同様です。
   */
  cdAreaFrom?: string
  /**
   * 表章事項のコード Toと同様です。
   */
  cdAreaTo?: string
  /**
   * 表章事項の階層レベルと同様です。
   */
  lvCat01?: string
  /**
   * 表章事項の単一コードと同様です。
   */
  cdCat01?: string
  /**
   * 表章事項のコード Fromと同様です。
   */
  cdCat01From?: string
  /**
   * 表章事項のコード Toと同様です。
   */
  cdCat01To?: string
  /**
   * 分類事項01と同様です。
   */
  lvCat02?: string
  cdCat02?: string
  cdCat02From?: string
  cdCat02To?: string
  lvCat03?: string
  cdCat03?: string
  cdCat03From?: string
  cdCat03To?: string
  lvCat04?: string
  cdCat04?: string
  cdCat04From?: string
  cdCat04To?: string
  lvCat05?: string
  cdCat05?: string
  cdCat05From?: string
  cdCat05To?: string
  lvCat06?: string
  cdCat06?: string
  cdCat06From?: string
  cdCat06To?: string
  lvCat07?: string
  cdCat07?: string
  cdCat07From?: string
  cdCat07To?: string
  lvCat08?: string
  cdCat08?: string
  cdCat08From?: string
  cdCat08To?: string
  lvCat09?: string
  cdCat09?: string
  cdCat09From?: string
  cdCat09To?: string
  lvCat10?: string
  cdCat10?: string
  cdCat10From?: string
  cdCat10To?: string
  lvCat11?: string
  cdCat11?: string
  cdCat11From?: string
  cdCat11To?: string
  lvCat12?: string
  cdCat12?: string
  cdCat12From?: string
  cdCat12To?: string
  lvCat13?: string
  cdCat13?: string
  cdCat13From?: string
  cdCat13To?: string
  lvCat14?: string
  cdCat14?: string
  cdCat14From?: string
  cdCat14To?: string
  lvCat15?: string
  cdCat15?: string
  cdCat15From?: string
  cdCat15To?: string
  /**
   * 登録したデータセットを公開するか否かを指定して下さい。
   * ・0：公開不可 (他の利用者は参照・利用不可) (省略値)
   * ・1：公開可 (他の利用者も参照・利用可)
   */
  openSpecified?: '0' | '1'
  /**
   * 処理モード ※1	－	以下のいずれかを指定して下さい。
   * ・E：登録・更新(新規データセットの登録又は既存データセットの更新) (省略値)
   * ・D：削除(既存データセットの削除)
   */
  processMode?: 'E' | 'D'
  /**
   * データセットの名称、内容、説明等を指定して下さい。
   * 全角で256文字まで指定可能です。
   */
  dataSetName?: string
}

/**
 * データセット参照パラメータ
 */
interface RefDatasetParams extends Param {
  /**
   * 「データセット登録」で登録したデータセットIDです。
   * 省略時は 利用可能なデータセットの一覧を取得します。
   */
  dataSetId?: string
}

/**
 * データカタログ情報取得パラメータ
 */
interface GetDataCatalogParams extends Param {
  /**
   * 調査年月	－	以下のいずれかの形式で指定して下さい。
   * ・yyyy：単年検索
   * ・yyyymm：単月検索
   * ・yyyymm-yyyymm：範囲検索
   */
  surveyYears?: string
  /**
   * 公開年月	－	調査年月と同様です。
   */
  openYears?: string
  /**
   * 統計分野	－	以下のいずれかの形式で指定して下さい。
   * ・数値2桁：統計大分類で検索
   * ・数値4桁：統計小分類で検索
   */
  statsField?: string
  /**
   * 政府統計コード	－	以下のいずれかの形式で指定して下さい。
   * ・数値5桁：作成機関で検索
   * ・数値8桁：政府統計コードで検索
   */
  statsCode?: string
  /**
   * 検索キーワード	－	任意の文字列
   * 表題やメタ情報等に含まれている文字列を検索します。
   * AND 、OR 又は NOT を指定して複数ワードでの検索が可能です。 (東京 AND 人口、東京 OR 大阪 等)
   */
  searchWord?: string
  /**
   * 検索データ形式	－	以下の値を指定して下さい。
   * ・XLS：EXCELファイル
   * ・CSV：CSVファイル
   * ・PDF：PDFファイル
   * ・XML：XMLファイル
   * ・XLS_REP：EXCELファイル（閲覧用）
   * ・DB：統計データベース
   * カンマ区切りで複数指定可能です。
   * 省略時はすべてを指定した場合と同じです。
   */
  dataType?: string
  /**
   * 検索するカタログIDを指定してください。
   */
  catalogId?: string
  /**
   * 検索するカタログリソースIDを指定してください。
   */
  resourceId?: string
  /**
   * データ取得開始位置	－	データの取得開始位置（1から始まる番号）を指定して下さい。省略時は先頭から取得します。
   * 統計データを複数回に分けて取得する場合等、継続データを取得する開始位置（データセット）を指定するために指定します。
   * 前回受信したデータの<NEXT_KEY>タグの値を指定します。
   */
  startPosition?: number
  /**
   * データの取得データセット数を指定して下さい。省略時は100データセットです。
   * データセット数が指定したlimit値より少ない場合、全件を取得します。データセット数が指定したlimit値より多い場合（継続データが存在する）は、受信したデータの<NEXT_KEY>タグに継続データの開始位置が設定されます。
   */
  limit?: number
  /**
   * 更新日付	－	更新日付を指定します。指定された期間で更新されたデータセットの情報を提供します。以下のいずれかの形式で指定して下さい。
   * ・yyyy：単年検索
   * ・yyyymm：単月検索
   * ・yyyymmdd：単日検索
   * ・yyyymmdd-yyyymmdd：範囲検索
   */
  updatedDate?: string
}

const toSearchParams = (appId: string, limit: number, params: Param) => {
  const searchParams = new URLSearchParams()
  searchParams.append('appId', appId)
  searchParams.append('limit', String(limit))
  for (const key in params) {
    const value = params[key as keyof Param]
    if(value !== undefined) {
      searchParams.append(key, value)
    }
  }
  return searchParams.toString()
}

export class Client {
  public options: Required<Options>;
  public baseUrl: string
  constructor(options: Options = {}) {
    const appId = options.appId || process.env.ESTAT_APP_ID
    const limit = options.limit || 10
    if(!appId) throw new Error('appId is required')
    this.options = { appId, limit, ...DEFAULT_OPTIONS, ...options };
    this.baseUrl = path.join(this.options.endpoint, this.options.version, 'app', 'json')
  }

  /**
   * 統計表情報取得
   * @param params 統計表情報取得パラメータ
   * @returns
   */
  async getStatsList(params: GetStatsListParam = {}) {
    const appId = this.options.appId
    const limit = this.options.limit
    const url = path.join(this.baseUrl, `getStatsList?${toSearchParams(appId, limit, params)}`)
    const response = await fetch(url)
    return response.json()
  }

  /**
   * メタ情報取得
   * @param params メタ情報取得パラメータ
   * @returns
   */
  async getMetaInfo(params: GetMetaInfoParams) {
    const appId = this.options.appId
    const limit = this.options.limit
    const url = path.join(this.baseUrl, `getMetaInfo?${toSearchParams(appId, limit, params)}`)
    const response = await fetch(url)
    return response.json()
  }

  /**
   * 統計データ取得
   * @param params 統計データ取得パラメータ
   * @returns
   */
  async getStatsData(params: GetStatsDataParams) {
    const appId = this.options.appId
    const limit = this.options.limit
    const url = path.join(this.baseUrl, `getStatsData?${toSearchParams(appId, limit, params)}`)
    const response = await fetch(url)
    return response.json()
  }

  /**
   * 統計データ取得
   * @param params 統計データ取得パラメータ
   * @returns
   */
  async postDataset(params: PostDatasetParams) {
    const appId = this.options.appId
    // TODO: 未検証
    const url = path.join(this.baseUrl, `postDataset?${toSearchParams(appId, 1000, params)}`)
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
    // TODO: 未検証
    // body: toSearchParams(null, null, params)
    })
    return response.json()
  }

  /**
   * データセット参照
   * @param params データセット参照パラメータ
   * @returns
   */
  async refDataset(params: RefDatasetParams) {
    const appId = this.options.appId
    const limit = this.options.limit
    const url = path.join(this.baseUrl, `refDataset?${toSearchParams(appId, limit, params)}`)
    const response = await fetch(url)
    return response.json()
  }

  /**
   * データカタログ情報取得
   * @param params データカタログ情報取得パラメータ
   * @returns
   */
  async getDataCatalog(params: GetDataCatalogParams) {
    const appId = this.options.appId
    const limit = this.options.limit
    const url = path.join(this.baseUrl, `getDataCatalog?${toSearchParams(appId, limit, params)}`)
    const response = await fetch(url)
    return response.json()
  }
}
