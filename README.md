# Nachricht

ITカンファレンス・勉強会をまとめるイベントポータル（Next.js + Tailwind CSS、Vercel にデプロイ）。

## 開発

```bash
npm install
npm run dev        # http://localhost:3000
npm run build
```

## イベントデータ

- データは `data/events.json` にある。スキーマは `lib/schema.ts` を参照。
- ビルド時に検証され、不正なデータがあればビルドが失敗する。

### 更新手順（ローカルで `claude -p` を使う）

```powershell
pwsh scripts/scrape.ps1   # claude -p で収集 → npm run validate（失敗したら元に戻す）
git diff data/events.json # 差分を確認
git commit -am "update events" && vercel --prod
```

収集手順はプロジェクトスキル `.claude/skills/collect-events/SKILL.md` にある。Claude Code でこのディレクトリを開いて `/collect-events` と打つと、対話的に実行することもできる（ブラウザ連携が使えるのでこちらを推奨）。
