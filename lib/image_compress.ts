import { error_text } from "./error_text";
import { saved_label, size_label } from "./size_label";

const MAX_WIDTH = 1600;
const QUALITY = 0.85;
const KEEP_RATIO = 0.92;

export type ResizeResult = { file: File; note: string };

const RESIZABLE = /\.(jpe?g|png|webp)$/i;

export const is_resizable_image = (file: File) => RESIZABLE.test(file.name) || /^image\/(jpeg|png|webp)$/.test(file.type);

export async function resize_image(file: File): Promise<ResizeResult> {
  if (typeof document === "undefined") return { file, note: "" };
  if (!is_resizable_image(file)) {
    return { file, note: file.type.startsWith("image/") ? "Image Not Resized: Only JPG, PNG And WebP Are Resized." : "" };
  }
  let bitmap: ImageBitmap | null = null;
  try {
    bitmap = await createImageBitmap(file);
    if (bitmap.width <= MAX_WIDTH) return { file, note: `Image Not Resized: ${bitmap.width} px Wide Is Within The ${MAX_WIDTH} px Limit.` };
    const scale = MAX_WIDTH / bitmap.width;
    const canvas = document.createElement("canvas");
    canvas.width = MAX_WIDTH;
    canvas.height = Math.round(bitmap.height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return { file, note: "Image Not Resized: Canvas Is Not Available. Original Kept." };
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", QUALITY));
    if (!blob || blob.type !== "image/webp") return { file, note: "Image Not Resized: WebP Is Not Supported Here. Original Kept." };
    if (blob.size >= file.size * KEEP_RATIO) {
      return { file, note: `Image Not Resized: Result ${size_label(blob.size)} Was Not 8% Smaller Than ${size_label(file.size)}. Original Kept.` };
    }
    const base = file.name.replace(/\.[^.]+$/, "") || "image";
    return {
      file: new File([blob], `${base}.webp`, { type: "image/webp", lastModified: Date.now() }),
      note: `Image Resized To ${MAX_WIDTH} px, ${saved_label(file.size, blob.size)}.`,
    };
  } catch (e) {
    const why = error_text(e, "Image Could Not Be Read");
    return { file, note: `Image Not Resized: ${why}. Original Kept.` };
  } finally {
    bitmap?.close();
  }
}
