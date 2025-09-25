// partyrock_filler.js
// MV3-safe content script that fills PartyRock fields from extension storage
// and triggers Ctrl+Enter to run.

/* global chrome */

// Robustly set a textarea's value so React/Mantine detects the change.
function setNativeValue(el, value) {
  if (!el) return false;
  const proto = el instanceof HTMLTextAreaElement
    ? HTMLTextAreaElement.prototype
    : HTMLInputElement.prototype;

  const desc = Object.getOwnPropertyDescriptor(proto, "value");
  if (desc && desc.set) {
    desc.set.call(el, value);
  } else {
    el.value = value;
  }

  el.dispatchEvent(new Event("input",  { bubbles: true }));
  el.dispatchEvent(new Event("change", { bubbles: true }));
  return true;
}

// Exact selectors for your PartyRock widgets
const SELECTORS = {
  resume: [
    'textarea[aria-label="Resume Text"]',
    '#mantine-orejvya4c',
    'textarea.mantine-Textarea-input[aria-label="Resume Text"]'
  ].join(", "),
  job: [
    'textarea[aria-label="Job Description"]',
    '#mantine-zakxq2sm6',
    'textarea.mantine-Textarea-input[aria-label="Job Description"]',
    'textarea[placeholder*="job description" i]'
  ].join(", ")
};

// Fire a synthetic Ctrl+Enter on a target (and a couple fallbacks)
async function pressCtrlEnter(primaryTarget) {
  const targets = [
    primaryTarget,
    document.activeElement,
    document.querySelector("textarea, input, [contenteditable='true']"),
    document.body
  ].filter(Boolean);

  // Give the SPA a tick to bind listeners after we set values
  await new Promise((r) => setTimeout(r, 50));

  for (const t of targets) {
    try {
      // Ensure focus so key handlers attached to focused nodes receive events
      t.focus?.();

      const common = { key: "Enter", code: "Enter", keyCode: 13, which: 13, ctrlKey: true, bubbles: true, cancelable: true };

      t.dispatchEvent(new KeyboardEvent("keydown",  common));
      // keypress is deprecated but some libs still listen for it
      t.dispatchEvent(new KeyboardEvent("keypress", common));
      t.dispatchEvent(new KeyboardEvent("keyup",    common));
    } catch {
      /* ignore */
    }
  }
}

async function fillOnce() {
  // Read resume from sync, JD from local (temp)
  const [syncBag, localBag] = await Promise.all([
    chrome.storage.sync.get("resumeText").catch(() => ({})),
    chrome.storage.local.get("lastJobDescription").catch(() => ({}))
  ]);

  const resumeText = syncBag?.resumeText || "";
  const lastJobDescription = localBag?.lastJobDescription || "";

  if (!resumeText && !lastJobDescription) return false;

  const resumeEl = document.querySelector(SELECTORS.resume);
  const jobEl    = document.querySelector(SELECTORS.job);

  let wrote = false;
  if (resumeText && resumeEl) wrote = setNativeValue(resumeEl, resumeText) || wrote;
  if (lastJobDescription && jobEl) wrote = setNativeValue(jobEl, lastJobDescription) || wrote;

  if (wrote) {
    // Clear temp JD so it isn't reused on future loads
    try { await chrome.storage.local.remove("lastJobDescription"); } catch {}

    // Prefer sending Ctrl+Enter from the JD field (most intuitive place)
    await pressCtrlEnter(jobEl || resumeEl || document.body);
  }

  return wrote;
}

// Wait for SPA content, then try; keep observing until fields appear.
(async () => {
  if (await fillOnce()) return;
  const obs = new MutationObserver(async () => {
    if (await fillOnce()) obs.disconnect();
  });
  obs.observe(document.documentElement, { childList: true, subtree: true });
})();
