import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="min-h-[calc(100vh-140px)] flex flex-col items-center justify-center p-6 text-center">
      <h1 className="font-display text-6xl text-oxide mb-4">404</h1>
      <h2 className="font-display text-2xl mb-8">Page Not Found</h2>
      <p className="text-slate max-w-md mb-8">
        We couldn&apos;t find the comic or page you were looking for. It might have been moved or deleted.
      </p>
      <Link 
        href="/"
        className="bg-ink text-paper px-6 py-3 rounded font-body hover:opacity-90 transition-opacity"
      >
        Return to Archive
      </Link>
    </main>
  )
}
