## 📄 ResuMaster Chrome Extension

This extension is a tool designed to **streamline the process of tailoring your resume** for specific job descriptions (JDs) using the **ResuMaster PartyRock application**.

It acts as a bridge, allowing you to quickly grab a job description from any webpage and automatically feed it, along with your stored resume, into the AI-powered ResuMaster app for analysis and suggestions.

---

### ⚙️ Tech Stack

This project is built as a **Google Chrome Manifest V3 Extension**.

| Component | Technology / Feature | Purpose |
| :--- | :--- | :--- |
| **Manifest** | Chrome Extension Manifest V3 | Defines the extension's structure, permissions, and service workers. |
| **Background Script** | `background.js` (Service Worker) | Manages context menu creation (`chrome.contextMenus`), tab opening, and the core logic for extracting the JD using scripting. |
| **Content Script** | `partyrock_filler.js` | Runs inside the target PartyRock web page to automate field filling and trigger the AI run. |
| **Storage** | `chrome.storage.sync` | Used for persistent, synced user data (Resume Text, App URL). |
| **Storage** | `chrome.storage.local` | Used for temporary, non-synced data (Last Job Description). |
| **DOM Manipulation** | `chrome.scripting.executeScript` | Injects logic into the job posting page to robustly extract the job description text. |
| **UI Interaction** | Synthetic DOM Events (`setNativeValue`, `KeyboardEvent`) | Ensures compatibility with the PartyRock app (likely a React/Mantine Single Page Application) by simulating native user input. |

---

### ✨ Key Features & How It Helps

| Feature | Description | Benefit to You |
| :--- | :--- | :--- |
| **Context Menu Integration** | Adds a right-click option ("Send job description to ResuMaster") to quickly send content to the app. | **Instant Job Description Transfer:** Eliminates copy/paste, saving time. |
| **Intelligent JD Extraction** | Automatically tries to find the JD text in a page by checking: 1. **User selection**, 2. **Specific HTML elements** (like `<article>`, job description `div`s), 3. **Page body text**, and 4. **Meta descriptions**. | **Reliable Capture:** Increases the chance of getting the full and correct job description, even on complex sites. |
| **Persistent Resume Storage** | You can save your base resume text in the extension's options page. | **One-Time Setup:** Your resume is always ready to be used; no need to paste it every time. |
| **PartyRock Automation** | After opening the ResuMaster app, a content script automatically fills the **Job Description** and **Resume Text** fields and simulates a **Ctrl+Enter** (or equivalent action) to immediately run the AI analysis. | **Seamless Workflow:** The process is entirely automated—extract, open, fill, and run—getting you to the results faster. |
| **Customizable App URL** | The ResuMaster app URL is configurable via the options page. | **Flexibility:** Allows you to point the extension to your own custom version of the ResuMaster app, if desired. |

---

### 🚀 Workflow

1.  **On a job posting page**, you can optionally **select the job description text** for the most accurate result.
2.  **Right-click** anywhere on the page.
3.  Click **"Send job description to ResuMaster"**.
4.  The extension's background script handles the text extraction logic (selection first, then robust DOM search).
5.  A new tab opens with the **ResuMaster PartyRock application**.
6.  The extension's content script (`partyrock_filler.js`) automatically:
    * Fills the **Job Description** field with the extracted text (from `local` storage).
    * Fills the **Resume Text** field with your saved resume (from `sync` storage).
    * Triggers the application to **process the inputs** (simulating Ctrl+Enter).
7.  The ResuMaster app generates suggestions for tailoring your resume based on the JD.

---

## Permissions & Why They’re Needed

- **storage** – Save your PartyRock URL and resume; store JD temporarily.
- **scripting** – Inject code to extract JD from the current page and to interact with PartyRock fields.
- **activeTab, tabs, contextMenus** – Open the PartyRock tab and add the right-click menu.
- **Host permission (`https://partyrock.aws/*`)** – Only to fill your PartyRock app fields and trigger execution.

---

## Privacy & Data

- Your **resume text** and **app URL** are stored in Chrome’s extension storage on your machine (sync where available).
- The **job description** is stored **temporarily** only to transfer it into PartyRock, then it is cleared.
- The extension does **not** send your data to any third-party server. It only interacts with the PartyRock site you open.

---

## Troubleshooting

- **The right-click item doesn’t appear**  
  Ensure the extension is enabled and loaded unpacked. Try reloading the extension in `chrome://extensions/`.

- **Nothing gets filled in PartyRock**  
  - Make sure the page URL is `https://partyrock.aws/...`  
  - Wait a moment after the page loads; the app is a SPA and fields may render asynchronously.  
  - Refresh the page and try again.

- **JD extraction seems wrong or empty**  
  - Try manually selecting the JD text before right-clicking.  
  - Some pages block text extraction or have unusual markup; manual selection helps.

- **The app didn’t run**  
  - Place the cursor in a text area and press **Ctrl+Enter** yourself. Some changes in the site may affect key handlers.

- **PartyRock changed its UI**  
  If the PartyRock UI changes significantly, the extension’s selectors may need updates. Adjust the selectors in the content script to match the new textarea labels/placeholders.

---

## Development Tips

- Uses **Manifest V3** service worker background.
- Keep host permissions minimal (only PartyRock).
- For debugging JD extraction, log the detected container lengths and try different selectors.
- If you customize selectors for your specific app, target stable attributes (ARIA labels/placeholders) when possible.

---

## Roadmap Ideas

- A small popup to preview the captured JD before sending.
- Per-site extraction tweaks (domain-specific rules).
- Button in the toolbar that attempts extraction without using the context menu.
- Optional “append vs overwrite” behavior for the PartyRock fields.

---

## License

MIT
