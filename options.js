// options.js (MV3-safe: no inline code)

async function loadSettings() {
    const st = await chrome.storage.sync.get(["appUrl", "resumeText"]);
    if (st.appUrl) document.getElementById("appUrl").value = st.appUrl;
    if (st.resumeText) document.getElementById("resume").value = st.resumeText;
}

async function saveSettings() {
    const appUrl = (document.getElementById("appUrl").value || "").trim()
        || "https://partyrock.aws/u/unadkat/BAPgRJ2QW/ResuMaster";
    const resumeText = (document.getElementById("resume").value || "").trim();

    await chrome.storage.sync.set({ appUrl, resumeText });

    const status = document.getElementById("status");
    status.textContent = "Saved!";
    setTimeout(() => (status.textContent = ""), 1500);
}

document.addEventListener("DOMContentLoaded", () => {
    loadSettings();

    document.getElementById("save").addEventListener("click", (e) => {
        e.preventDefault();
        saveSettings();
    });
});
