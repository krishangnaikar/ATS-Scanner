
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
"""
with open("/mnt/data/README.md", "w", encoding="utf-8") as f:
    f.write(readme)
print("README.md written to /mnt/data/README.md")
