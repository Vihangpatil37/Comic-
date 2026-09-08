// fixed indentation
// layout component - shared header/footer for all pages
import type { Metadata } from "next";
import Image from "next/image";
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
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 400,
        alt: "Comic Archive Logo",
      },
    ],
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
          <Link href="/" className="hover:opacity-70 transition-opacity">
            <Image
              src="/logo.png"
              alt="Comic Archive"
              width={200}
              height={60}
              priority
            />
          </Link>
          <Link href="/admin/login" className="text-slate hover:text-ink transition-colors">
            Admin
          </Link>
        </header>
        <div className="flex-grow">
          {children}
        </div>
        <footer className="p-6 lg:p-8 flex items-center gap-4">
          <Image
            src="/logo.png"
            alt="Comic Archive"
            width={120}
            height={36}
          />
          <p className="text-slate text-sm">© {new Date().getFullYear()} Comic Archive</p>
        </footer>
      </body>
    </html>
  );
}
