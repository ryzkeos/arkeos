export function error_text(e: unknown, fallback: string): string {
  let text = "";
  if (typeof e === "string") text = e;
  else if (e instanceof Error) text = e.name && e.name !== "Error" ? `${e.name}: ${e.message}` : e.message;
  else if (e && typeof e === "object" && "message" in e && typeof e.message === "string") text = e.message;
  text = text.replace(/\s+/g, " ").trim();
  return text ? text.slice(0, 120) : fallback;
}
