import SiteShell from "@/components/SiteShell";
import { load_seed } from "@/lib/server_content";

export const revalidate = 60;

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const seed = await load_seed();
  return <SiteShell seed={seed}>{children}</SiteShell>;
}
