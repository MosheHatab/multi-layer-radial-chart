import { copyFile } from "node:fs/promises";
import { resolve } from "node:path";

// The dts plugin emits a single bundled ESM declaration file (index.d.ts).
// Copy it to index.d.cts so the CJS ("require") export condition ships types
// that TypeScript reads as CommonJS declarations (keeps are-the-types-wrong happy).
const dist = resolve(process.cwd(), "dist");
await copyFile(resolve(dist, "index.d.ts"), resolve(dist, "index.d.cts"));

console.log("postbuild: copied dist/index.d.ts -> dist/index.d.cts");
