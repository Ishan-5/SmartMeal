import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <main id="main-content" className="grid min-h-screen place-items-center bg-cream px-5">
      <div className="panel max-w-md p-8 text-center sm:p-10">
        <p className="font-serif text-6xl text-sand">404</p>
        <h1 className="mt-3 font-serif text-3xl text-ink">This page is not on the menu</h1>
        <p className="muted-text mt-3 text-sm">The link may be old, or the page may have moved.</p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link href="/" className="btn-primary"><ArrowLeft className="h-4 w-4" /> Back to SmartMeal</Link>
          <Link href="/app" className="btn-outline">Open the app</Link>
        </div>
      </div>
    </main>
  );
}
