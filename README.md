# Physics in Motion

英文互動物理學習網站；交接及操作文件以中文撰寫。更新：2026-10-16。

- [公開學生網站](https://xiaoyh-code.github.io/physics-in-motion/)
- [今日回顧：兩三分鐘版](RETROSPECTIVE_2026-10-16.md)
- [零程式底技術導讀](TECHNICAL_GUIDE_ZH.md)
- [詳細接手手冊](HANDOVER_ZH.md)
- [校對與核實紀錄](REVIEW_RECORD_ZH.md)
- [英文教師指南](GUIDE.md)

現有 16 課、16 個引言及 55 個原創試題分題。頭六課已升級為黑底、青藍／黃色的即時 SVG 視覺推導；第 4–6 課預設收起計算。第 7–16 課已有基本互動模型，仍待逐課升級。普通文字 Arial；公式用本機 KaTeX 排版。網站不是完整 IAL 課程或官方 Pearson 教材。

## 本機使用

下載整個 repository 並解壓，或使用 Git clone。終端機進入本資料夾後執行：

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

瀏覽器開啟 `http://127.0.0.1:8000/`。終端機保持開啟；按 Ctrl+C 停止。本機原始碼是教師版，可以加入 PDF／圖片。檔案先存在該瀏覽器，並非上傳至 GitHub。

## 檢查與建立公開版

需要 Node.js 20+ 及 Python 3；GitHub Actions 使用 Node.js 24。不需要 `npm install`。

```sh
node scripts/check_site.cjs
node scripts/build_public_site.cjs
python3 -m http.server 8001 --bind 127.0.0.1 --directory dist
```

公開版輸出至 `dist/`，學生 ZIP 在 `artifacts/Physics_in_Motion_Student.zip`。建置只包含磁碟上的共享資源，不能讀取教師瀏覽器內的 IndexedDB 上傳。詳細教材分享流程見 [接手手冊](HANDOVER_ZH.md#6-加入工作紙與分享教材)。

推送 `main` 後，GitHub Actions 先檢查再建置，成功後部署 `dist/` 至 GitHub Pages。`dist/`、ZIP、瀏覽器紀錄及渲染快取不進版本庫。

## 來源與權利

課程對照以教師提供的年度計劃、Pearson 官方規格及樣本教材為依據；動畫及題目由本專案編寫。3Blue1Brown 是視覺解釋的參考；Save My Exams 是第五課概念組織的參考，沒有複製其插圖、文章或試題。詳見 [技術導讀來源表](TECHNICAL_GUIDE_ZH.md#7-學科與設計參考來源)。KaTeX 的 MIT 授權及舊 CMU 字型授權保留於各自資料夾；本次公開不替整個原創專案新增開源授權。
