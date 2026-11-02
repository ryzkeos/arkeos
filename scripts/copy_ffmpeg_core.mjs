import { copyFileSync, cpSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const core_src = join(root, "node_modules", "@ffmpeg", "core", "dist", "esm");
const worker_src = join(root, "node_modules", "@ffmpeg", "ffmpeg", "dist", "esm");
const dest = join(root, "public", "ffmpeg");

if (!existsSync(core_src) || !existsSync(worker_src)) {
  console.error("copy_ffmpeg_core: @ffmpeg/core or @ffmpeg/ffmpeg is missing in node_modules. Video compression files were not copied.");
  process.exit(1);
}

mkdirSync(dest, { recursive: true });
for (const file of ["ffmpeg-core.js", "ffmpeg-core.wasm"]) copyFileSync(join(core_src, file), join(dest, file));
cpSync(worker_src, join(dest, "worker"), { recursive: true, filter: (src) => !/\.[^.]+$/.test(src) || src.endsWith(".js") });
