import { fetchComics } from "../lib/api-client";
import IndexClient from "./IndexClient";
import { Metadata } from "next";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Comic Archive",
  description: "A digital comic archive.",
  openGraph: {
    title: "Comic Archive",
    description: "A digital comic archive.",
  },
};

export default async function Home() {
  try {
    const data = await fetchComics();
    return <IndexClient initialComics={data.comics} />;
  } catch (err) {
    return (
      <main className="px-6 lg:px-8 pb-12 h-full flex items-center justify-center">
        <div className="text-slate">Failed to load comics. Make sure the backend is running.</div>
      </main>
    );
  }
}
