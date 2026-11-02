import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const src = join(process.cwd(), "node_modules", "@ffmpeg", "core", "dist", "esm");
const dest = join(process.cwd(), "public", "ffmpeg");

if (!existsSync(src)) process.exit(0);
mkdirSync(dest, { recursive: true });
for (const file of ["ffmpeg-core.js", "ffmpeg-core.wasm"]) copyFileSync(join(src, file), join(dest, file));
