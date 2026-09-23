"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return <main className="center-page"><div className="access-panel"><h1>Não conseguimos abrir este Space.</h1><p className="muted-copy">Tente novamente dentro de instantes.</p><button className="button button-primary" onClick={reset}>Tentar novamente</button></div></main>;
}
