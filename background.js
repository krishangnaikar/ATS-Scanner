// background.js
const DEFAULT_APP_URL = "https://partyrock.aws/u/unadkat/BAPgRJ2QW/ResuMaster";

// Create context menu to grab JD from the current page
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "sendToResuMaster",
    title: "Send job description to ResuMaster",
    contexts: ["page", "selection"]
  });
});

// Utility: open ResuMaster tab
async function openResuMaster(appUrl) {
  const url = appUrl || (await chrome.storage.sync.get("appUrl")).appUrl || DEFAULT_APP_URL;
  const tab = await chrome.tabs.create({ url, active: true });
  return tab.id;
}

// When user clicks the menu, extract JD and open PartyRock
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== "sendToResuMaster") return;

  // 1) Try selection first
  let selected = info.selectionText && info.selectionText.trim().length > 60 ? info.selectionText.trim() : null;

  // 2) If no useful selection, run extractor in the page
  if (!selected) {
    try {
      const [{ result }] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          const MIN_LEN = 200;
          const killDupSpaces = s => s.replace(/\s+/g, " ").trim();

          const og = document.querySelector('meta[property="og:description"], meta[name="description"]');
          const metaDesc = og?.content || "";

          const candidates = Array.from(document.querySelectorAll(`
            article, main, section, div#jobDescriptionText, div[id*="jobDescription"],
            div[class*="description"], div[data-test="JobDescription"], [data-test-job-description]
          `));

          let best = "";
          for (const el of candidates) {
            const style = getComputedStyle(el);
            if (style.display === "none" || style.visibility === "hidden") continue;
            const txt = killDupSpaces(el.innerText || "");
            if (txt.length > best.length) best = txt;
          }

          if (best.length < MIN_LEN) {
            const longBody = killDupSpaces(document.body.innerText || "");
            if (longBody.length > best.length) best = longBody;
          }

          const sel = window.getSelection?.().toString?.() || "";
          const chosen = sel.trim().length > MIN_LEN ? killDupSpaces(sel) :
            best.length >= MIN_LEN ? best :
              metaDesc;

          return { text: chosen.substring(0, 120000) };
        }
      });
      selected = result?.text?.trim();
    } catch {
      /* ignore */
    }
  }

  if (!selected || selected.length < 40) {
    // (Optional) nudge the user on-page
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => alert("Please select the job description, then right-click → Send to ResuMaster.")
      });
    } catch {}
    return;
  }

  // 3) Store temp JD in local (MV3-safe for content scripts)
  await chrome.storage.local.set({ lastJobDescription: selected });

  // 4) Open the PartyRock app; content script will fill fields
  const { appUrl } = await chrome.storage.sync.get("appUrl");
  await openResuMaster(appUrl);
});
