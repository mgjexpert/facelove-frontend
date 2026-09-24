import Link from "next/link";
import { signUp } from "../login/actions";
import { AuthFrame } from "@/components/auth-frame";

export const metadata = { title: "Criar conta · FaceLove" };
export default async function Signup({ searchParams }: { searchParams: Promise<{error?: string;sent?: string}> }) {
  const { error, sent } = await searchParams;
  return <AuthFrame><div className="access-panel account-panel">
    <p className="eyebrow">COMEÇA POR AQUI</p><h1>Cria o teu FaceLove.</h1>
    <p className="muted-copy">Uma conta nova fica pendente até confirmarmos o email e associarmos o Space certo.</p>
    {sent ? <p>Verifique o seu email para confirmar a conta.</p> : <>
      {error && <p role="alert">Confirme o email e use uma palavra-passe de pelo menos 12 caracteres.</p>}
      <form action={signUp} className="account-form"><label>Email<input name="email" type="email" required autoComplete="email" /></label>
        <label>Palavra-passe<input name="password" type="password" required minLength={12} autoComplete="new-password" /></label>
        <button className="button button-primary" type="submit">Criar conta</button></form>
    </>}
    <Link href="/login" className="quiet-link">Já tenho conta</Link>
  </div></AuthFrame>;
}
