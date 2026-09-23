import type { Metadata } from "next";
import { AccessEntry } from "@/components/access-entry";

export const metadata: Metadata = { title: "Acesso privado · FaceLove", robots: { index: false, follow: false } };
export default function AccessPage() {
  return <main className="center-page"><AccessEntry /></main>;
}
