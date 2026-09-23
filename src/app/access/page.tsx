import type { Metadata } from "next";
import { AccessEntry } from "@/components/access-entry";
import { isDemoProviderActive } from "@/lib/media/providers/demo";

export const metadata: Metadata = { title: "Acesso privado · FaceLove", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";
export default function AccessPage() {
  return <main className="center-page"><AccessEntry demoAvailable={isDemoProviderActive()} /></main>;
}
