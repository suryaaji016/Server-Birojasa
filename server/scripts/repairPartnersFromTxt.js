/*
  repairPartnersFromTxt.js

  Usage: run from project root (or server folder) with Node:
    node server/scripts/repairPartnersFromTxt.js

  What it does:
  - Reads the top-level `mitra.txt` file in the project root.
  - Parses blocks: a non-dash line is treated as a main company name.
  - Lines starting with '-' are treated as branches for the most recent main.
  - For each main: findOrCreate a main partner (isMain=true).
  - For each branch: if a partner with same name exists and has no parentId,
    update it to set parentId = main.id and isMain = false. Otherwise create it.

  This is idempotent and intended to clean import mistakes where branches
  were created as top-level partners.
*/
const fs = require("fs");
const path = require("path");
const { Partner, sequelize } = require("../models");

async function main() {
  const txtPath = path.join(process.cwd(), "mitra.txt");
  if (!fs.existsSync(txtPath)) {
    console.error("mitra.txt not found at:", txtPath);
    process.exit(1);
  }

  const raw = fs.readFileSync(txtPath, "utf8");
  const lines = raw.split(/\r?\n/);

  let currentMain = null;

  try {
    await sequelize.authenticate();
    console.log("DB connected");

    for (let rawLine of lines) {
      const line = rawLine.trim();
      if (!line) continue;

      // dash-like lines are branches (start with '-' or '–' or similar)
      if (/^[\-–•*]\s*/.test(line)) {
        if (!currentMain) {
          console.warn(
            "Found branch line but no preceding main. Skipping:\n",
            line
          );
          continue;
        }
        // clean branch name by removing leading dash and tabs
        const branchName = line.replace(/^[\-–•*]\s*/g, "").trim();

        // try to find existing partner with same name
        let existing = await Partner.findOne({ where: { name: branchName } });
        if (existing) {
          // if it's currently a main (no parent), re-parent it
          if (!existing.parentId) {
            console.log(
              `Re-parenting existing '${branchName}' -> parent ${currentMain.name} (id ${currentMain.id})`
            );
            existing.parentId = currentMain.id;
            existing.isMain = false;
            await existing.save();
          } else if (existing.parentId !== currentMain.id) {
            console.log(
              `Updating parent of '${branchName}' from ${existing.parentId} to ${currentMain.id}`
            );
            existing.parentId = currentMain.id;
            existing.isMain = false;
            await existing.save();
          } else {
            // already correct
          }
        } else {
          console.log(
            `Creating branch '${branchName}' under ${currentMain.name}`
          );
          await Partner.create({
            name: branchName,
            parentId: currentMain.id,
            isMain: false,
            logoUrl: null,
          });
        }
      } else {
        // treat as a main heading. Remove leading numbers like '1.' if present
        const mainName = line.replace(/^\d+\.\s*/g, "").trim();
        // some headings have suffix like '(NAMA & LOGO)'; keep as-is or optionally strip that
        // we'll keep it to avoid false matches, but lower-case compare for matching

        // find or create main
        let [m, created] = await Partner.findOrCreate({
          where: { name: mainName },
          defaults: { isMain: true, parentId: null, logoUrl: null },
        });
        if (!m.isMain) {
          m.isMain = true;
          m.parentId = null;
          await m.save();
        }
        currentMain = m;
        console.log(
          `Main: '${currentMain.name}' (id ${currentMain.id}) ${
            created ? "[created]" : "[exists]"
          }`
        );
      }
    }

    console.log("Repair complete. Run your app and verify the Admin list");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(2);
  }
}

main();
