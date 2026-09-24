import Link from "next/link";
import { signIn } from "./actions";
import { AuthFrame } from "@/components/auth-frame";

export const metadata = { title: "Entrar · FaceLove" };
export default async function Login({ searchParams }: { searchParams: Promise<{error?: string}> }) {
  const { error } = await searchParams;
  return <AuthFrame><div className="access-panel account-panel">
    <p className="eyebrow">BEM-VINDO DE VOLTA</p><h1>Entra no FaceLove.</h1>
    <p className="muted-copy">Entre com o email verificado ou o seu @utilizador e a palavra-passe. O nome de utilizador fica disponível depois de a conta ser associada ao Space.</p>
    {error && <p role="alert">Não foi possível entrar. Verifique as credenciais.</p>}
    <form action={signIn} className="account-form"><label>Email ou @utilizador<input name="email" type="text" required autoComplete="username" /></label>
      <label>Palavra-passe<input name="password" type="password" required autoComplete="current-password" /></label>
      <button className="button button-primary" type="submit">Entrar</button></form>
    <Link href="/signup" className="quiet-link">Criar conta</Link>
  </div></AuthFrame>;
}
