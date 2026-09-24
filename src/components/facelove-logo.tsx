import Image from "next/image";
import Link from "next/link";

export function FaceLoveLogo({ expressive = false }: { expressive?: boolean }) {
  if (expressive) return <Image src="/images/facelove-brand.webp" alt="FaceLove" width={640} height={640}
    sizes="(max-width: 700px) 180px, 240px" className="expressive-logo" priority />;
  return <Link className="wordmark" href="/" aria-label="FaceLove início">
    <span className="wordmark-symbol" aria-hidden="true">♡</span>Face<span>Love</span>
  </Link>;
}
