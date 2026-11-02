const MAX_WIDTH = 1600;
const QUALITY = 0.85;
const KEEP_RATIO = 0.92;

const RESIZABLE = /\.(jpe?g|png|webp)$/i;

export const is_resizable_image = (file: File) => RESIZABLE.test(file.name) || /^image\/(jpeg|png|webp)$/.test(file.type);

export async function resize_image(file: File): Promise<File> {
  if (typeof document === "undefined" || !is_resizable_image(file)) return file;
  let bitmap: ImageBitmap | null = null;
  try {
    bitmap = await createImageBitmap(file);
    if (bitmap.width <= MAX_WIDTH) return file;
    const scale = MAX_WIDTH / bitmap.width;
    const canvas = document.createElement("canvas");
    canvas.width = MAX_WIDTH;
    canvas.height = Math.round(bitmap.height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", QUALITY));
    if (!blob || blob.type !== "image/webp" || blob.size >= file.size * KEEP_RATIO) return file;
    const base = file.name.replace(/\.[^.]+$/, "") || "image";
    return new File([blob], `${base}.webp`, { type: "image/webp", lastModified: Date.now() });
  } catch {
    return file;
  } finally {
    bitmap?.close();
  }
}
