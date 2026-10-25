import Link from "next/link";

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden px-5 py-8 sm:px-10 sm:py-12">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 top-24 h-72 w-72 rounded-full bg-teal/15 blur-3xl float-soft" />
        <div className="absolute right-0 top-10 h-80 w-80 rounded-full bg-amber/10 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl flex-col justify-between">
        <header className="animate-rise flex items-center justify-between">
          <div className="font-display text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
            見客通
          </div>
          <p className="text-sm text-muted">CaseFlow CRM</p>
        </header>

        <section className="animate-rise-delay my-10 max-w-2xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.22em] text-teal">
            Sales case OS
          </p>
          <h1 className="font-display text-4xl font-extrabold leading-[1.1] tracking-tight text-ink sm:text-6xl">
            講出嚟，就變案件。
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-soft sm:text-lg">
            手機 Portal 用 AI 語音填表；後台用 Case Management 跟住會見、報價、跟進到確認簽單，並預測未來幾個月成交額。
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/portal"
              className="inline-flex items-center justify-center rounded-full bg-teal px-7 py-3.5 text-sm font-semibold text-white shadow-soft transition hover:bg-teal-deep"
            >
              開啟手機 Portal
            </Link>
            <Link
              href="/admin"
              className="inline-flex items-center justify-center rounded-full border border-line bg-white/70 px-7 py-3.5 text-sm font-semibold text-ink backdrop-blur transition hover:border-teal/40"
            >
              進入後台系統
            </Link>
          </div>
        </section>

        <footer className="animate-rise grid gap-3 sm:grid-cols-3">
          {[
            ["語音建案", "講客戶、partner、系統、需求、數量、budget"],
            ["Case Management", "會見 → 報價 → 跟進 → 最終 → 確認／關閉"],
            ["成交預測", "未來月份簽單額與成功機率"],
          ].map(([title, desc]) => (
            <div
              key={title}
              className="rounded-panel border border-white/70 bg-white/55 p-4 backdrop-blur"
            >
              <div className="font-display text-lg font-bold">{title}</div>
              <p className="mt-1 text-sm text-muted">{desc}</p>
            </div>
          ))}
        </footer>
      </div>
    </main>
  );
}
