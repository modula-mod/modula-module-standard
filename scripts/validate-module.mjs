import fs from "fs";

const requiredPaths = [
  "manifest.json",
  "module.json",
  "README.md",
  "CHANGELOG.md",
  "icon.svg",
  "backend",
  "frontend",
  "widgets"
];

const missing = requiredPaths.filter((p) => !fs.existsSync(p));

if (missing.length > 0) {
  console.error("Missing required paths:");
  for (const item of missing) {
    console.error(`- ${item}`);
  }
  process.exit(1);
}

console.log("Module structure validation passed.");
