import { NextResponse } from "next/server";
import { dbInsert } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const MAX_BODY_CHARS = 20000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const hits = new Map<string, { count: number; reset: number }>();

function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim() || "unknown";
  return req.headers.get("x-real-ip")?.trim() || "unknown";
}

function limited(ip: string): boolean {
  const now = Date.now();
  if (hits.size > 5000) {
    for (const [key, entry] of hits) if (entry.reset <= now) hits.delete(key);
  }
  const entry = hits.get(ip);
  if (!entry || entry.reset <= now) {
    hits.set(ip, { count: 1, reset: now + WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_PER_WINDOW;
}

const fail = (error: string, status: number) => NextResponse.json({ error }, { status });

const clean = (value: unknown) => (typeof value === "string" ? value.trim() : "");

export async function POST(req: Request) {
  let raw = "";
  try {
    raw = await req.text();
  } catch {
    return fail("Invalid request.", 400);
  }
  if (raw.length > MAX_BODY_CHARS) return fail("Request too large.", 413);

  let data: Record<string, unknown>;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("shape");
    data = parsed as Record<string, unknown>;
  } catch {
    return fail("Invalid request.", 400);
  }

  if (clean(data.website)) return NextResponse.json({ ok: true });

  if (limited(clientIp(req))) return fail("Too many requests. Please try again later.", 429);

  const name = clean(data.name);
  const email = clean(data.email);
  const project_type = clean(data.project_type);
  const budget = clean(data.budget);
  const timeline = clean(data.timeline);
  const message = clean(data.message);

  if (!name || name.length > 100) return fail("Please enter a valid name.", 400);
  if (!email || email.length > 254 || !EMAIL_RE.test(email)) return fail("Please enter a valid email.", 400);
  if (!project_type || project_type.length > 100) return fail("Please select a project type.", 400);
  if (!budget || budget.length > 100) return fail("Please select a budget range.", 400);
  if (!timeline || timeline.length > 100) return fail("Please select a timeline.", 400);
  if (!message || message.length > 5000) return fail("Please enter a valid message.", 400);

  try {
    await dbInsert("inquiries", { name, email, project_type, budget, timeline, message, status: "unread" });
  } catch {
    return fail("Could not send your message. Please try again later.", 502);
  }

  return NextResponse.json({ ok: true });
}
