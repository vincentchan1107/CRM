import Link from "next/link";
import { VoiceCaseForm } from "@/components/VoiceCaseForm";

export default function PortalPage() {
  return (
    <main className="min-h-screen px-4 py-5 sm:px-6">
      <header className="mx-auto mb-5 flex max-w-lg items-center justify-between">
        <Link href="/" className="font-display text-xl font-extrabold text-ink">
          見客通
        </Link>
        <Link
          href="/admin"
          className="rounded-full border border-line bg-white/70 px-3 py-1.5 text-xs font-semibold text-muted"
        >
          後台
        </Link>
      </header>
      <VoiceCaseForm />
    </main>
  );
}
