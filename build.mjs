// Builds every distributable from src/ and extension/:
//   antisplitpage.user.js            userscript (committed; @updateURL points at it)
//   dist/chrome/, dist/firefox/      unpacked MV3 extensions (content script + popup)
//   dist/antisplitpage-<target>-<version>.zip
//
// Usage: node build.mjs            build everything
//        node build.mjs --check    fail if antisplitpage.user.js is out of date

import { readFile, writeFile, mkdir, rm, cp } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { REDIRECT_SITES, MERGE_SITES } from "./src/sites.js";

// Concatenated in this order; each may only import from earlier ones.
const MODULES = ["src/rules.js", "src/sites.js", "src/core.js", "src/main.js"];
const USERSCRIPT = "antisplitpage.user.js";
const ICON_SIZES = [16, 32, 48, 128];
const REPO = "gvoze32/antisplitpage";
const RAW = `https://raw.githubusercontent.com/${REPO}/master`;

const pkg = JSON.parse(await readFile("package.json", "utf8"));
const hosts = [...new Set([...REDIRECT_SITES, ...MERGE_SITES].map((s) => s.host))];
const matches = hosts.map((host) => `*://*.${host}/*`);

// Modules use single-line `import { … } from "./x.js";` and `export` declarations
// only, so bundling is: drop imports, drop the `export` keyword, wrap in an IIFE.
async function bundle() {
  const parts = [];
  for (const file of MODULES) {
    const code = (await readFile(file, "utf8"))
      .replace(/^import .* from "\.\/[\w-]+\.js";\n/gm, "")
      .replace(/^export /gm, "");
    const leftover = code.match(/^\s*(?:import|export)\b.*/m);
    if (leftover) throw new Error(`${file}: unsupported module syntax: ${leftover[0]}`);
    parts.push(`// --- ${file} ---\n${code.trim()}\n`);
  }
  const body = parts.join("\n").replace(/^(?=.)/gm, "  ");
  return `(() => {\n  "use strict";\n\n${body}})();\n`;
}

function userscriptHeader() {
  const fields = [
    ["name", "Anti Split Page"],
    ["namespace", REPO],
    ["version", pkg.version],
    ["description", pkg.description],
    ["author", "gvoze32"],
    ["homepageURL", `https://github.com/${REPO}`],
    ["supportURL", `https://github.com/${REPO}/issues`],
    ["updateURL", `${RAW}/${USERSCRIPT}`],
    ["downloadURL", `${RAW}/${USERSCRIPT}`],
    ["icon", `${RAW}/icons/icon-128.png`],
    ["grant", "none"],
    ["run-at", "document-start"],
    ["noframes", ""],
    ...matches.map((m) => ["match", m]),
  ];
  const lines = fields.map(([k, v]) => `// @${k.padEnd(12)} ${v}`.trimEnd());
  return ["// ==UserScript==", ...lines, "// ==/UserScript==", ""].join("\n");
}

function manifest(target) {
  const m = {
    manifest_version: 3,
    name: "Anti Split Page",
    version: pkg.version,
    description: pkg.description,
    homepage_url: `https://github.com/${REPO}`,
    icons: Object.fromEntries(ICON_SIZES.map((s) => [s, `icons/icon-${s}.png`])),
    action: { default_icon: "icons/icon-48.png", default_popup: "popup.html" },
    content_scripts: [{ matches, js: ["content.js"], run_at: "document_start" }],
  };
  if (target === "firefox") {
    // data_collection_permissions (required by AMO) needs Firefox 140 / Firefox for Android 142.
    m.browser_specific_settings = {
      gecko: {
        id: "antisplitpage@gvoze32",
        strict_min_version: "140.0",
        data_collection_permissions: { required: ["none"] },
      },
      gecko_android: { strict_min_version: "142.0" },
    };
  }
  return m;
}

const code = await bundle();
const userscript = `${userscriptHeader()}\n${code}`;

if (process.argv.includes("--check")) {
  const current = await readFile(USERSCRIPT, "utf8").catch(() => "");
  if (current !== userscript) {
    console.error(`${USERSCRIPT} is out of date: run \`node build.mjs\``);
    process.exit(1);
  }
  console.log(`${USERSCRIPT} is up to date (${hosts.length} hosts)`);
  process.exit(0);
}

await writeFile(USERSCRIPT, userscript);
await rm("dist", { recursive: true, force: true });
for (const target of ["chrome", "firefox"]) {
  const dir = `dist/${target}`;
  await cp("extension", dir, { recursive: true });
  await mkdir(`${dir}/icons`, { recursive: true });
  await writeFile(`${dir}/manifest.json`, `${JSON.stringify(manifest(target), null, 2)}\n`);
  await writeFile(`${dir}/content.js`, code);
  for (const s of ICON_SIZES) await cp(`icons/icon-${s}.png`, `${dir}/icons/icon-${s}.png`);
  const zip = `antisplitpage-${target}-${pkg.version}.zip`;
  execFileSync("zip", ["-qrX", `../${zip}`, "."], { cwd: dir });
  console.log(`dist/${zip}`);
}
console.log(`${USERSCRIPT} (${hosts.length} hosts)`);
