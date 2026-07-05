import { copyFile } from "node:fs/promises";
import { resolve } from "node:path";

// The dts plugin emits a bundled ESM declaration file per entry (index.d.ts,
// core.d.ts). Copy each to a .d.cts so the CJS ("require") export condition
// ships types TypeScript reads as CommonJS declarations (keeps
// are-the-types-wrong happy).
const dist = resolve(process.cwd(), "dist");

for (const entry of ["index", "core"]) {
	await copyFile(resolve(dist, `${entry}.d.ts`), resolve(dist, `${entry}.d.cts`));
	console.log(`postbuild: copied dist/${entry}.d.ts -> dist/${entry}.d.cts`);
}
