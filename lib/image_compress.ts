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
    return { file, note: file.type.startsWith("image/") ? "Image not resized: only JPG, PNG and WebP are resized." : "" };
  }
  let bitmap: ImageBitmap | null = null;
  try {
    bitmap = await createImageBitmap(file);
    if (bitmap.width <= MAX_WIDTH) return { file, note: `Image not resized: ${bitmap.width} px wide is within the ${MAX_WIDTH} px limit.` };
    const scale = MAX_WIDTH / bitmap.width;
    const canvas = document.createElement("canvas");
    canvas.width = MAX_WIDTH;
    canvas.height = Math.round(bitmap.height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return { file, note: "Image not resized: canvas is not available. Original kept." };
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", QUALITY));
    if (!blob || blob.type !== "image/webp") return { file, note: "Image not resized: WebP is not supported here. Original kept." };
    if (blob.size >= file.size * KEEP_RATIO) {
      return { file, note: `Image not resized: result ${size_label(blob.size)} was not 8% smaller than ${size_label(file.size)}. Original kept.` };
    }
    const base = file.name.replace(/\.[^.]+$/, "") || "image";
    return {
      file: new File([blob], `${base}.webp`, { type: "image/webp", lastModified: Date.now() }),
      note: `Image resized to ${MAX_WIDTH} px, ${saved_label(file.size, blob.size)}.`,
    };
  } catch (e) {
    const why = e instanceof Error && e.message ? e.message.slice(0, 80) : "image could not be read";
    return { file, note: `Image not resized: ${why}. Original kept.` };
  } finally {
    bitmap?.close();
  }
}
