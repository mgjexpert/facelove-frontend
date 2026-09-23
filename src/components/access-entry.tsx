"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, KeyRound } from "lucide-react";

export function AccessEntry() {
  const [value, setValue] = useState("");
  const router = useRouter();
  return (
    <div className="access-panel">
      <div className="access-emblem"><KeyRound size={26} /></div>
      <p className="eyebrow">FACELOVE SPACES / ACESSO</p>
      <h1>Tem um convite?</h1>
      <p className="muted-copy">Introduza o código que recebeu para consultar o conteúdo reservado de Ana Oliveira.</p>
      <form onSubmit={event => { event.preventDefault(); if (value.trim()) router.push(`/s/${encodeURIComponent(value.trim())}`); }}>
        <label className="field-label" htmlFor="token">Código do convite</label>
        <input id="token" className="access-input" value={value} onChange={event => setValue(event.target.value)} autoComplete="off" placeholder="Introduzir código" required />
        <button className="button button-primary access-submit" type="submit">Continuar <ArrowRight size={17} /></button>
      </form>
      <p className="access-hint">Para explorar a interface sem media real, use <code>demo-preview</code>.</p>
    </div>
  );
}
