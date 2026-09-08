// homepage - server component that fetches comics
import { fetchComics } from "../lib/api-client";
import IndexClient from "./IndexClient";
export const dynamic = 'force-dynamic';

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


