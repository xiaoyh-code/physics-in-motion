# 交接文件校對與核實紀錄

日期：2026-10-16。審閱範圍：`RETROSPECTIVE_2026-10-16.md`、`TECHNICAL_GUIDE_ZH.md`、`HANDOVER_ZH.md` 及本次公開建置流程。

## 1. 誰做了甚麼

**Codex 主代理**撰寫文件，逐項對照實際原始碼、既有來源記錄、官方文件及測試；另外安排獨立技術審閱核對架構與文件。主代理負責修訂、測試及正式發佈。

**本機 Kimi desktop**在新任務 `Chinese Drafts Proofreading Review` 審閱三份完整中文草稿，完成後提供 A／B／C 校對意見。長文字由桌面程式轉成文字附件；已確認其 34,590 bytes 與準備的三份草稿逐位元相同。未使用 Kimi CLI，未授予專案資料夾編輯權限。Kimi 的工作是文字可讀性和內部一致性審閱，不是獨立程式測試、官方來源研究或正確性保證。

## 2. 已採納的文字修訂

| 發現 | 修訂 |
| --- | --- |
| 粵語回顧和正式手冊語體不同 | 明示回顧為內部口語記錄，兩份技術指南採書面中文。 |
| 五視圖、SUVAT、插值、origin 等對新手太跳躍 | 補上白話定義、例子與分層閱讀次序。SUVAT 以五個物理量說明。 |
| 「真正 TeX」沒有說清楚 | 說明 TeX 是寫法，KaTeX 負責排出分數、下標及符號。 |
| 「交換動量」容易被理解為互換原有數值 | 改寫為兩車動量變化互相抵消、總量不變。 |
| 終端速度的力平衡可能誤讀成靜止 | 明示合力零代表加速度零，不代表速度零。 |
| 上傳、分享、公開建置容易混為一談 | 分開瀏覽器儲存、含上傳的學生 ZIP、磁碟教材及 GitHub Pages 流程。 |
| ZIP 收到後怎樣開沒有講清 | 增補完整解壓、基本離線開啟、公開網址及 HTTP server 的不同用途。 |
| 資源示例缺圖片本體欄位 | 加入 PDF 的 `pdf` 與獨立圖片的 `src` 兩個最小例子。 |
| Markdown 內 JS backtick 例子會斷開 | 改用雙 backtick 包住。 |
| 暫停規則被說成全站一致 | 限定為首六課；舊課控制器可能保持播放。 |
| Windows、Typst 路徑和字型前提不清 | 明示 `python3` 需求、完整原稿路徑及換機編譯檢查。 |

Kimi 對拋體零飛行時間提出的示例使用「或」連接條件，不能照抄。主代理對照模型後，保留正確條件：**發射點已在地面，且初速度水平或向下**才在釋放當刻接觸地面；由高處向下拋仍有正飛行時間。校對建議經核實才整合。

## 3. 實際核實結果

- 實際載入模型及內容：16 課、16 個引言、55 個原創試題分題、12 個 `test_*.cjs` 測試套件。
- 實際本機 KaTeX 版本為 **0.19.0**；所需 runtime、CSS 及字型在本機資產和 manifest 內。
- `node scripts/check_site.cjs`：49／49 JS 檔案語法通過，43 個入口資源引用有效，12／12 套測試通過。本機 Node 23.4.0；腳本最低門檻 Node 20，CI 配置 Node 24。
- 碰撞模型：14,338 狀態、570,801 項守恆／幾何等檢查；繪圖 1,345 場景、31,979 項檢查及 65 條 TeX。預設兩車各 2 kg，初速 +4／0 m/s；2 秒接觸，黏合後各 +2 m/s，總動量 +8 kg m/s。
- 第五課：實際為三秒平滑開傘、內部數值阻力模型及插值；學生不需計阻力定律。19,959 狀態、451,118 項檢查通過。
- 公開學生建置包含 137 個 runtime 檔案，另有 `.nojekyll` 發佈標記；ZIP、manifest、路徑、模式及原年度 DOCX 一致性均經檢查。
- 在本機子路徑 `/dist/` 逐一開 16 課：都有場景，沒有 TeX 錯誤、影片元素、教師上傳／匯出控制或頁面錯誤；年度導讀也正確隱藏教師編輯介面。
- Chromium 直接用 `file://` 開已解壓學生版：第六課跳到 3 秒互動正常，總動量為 8，沒有 TeX 或頁面錯誤；第一課兩張工作紙預覽均成功解碼，寬度各為 1132 px。這只支持基本離線預覽，不保證每種瀏覽器的儲存及 PDF 內嵌行為。

## 4. 來源核實與邊界

[KaTeX 官方 browser 文件](https://katex.org/docs/browser.html)支持本機載入及保留字型目錄；[MDN IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)及 [origin 定義](https://developer.mozilla.org/en-US/docs/Glossary/Origin)支持按通訊協定、主機及 port 區分儲存來源。僅切換同來源的頁面路徑不會另開 origin。

[Pearson 2018 規格 Issue 3](https://qualifications.pearson.com/content/dam/pdf/International%20Advanced%20Level/Physics/2018/Specification%20and%20Sample%20Assessment/9781446957783_IAL_Physics_Iss3.pdf)及現有 `LESSON_INTRO_SOURCES.md` 用於 IAL 定位；Save My Exams／3Blue1Brown／Phymode 的角色限定為既有概念組織或視覺方向參考。沒有把 IGCSE 參考頁當作 IAL 規格，亦沒有宣稱網站獲官方認證。

GitHub 發佈採[官方 custom Pages workflow](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)，維持原始教師版與生成學生版的分工。正式部署與公開網址的最終驗收記錄在下節。

## 5. 發佈驗收

公開 repository：<https://github.com/xiaoyh-code/physics-in-motion>。

公開學生網站：<https://xiaoyh-code.github.io/physics-in-motion/>。

本節在初次成功部署後記錄實際 Actions 與公開網站驗收結果。對照修訂歷史時，以 Git commit 及成功的 Actions 紀錄辨識版本；不把「已提交」當作「已上線」。
