import { error_text } from "./error_text";
import { saved_label, size_label } from "./size_label";

const MIN_BYTES = 1.5 * 1024 * 1024;
const MAX_BYTES = 400 * 1024 * 1024;
const KEEP_RATIO = 0.92;
const CORE_BASE = "/ffmpeg";

type Status = (text: string) => void;

export type CompressResult = { file: File; note: string };

export const is_video_file = (file: File) => file.type.startsWith("video/") || /\.(mp4|mov|m4v|webm|ogv|ogg)$/i.test(file.name);

let loading: Promise<import("@ffmpeg/ffmpeg").FFmpeg> | null = null;

async function engine() {
  if (!loading) {
    loading = (async () => {
      const { FFmpeg } = await import("@ffmpeg/ffmpeg");
      const ff = new FFmpeg();
      await ff.load({
        classWorkerURL: `${location.origin}${CORE_BASE}/worker/worker.js`,
        coreURL: `${location.origin}${CORE_BASE}/ffmpeg-core.js`,
        wasmURL: `${location.origin}${CORE_BASE}/ffmpeg-core.wasm`,
      });
      return ff;
    })();
    loading.catch(() => { loading = null; });
  }
  return loading;
}

export async function compress_video(file: File, on_status?: Status): Promise<CompressResult> {
  if (!is_video_file(file)) return { file, note: "" };
  if (file.size < MIN_BYTES) return { file, note: `Video not compressed: ${size_label(file.size)} is under the 1.5 MB minimum.` };
  if (file.size > MAX_BYTES) return { file, note: `Video not compressed: ${size_label(file.size)} is over the 400 MB limit.` };
  let ff: import("@ffmpeg/ffmpeg").FFmpeg | null = null;
  let on_progress: ((e: { progress: number }) => void) | null = null;
  try {
    on_status?.("Preparing Video Compressor…");
    ff = await engine();
    on_progress = ({ progress }) => {
      const pct = Math.max(0, Math.min(99, Math.round(progress * 100)));
      on_status?.(`Compressing Video ${pct}%`);
    };
    ff.on("progress", on_progress);
    on_status?.("Compressing Video 0%");

    const ext = (file.name.split(".").pop() ?? "mp4").toLowerCase().replace(/[^a-z0-9]/g, "") || "mp4";
    const input = `in.${ext}`;
    await ff.writeFile(input, new Uint8Array(await file.arrayBuffer()));
    const code = await ff.exec([
      "-i", input,
      "-map", "0:v:0",
      "-an",
      "-vf", "scale='min(1280,iw)':-2",
      "-c:v", "libx264",
      "-preset", "veryfast",
      "-crf", "27",
      "-profile:v", "main",
      "-pix_fmt", "yuv420p",
      "-maxrate", "3500k",
      "-bufsize", "7000k",
      "-movflags", "+faststart",
      "out.mp4",
    ]);
    if (code !== 0) return { file, note: `Video not compressed: compressor failed with code ${code}. Original kept.` };
    const data = await ff.readFile("out.mp4");
    if (typeof data === "string" || data.byteLength === 0) return { file, note: "Video not compressed: compressor made no output. Original kept." };
    const bytes = new Uint8Array(data.byteLength);
    bytes.set(data);
    if (bytes.byteLength >= file.size * KEEP_RATIO) {
      return { file, note: `Video not compressed: result ${size_label(bytes.byteLength)} was not 8% smaller than ${size_label(file.size)}. Original kept.` };
    }
    const base = file.name.replace(/\.[^.]+$/, "") || "video";
    return {
      file: new File([bytes], `${base}.mp4`, { type: "video/mp4", lastModified: Date.now() }),
      note: `Video compressed ${saved_label(file.size, bytes.byteLength)}.`,
    };
  } catch (e) {
    loading = null;
    const why = error_text(e, "compressor could not run");
    return { file, note: `Video not compressed: ${why}. Original kept.` };
  } finally {
    if (ff && on_progress) ff.off("progress", on_progress);
    try { await ff?.deleteFile("out.mp4"); } catch {}
    try { await ff?.deleteFile(`in.${(file.name.split(".").pop() ?? "mp4").toLowerCase().replace(/[^a-z0-9]/g, "") || "mp4"}`); } catch {}
  }
}
