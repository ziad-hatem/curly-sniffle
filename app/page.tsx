"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, BarChart2, ExternalLink, Copy, Loader2 } from "lucide-react";

interface LinkData {
  _id: string;
  code: string;
  targetUrl: string;
  visits: number;
  createdAt: string;
  used: boolean;
}

export default function Dashboard() {
  const [links, setLinks] = useState<LinkData[]>([]);
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      const res = await fetch("/api/list");
      const data = await res.json();
      if (Array.isArray(data)) {
        setLinks(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setFetching(false);
    }
  };

  const createLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    setLoading(true);
    try {
      const res = await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      if (res.ok) {
        setUrl("");
        fetchLinks();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied!");
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 pb-20">
      {/* Navbar */}
      <header className="bg-white border-b border-zinc-200">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white">
              <BarChart2 size={18} />
            </div>
            LinkAnalytics
          </h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Create Link Section */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-200 mb-8">
          <h2 className="text-lg font-semibold mb-4">Shorten a new link</h2>
          <form onSubmit={createLink} className="flex gap-4">
            <input
              type="url"
              required
              placeholder="https://example.com/my-super-long-url"
              className="flex-1 px-4 py-3 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <button
              disabled={loading}
              type="submit"
              className="bg-black text-white px-6 py-3 rounded-xl font-medium hover:bg-zinc-800 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Plus size={18} />
              )}
              Shorten
            </button>
          </form>
        </div>

        {/* Links List */}
        <h2 className="text-xl font-semibold mb-4">Your Links</h2>

        {fetching ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-zinc-400" size={32} />
          </div>
        ) : links.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-zinc-300 text-zinc-500">
            No links created yet. Start tracking!
          </div>
        ) : (
          <div className="grid gap-4">
            {links.map((link) => (
              <div
                key={link._id}
                className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1 overflow-hidden">
                  <div className="flex items-center gap-3">
                    <h3
                      className={`font-bold text-lg flex items-center gap-2 ${
                        link.used ? "text-zinc-400" : "text-blue-600"
                      }`}
                    >
                      <span className={link.used ? "line-through" : ""}>
                        /{link.code}
                      </span>
                      {link.used && (
                        <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full no-underline">
                          Expired
                        </span>
                      )}
                      <button
                        onClick={() =>
                          copyToClipboard(
                            `${window.location.origin}/t/${link.code}`
                          )
                        }
                        className="text-zinc-400 hover:text-black"
                      >
                        <Copy size={14} />
                      </button>
                    </h3>
                    <span className="text-xs font-mono bg-zinc-100 px-2 py-0.5 rounded text-zinc-500">
                      {new Date(link.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-500 truncate max-w-md">
                    {link.targetUrl}
                  </p>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{link.visits}</div>
                    <div className="text-xs text-zinc-500 uppercase font-semibold tracking-wider">
                      Clicks
                    </div>
                  </div>
                  <div className="h-10 w-px bg-zinc-200 hidden sm:block"></div>
                  <div className="flex gap-2">
                    {link.used ? (
                      <span
                        className="p-2 text-zinc-300 cursor-not-allowed"
                        title="Link Expired"
                      >
                        <ExternalLink size={20} />
                      </span>
                    ) : (
                      <a
                        href={`/t/${link.code}`}
                        target="_blank"
                        className="p-2 text-zinc-500 hover:text-black hover:bg-zinc-100 rounded-lg transition-colors"
                        title="Open Link"
                      >
                        <ExternalLink size={20} />
                      </a>
                    )}
                    <Link
                      href={`/analytics/${link.code}`}
                      className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 rounded-lg font-medium transition-colors flex items-center gap-2"
                    >
                      <BarChart2 size={18} />
                      Analytics
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
