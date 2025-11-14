require("dotenv").config();
const fs = require("fs");
const path = require("path");
// use global fetch available in Node 18+
const fetch =
  global.fetch ||
  (async () => {
    throw new Error("global fetch not available in this Node runtime");
  })();

const API = process.env.API_URL || "https://server.vinnojaya.co.id";

async function registerAndLogin() {
  const email = process.env.DEV_ADMIN_EMAIL || "devadmin@example.com";
  const password = process.env.DEV_ADMIN_PASSWORD || "Password123!";
  try {
    await fetch(`${API}/users/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
  } catch (e) {
    // ignore
  }
  const res = await fetch(`${API}/users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error("Login failed");
  const data = await res.json();
  return data.access_token;
}

function parseMitraFile(content) {
  const lines = content
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  const results = [];
  let current = null;
  for (const line of lines) {
    // main header like "1. ADIRA FINANCE (NAMA & LOGO)"
    const mainMatch = line.match(/^\d+\.\s*(.+?)(\s*\(.+\))?$/);
    if (mainMatch) {
      if (current) results.push(current);
      current = { main: mainMatch[1].trim(), branches: [] };
      continue;
    }
    // branch lines starting with - or bullet
    const branchMatch = line.match(/^[-–—]\s*(.+)$/);
    if (branchMatch && current) {
      current.branches.push(branchMatch[1].trim());
      continue;
    }
    // fallback: treat as branch if current exists
    if (current) {
      current.branches.push(line);
    }
  }
  if (current) results.push(current);
  return results;
}

async function importFile() {
  const projectRoot = path.resolve(__dirname, "..", "..");
  const file = path.join(projectRoot, "mitra.txt");
  if (!fs.existsSync(file)) {
    console.error("mitra.txt not found in project root");
    process.exit(1);
  }
  const content = fs.readFileSync(file, "utf8");
  const parsed = parseMitraFile(content);
  console.log("Parsed", parsed.length, "main companies");

  const token = await registerAndLogin();
  console.log("Got token:", token ? "yes" : "no");

  for (const p of parsed) {
    try {
      const resMain = await fetch(`${API}/partners`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: new URLSearchParams({ name: p.main }),
      });
      if (!resMain.ok) {
        console.error("Failed to create main", p.main, await resMain.text());
        continue;
      }
      const mainData = await resMain.json();
      console.log("Created main:", mainData.name || mainData.id);
      for (const b of p.branches) {
        const resB = await fetch(`${API}/partners`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: new URLSearchParams({ name: b, parentId: String(mainData.id) }),
        });
        if (!resB.ok) {
          console.error("Failed to create branch", b, await resB.text());
          continue;
        }
        const bd = await resB.json();
        console.log("  - Created branch:", bd.name || bd.id);
      }
    } catch (err) {
      console.error("Error importing", p.main, err.message);
    }
  }
}

importFile()
  .then(() => console.log("Import finished"))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
