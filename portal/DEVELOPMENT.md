# 專案結構與開啟方式

這個專案是 CityU EE 學生平台的靜態 HTML 原型。團隊目前在 `portal/` 內開發，每個功能分頁各有一個資料夾，目前只放一個 `index.html`；首頁保留在 `portal/index.html` 作為入口。各頁共用樣式和導覽程式，不需要安裝專案套件或執行建置。

## 專案結構

以下路徑以儲存庫根目錄 `EE4213/` 為起點：

```text
EE4213/
├── original/                     # 原始個人原型，保留作參考
│   ├── cityu-ee-guide.html        # 課程／主修資訊、職涯及比較原型
│   └── EE4213_code_v6.html        # 學位審核與規劃模擬原型
├── base.html                     # 拆分前的單檔版本，保留作參考
├── portal/                       # 團隊目前的開發版本
│   ├── index.html                # 首頁與主要入口
│   ├── registration/             # 註冊導航器
│   │   └── index.html
│   ├── student-profile/          # 學生個人檔案
│   │   └── index.html
│   ├── course-info/              # 課程資訊
│   │   └── index.html
│   ├── major-info/               # 主修資訊
│   │   └── index.html
│   ├── comparator/               # 課程比較器
│   │   └── index.html
│   ├── degree-audit/             # 學位審核輔助
│   │   └── index.html
│   ├── program-career/           # 課程瀏覽與職涯資訊
│   │   └── index.html
│   ├── assets/
│   │   ├── css/common.css        # 共用樣式、中英文顯示及響應式排版
│   │   └── js/common.js          # 共用介面、導覽、示範登入及語言切換
│   └── DEVELOPMENT.md            # 本指南
├── AGENTS.md                     # 專案開發規範
├── README.md                     # 課程專案要求與提交說明
└── LICENSE
```

各 HTML 負責自己的主要內容；頁首、側欄、頁尾及登入彈窗由 `common.js` 統一建立，外觀由 `common.css` 管理。

分頁的共用資源使用 `../assets/css/common.css` 和 `../assets/js/common.js`。導覽以共用程式的位置解析頁面網址，因此從首頁、任一分頁或不同伺服器子目錄開啟，都能返回首頁並切換功能頁。

目前首頁與共用介面已有互動，其餘 7 個功能頁仍是「開發中」預留位置。`original/` 的原型功能尚未整合至這些頁面；所有登入都是示範，沒有連接大學系統或後端。

## 開啟方式

### 方法一：VS Code Live Server（建議）

1. 在 VS Code 開啟整個 `EE4213` 資料夾。
2. 如尚未安裝，先在 Extensions 搜尋並安裝 **Live Server**（Ritwick Dey）。
3. 在檔案總管對 `portal/index.html` 按右鍵，選擇 **Open with Live Server**。
4. 瀏覽器開啟後，透過側欄切換各功能頁；點擊頁首平台名稱可返回首頁。

請開啟 `portal/index.html` 作為團隊版本入口。`base.html` 是保留的單檔參考版本。

### 方法二：Python 靜態伺服器

這個方式不需要 VS Code 或 Live Server，瀏覽器可使用 Windows 內建的 Edge。以下從尚未安裝 Python 的 Windows 10／11 電腦開始，也不需要預先安裝 `winget`。

**首次安裝環境（只需做一次）：**

1. 在開始選單搜尋並開啟 **Windows PowerShell**，貼上以下指令安裝 Python 管理器。這是 [Python 官方提供的安裝方式](https://docs.python.org/3/using/windows.html#advanced-installation)：

   ```powershell
   Add-AppxPackage -AppInstallerFile https://www.python.org/ftp/python/pymanager/pymanager.appinstaller
   ```

2. 完成後，**關閉再重新開啟 PowerShell**，依次執行：

   ```powershell
   py install 3.14
   py -V:3.14 --version
   ```

   顯示 `Python 3.14.x` 即代表安裝成功。安裝時需要網路連線。

**每次開啟專案：**

假設完整的 `EE4213` 專案資料夾已放在桌面，在 PowerShell 執行：

```powershell
cd "$env:USERPROFILE\Desktop\EE4213"
py -V:3.14 -m http.server 8765 --bind 127.0.0.1 --directory portal
```

若專案放在其他位置，請將 `cd` 的路徑改成實際位置，並確認目前位於包含 `portal/` 的 `EE4213` 根目錄。

`--directory portal` 會將網頁根目錄設為 `portal/`，所以開啟 [團隊版本首頁](http://127.0.0.1:8765/) 就會直接顯示 `portal/index.html`，不會先顯示專案根目錄的檔案列表；網址不需要再加 `/portal/`。

分頁網址會使用各自的資料夾，例如 [課程資訊](http://127.0.0.1:8765/course-info/) 對應 `portal/course-info/index.html`。側欄連結會明確指向 `index.html`，同時支援靜態伺服器和直接開啟本地檔案。

如果舊伺服器仍在執行，請先在原本的 PowerShell 按 `Ctrl+C`，再使用上述新指令啟動並重新整理瀏覽器。使用期間保持 PowerShell 開啟，結束時也按 `Ctrl+C` 停止伺服器。

如果電腦原本已有可用的 Python，也可跳過上述安裝，在 `EE4213` 根目錄直接執行：

```powershell
python -m http.server 8765 --bind 127.0.0.1 --directory portal
```

### 方法三：直接雙擊 HTML

可直接雙擊 `portal/index.html` 或任一功能資料夾內的 `index.html`，但必須保留完整的 `portal/` 資料夾，包括共用的 `assets/`，並啟用瀏覽器 JavaScript。

直接開啟會使用 `file://`。不同瀏覽器對本地檔案儲存的支援不同，可能需要逐頁示範登入；若儲存不可用，登入只解鎖當頁並顯示提示。需要完整跨頁體驗時，請使用前兩種方式。

## 開啟後如何體驗

首頁、課程資訊及主修資訊可直接瀏覽，其餘頁面需要示範登入。登入表單可填入任意示範帳號與密碼，請勿使用真實密碼。

首次登入或註冊會前往註冊導航器；同一工作階段登出後再次登入會前往學生個人檔案。註冊導航器不在側欄內，可由登入流程進入，或直接開啟 `registration/index.html`。

登入狀態及語言選擇使用 `sessionStorage` 保存，不儲存密碼。請在同一瀏覽器分頁、相同主機及連接埠下切換頁面；`localhost` 與 `127.0.0.1` 的狀態互不共用。

## 組員應修改哪些檔案

- **頁面內容：** 修改自己負責資料夾內的 `index.html`，例如 `course-info/index.html`，在 `#pageContent` 內開發；保留既有的 `data-page` 和共用掛載結構。
- **頁面專屬樣式／互動：** 目前每個功能資料夾只需一個 HTML。有需要時，再將專屬檔案放在同一資料夾，例如 `course-info/style.css`、`course-info/script.js`，並在該頁使用相對路徑引入。CSS 放在共用 `common.css` 後；JS 使用 `defer` 並放在共用 `common.js` 後。樣式以頁面範圍限定，避免影響其他頁。
- **共用介面：** 導覽、登入、語言及全站樣式集中在 `common.js`／`common.css`，由負責整合的組員協調修改。

`base.html` 和 `original/` 保留不動。修改後使用 Live Server 開啟負責頁面，確認互動、附近導覽及窄螢幕排版正常。
