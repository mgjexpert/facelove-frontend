export default function Loading() {
  return <main className="profile-page" aria-busy="true"><div className="skeleton skeleton-cover" /><div className="profile-shell"><div className="skeleton skeleton-profile" /><div className="skeleton skeleton-post" /><span className="sr-only">A carregar o Space…</span></div></main>;
}
