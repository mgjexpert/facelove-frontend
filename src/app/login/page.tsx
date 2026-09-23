import Link from "next/link";
import { signIn } from "./actions";

export const metadata = { title: "Entrar · FaceLove" };
export default async function Login({ searchParams }: { searchParams: Promise<{error?: string}> }) {
  const { error } = await searchParams;
  return <main className="center-page"><div className="access-panel account-panel">
    <p className="eyebrow">FACELOVE / CONTA</p><h1>Entrar no Space</h1>
    <p className="muted-copy">Entre com o email verificado e a sua palavra-passe. O nome @utilizador identifica o seu Space depois de a conta ser associada.</p>
    {error && <p role="alert">Não foi possível entrar. Verifique as credenciais.</p>}
    <form action={signIn} className="account-form"><label>Email<input name="email" type="email" required autoComplete="email" /></label>
      <label>Palavra-passe<input name="password" type="password" required autoComplete="current-password" /></label>
      <button className="button button-primary" type="submit">Entrar</button></form>
    <Link href="/signup" className="quiet-link">Criar conta</Link>
  </div></main>;
}
