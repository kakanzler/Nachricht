---
name: collect-events
description: Nachricht 用に、日本国内・オンラインの IT カンファレンス／勉強会を Web から調べて data/events.json を更新する。「イベントを集めて」「実データに更新」「events.json を更新」などのときに使う。
---

# collect-events

ITイベントポータル Nachricht のデータ `data/events.json` を、Web 上の実データで更新する。

## 1. 準備
- `data/events.json` を読み、既存のイベントと使われているタグ名を把握する。
- 今日の日付を確認し、収集期間を **今日〜約3か月先** とする。
  - **例外: 大型の展示会・カンファレンスは今日〜6か月先まで拾う。** Japan IT Week、AWS Summit Japan、Developers Summit、KubeCon Japan、SRE Kaigi のように、数千人規模か毎年恒例の旗艦イベントが対象。半年先の大型イベントが見えていること自体がポータルの価値になるため。

## 2. 情報源（起点）
以下をすべて確認したうえで、Web 検索でさらに広げる。

**総合**
- connpass カンファレンス特集: https://connpass.com/feature/conference/
- CodeZine「ITエンジニア向け大規模イベントリスト」連載: https://codezine.jp/article/detail/30386
  - 毎月「YYYY年M月に開催される注目の…」の記事が出る。記事の末尾にある連載一覧から最新月の記事をたどる。
- **Findy Conference: https://conference.findy-code.io/events** — 「日本のテックカンファレンスを集約」した一覧（2ページ程度）。SRE Kaigi、Developers Summit なども載る。connpass 特集と並ぶ柱。
  - 一覧と詳細ページはどちらも表示時に中身を組み立てる作りなので、fetch ではなくブラウザで開く。
  - 詳細ページ（`/events/<slug>/<id>`）の「開催日時」「開催場所」の欄には、日付と形式（ハイブリッド／オフライン）しか出ない。時刻と会場は、同じページの「LP」欄にある公式サイトで裏付けを取る。
- **ビジネス+IT: https://www.sbbit.jp/eventinfo** — 開催予定が数百件あるが、製造業・金融・GX・CRM など経営層向けの DX セミナーが大半。**タイトルにセキュリティ・インフラ・クラウド・開発系の言葉があるカンファレンス／サミットだけ**採る。詳細ページの「日時」「会場」「開催形態」の欄を使う。トップのスライドはクリック先がずれることがあるので、リンクは一覧の各行から取る。
- TECH PLAY: https://techplay.jp/event — 企業主催のオンラインカンファレンスを拾う。「Conference」「カンファレンス」で検索する。
- Doorkeeper: https://www.doorkeeper.jp/events — 企業の販促ウェビナーが多いので、カンファレンス級だけ採用する。
- dev.events（日本）: https://dev.events/AS/JP/tech — 海外系・英語のカンファレンス。分野別のページもある（`/AS/JP/sre`、`/AS/JP/cloud` など）。

**AWS・クラウド・インフラ（重点）**
- JAWS-UG 公式: https://jaws-ug.jp/ — トップページの「開催予定のイベント」に、支部の勉強会が並ぶ。
- AWS イベントとウェビナー: https://aws.amazon.com/jp/events/ — AWS Summit Japan、JumpStart などの公式イベント。
- CloudNative Days: https://cloudnativedays.jp/ — 次回開催の告知を確認する。
- **Japan IT Week: https://www.japan-it.jp/it/ja-jp/visit/ist.html** — 情報セキュリティ EXPO の来場案内。春（東京ビッグサイト）・夏・秋（幕張メッセ）・大阪の年4回の会期が載っている。6か月の例外の対象。開場時間はこのページに無いので、見つからなければ `timeTbd: true` にする。
- SRE Kaigi: `https://<年>.srekaigi.net/`（例: https://2027.srekaigi.net/）
- Google Cloud Webinars: https://cloudonair.withgoogle.com/ — Cookie の同意画面が出たら「同意しない」を選ぶ。
- connpass のキーワード検索: `AWS`、`インフラ`、`SRE`、`Kubernetes`、`クラウド`、`Platform Engineering`

### 取得のコツ（2026-11 時点で確認済み）
- connpass と CodeZine は **WebFetch では読めない**（connpass は本文が空の 202、CodeZine は 403）。Claude in Chrome が使えるならブラウザで開いて読む。CodeZine は最初に「アクセス確認」画面が出るが、数秒待てば本文が表示される。CAPTCHA が出たら突破せず、そのサイトは飛ばす。
- connpass の一覧から各イベントの URL を集めるには、ページ上で `a[href*="/event/"]` を集める JS が速い。
- connpass のイベントページでは、`[class*="schedule"]` 要素に日時、`[class*="place"]` 要素に会場が入っている。ページ内に「オンライン配信」「ハイブリッド」の記載があるかどうかで `mode` を決める。
- connpass の期間指定検索: `https://connpass.com/search/?q=カンファレンス&start_from=YYYY/MM/DD&start_to=YYYY/MM/DD`
- 同じタブで連続して開くときは、ページ遷移の直後に1秒ほど待ってから JS を実行する（待たないと評価中に遷移してエラーになる）。
- **connpass 検索は一括取得できる**: connpass.com のページを開いた状態なら、`fetch('/search/?q=...&start_from=...&start_to=...&page=N')` が同一オリジンで通る。`DOMParser` で `.event_list` を解析すると、定員（`n/m人`）とタイトルで一気にふるいにかけられる。キーワード × 4〜5ページを回し、定員 100 人以上か、タイトルに Kaigi / Summit / Conference / カンファレンス / Day / JAWS を含むものだけ残す。各イベントページはグループのサブドメインにあり、fetch ではアクセスが拒否される（CORS）ので、残った候補だけブラウザで開いて裏付けを取る。
- **JAWS-UG**: トップページのカレンダーのリンク先は Google カレンダーなので、イベントページへは connpass 検索（`q=JAWS`）から行く。支部のもくもく会のような少人数の会は除き、大型・オンライン配信・定番企画（re:Invent 関連、大晦日の LT など）を採る。
- **dev.events**: 詳細ページ `/conferences/<slug>` を同一オリジンで fetch すると公式 URL が取れる。リンク先が `principal.dev`（広告）のものは公式 URL ではないので、別途調べる。
- **AWS 公式のイベントページ**（aws.amazon.com/jp/events/）は 2026-11 時点で 2025 年の内容のまま更新されておらず、日本の予定は取れなかった。AWS Summit Japan などは、個別の告知ページか Web 検索で探す。
- **Google Cloud Webinars** は海外向けのウェビナーが中心で、2026-11 時点では日本のイベントが見当たらなかった。
- **TECH PLAY / Doorkeeper**: 「カンファレンス」で検索すると、企業主催の大型イベントが拾える。イベントページの「開催日時」「開催形式」「会場」の行をそのまま使う。

追加の探し方の例:
- `"カンファレンス" 2027年1月 エンジニア`、`Tech Conference Japan <月>` のような検索
- 各カンファレンスの公式サイト、TECH PLAY、Doorkeeper、connpass のイベントページ
- 主要テーマ（AI / Cloud / Security / Frontend / Data / SRE / Mobile など）ごとの検索

## 3. 採用基準
- 日本国内での開催、またはオンライン開催。
- 「カンファレンス規模」または「参加者 30 人以上の勉強会」を優先する。
- **日時・形式・会場は、各イベントの公式ページ（または申込ページ）で裏付けが取れたものだけ書く。** まとめ記事だけを根拠にしない。推測で埋めない。
- 日付が確認できても時刻が分からないときは、公式ページにある開場・開始時刻を使う。どうしても分からなければ `start` を `T10:00:00+09:00`（複数日なら `end` を最終日の `T18:00:00+09:00`）とし、**`"timeTbd": true`** を付ける。画面には「時刻未定」と表示され、カレンダー登録は終日予定になる。
- 都市名しか分からないときは、`venue` に都市名（例: `東京`）を入れ、**`"venueTbd": true`** を付ける。
- 複数日にわたるイベントは、`start` を初日の開始、`end` を最終日の終了にする。

## 4. スキーマ（`lib/schema.ts` が正）
```json
{
  "id": "一意な slug (例: connpass-123456 / jsconf-jp-2026)",
  "title": "イベント名",
  "url": "公式ページの URL (https://...)",
  "start": "2026-11-27T18:00:00+09:00",
  "end": "2026-11-27T20:00:00+09:00",
  "timeTbd": "true のときのみ書く (時刻未確認)",
  "mode": "offline | online | hybrid",
  "venue": "会場名 (offline / hybrid のときのみ)",
  "venueTbd": "true のときのみ書く (都市名しか分からない)",
  "tags": ["AI", "Security"],
  "source": "connpass | codezine | findy | sbbit | techplay | doorkeeper | dev.events | jaws-ug | japan-it-week | official | web",
  "description": "1〜2 文の概要 (任意)"
}
```
- 日時は必ず `+09:00` 付きの ISO 8601 で書く。
- `tags` は英語の短い名詞で 1〜4 個。**`lib/tagGroups.ts` の語彙を使う**（フィルター画面の分類と連動している）。
  - クラウド・インフラ: `Cloud` `AWS` `Azure` `Google Cloud` `Infrastructure` `Kubernetes` `SRE` `Linux` `Network` `Database`
  - AI・データ: `AI` `MLOps` `Data`
  - セキュリティ: `Security` `Compliance`
  - 言語・開発: `Frontend` `Backend` `Architecture` `Mobile` `Ruby` `PHP` `Python` `Go` `Java` `Blockchain` `OSS`
  - 組織・キャリア: `Agile` `Management` `Career` `Design` `Corporate IT` `Community`
  - どうしても当てはまらない新しいタグを使う場合は、`lib/tagGroups.ts` にも追加する（追加しないと「その他」に入る）。

## 5. マージと書き出し
- `id` が同じものは、新しい情報で上書きする。
- 終了日時から 30 日以上たったイベントと、`source` が `"sample"` のものは削除する。
- `start` の昇順に並べ、JSON 配列だけを `data/events.json` に書き出す。

## 6. 検証
- `npm run validate` を実行する。失敗したら修正し、通るまで繰り返す。
- 最後に、追加・更新・削除の件数と、裏付けが弱かったため見送ったイベントを短く報告する。
