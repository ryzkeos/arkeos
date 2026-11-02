export function size_label(bytes: number): string {
  return bytes < 1048576 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1048576).toFixed(1)} MB`;
}

export function saved_label(before: number, after: number): string {
  return `${size_label(before)} To ${size_label(after)}, ${Math.max(0, Math.round((1 - after / before) * 100))}% Smaller`;
}
