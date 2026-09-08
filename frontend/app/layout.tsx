// fixed indentation
// layout component - shared header/footer for all pages
import type { Metadata } from "next";
import Link from "next/link";
import "../styles/tokens.css";
import "./globals.css";

// metadata for seo - title and description
export const metadata: Metadata = {
  metadataBase: new URL("https://comicarchive.vercel.app"),
  title: {
    default: "Comic Archive",
    template: "%s | Comic Archive",
  },
  description: "A curated digital comic archive — discover and read comics online",
  openGraph: {
    type: "website",
    siteName: "Comic Archive",
    title: "Comic Archive",
    description: "A curated digital comic archive — discover and read comics online",
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: "VPwIVRqFYbd_hT4bf3SbJuk9m1zLtq04yjnNOIOsAo8",
  },
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





