export default function NoAccess() {
  return (
    <div className="card flex flex-col items-center gap-2 p-10 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose/10 text-xl">🔒</div>
      <h1 className="font-display text-lg font-700 text-ink">Geen toegang</h1>
      <p className="max-w-sm text-sm text-ink/50">
        Je account heeft geen toegang tot dit onderdeel. Vraag de eigenaar om je rechten aan te passen
        via Team.
      </p>
    </div>
  );
}
