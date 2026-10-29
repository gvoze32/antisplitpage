"use strict";

const REPO = "https://github.com/gvoze32/antisplitpage";
// package.json on master holds the released version (the build copies it into the manifest).
const LATEST_VERSION_URL = "https://raw.githubusercontent.com/gvoze32/antisplitpage/master/package.json";

const { version } = chrome.runtime.getManifest();
document.getElementById("version").textContent = `v${version}`;

// Numeric dotted-version comparison: >0 if a is newer than b.
function compareVersions(a, b) {
  const pa = a.split(".").map(Number);
  const pb = b.split(".").map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const diff = (pa[i] || 0) - (pb[i] || 0);
    if (diff) return diff;
  }
  return 0;
}

const status = document.getElementById("update-status");
const button = document.getElementById("check-updates");

button.addEventListener("click", async () => {
  button.disabled = true;
  status.textContent = "Checking…";
  try {
    const response = await fetch(LATEST_VERSION_URL, { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const { version: latest } = await response.json();
    if (!/^\d+(\.\d+)*$/.test(latest)) throw new Error(`bad version ${latest}`);
    if (compareVersions(latest, version) > 0) {
      const link = document.createElement("a");
      link.href = `${REPO}/releases/latest`;
      link.target = "_blank";
      link.rel = "noopener";
      link.textContent = `Version ${latest} is available`;
      status.replaceChildren(link);
    } else {
      status.textContent = `Up to date (v${version})`;
    }
  } catch (error) {
    status.textContent = "Could not check for updates.";
    console.warn("[AntiSplitPage] update check failed", error);
  } finally {
    button.disabled = false;
  }
});
