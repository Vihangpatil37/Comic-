// layout component - shared header/footer for all pages
import type { Metadata } from "next";
import Link from "next/link";
import "../styles/tokens.css";
import "./globals.css";

// metadata for seo - title and description
export const metadata: Metadata = {
  title: "Comic Archive",
  description: "A curated digital comic archive - discover and read comics online",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-vellum text-ink font-body min-h-screen flex flex-col">
        <header className="flex justify-between items-center p-6 lg:p-8">
          <Link href="/" className="font-display text-xl hover:opacity-70 transition-opacity">
            Comic Archive
          </Link>
          <Link href="/admin/login" className="text-slate hover:text-ink transition-colors">
            Admin
          </Link>
        </header>
        <div className="flex-grow">
          {children}
        </div>
        <footer className="p-6 lg:p-8">
          <p className="text-slate text-sm">© {new Date().getFullYear()} Comic Archive</p>
        </footer>
      </body>
    </html>
  );
}




