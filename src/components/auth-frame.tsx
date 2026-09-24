import Image from "next/image";
import { FaceLoveLogo } from "./facelove-logo";

export function AuthFrame({ children }: { children: React.ReactNode }) {
  return <main className="auth-shell">
    <div className="auth-art"><Image src="/images/ana-fictional-cover.jpg" alt="Ilustração editorial FaceLove" fill sizes="(max-width: 800px) 100vw, 50vw" />
      <div className="auth-art-shade" /><div className="auth-art-content"><FaceLoveLogo expressive />
        <p className="eyebrow">PESSOAS REAIS · MOMENTOS REAIS · CONEXÕES REAIS</p><h2>Aqui começam <em>novas histórias.</em></h2></div>
    </div>
    <div className="auth-form-side">{children}</div>
  </main>;
}
