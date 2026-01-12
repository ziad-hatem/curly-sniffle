"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

export default function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      setShow(true);
    }
  }, []);

  const accept = () => {
    localStorage.setItem("cookie-consent", "true");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-4 right-4 max-w-sm bg-white border border-zinc-200 p-4 rounded-xl shadow-lg z-50 animate-in slide-in-from-bottom-5">
      <div className="flex justify-between items-start gap-4">
        <div>
          <h4 className="font-semibold text-sm">We use cookies</h4>
          <p className="text-xs text-zinc-500 mt-1">
            We track basic visitor data for analytics purposes. No personal data
            is sold.
          </p>
        </div>
        <button
          onClick={() => setShow(false)}
          className="text-zinc-400 hover:text-black"
        >
          <X size={16} />
        </button>
      </div>
      <div className="mt-4 flex gap-2">
        <button
          onClick={accept}
          className="flex-1 bg-black text-white text-xs font-medium py-2 rounded-lg hover:bg-zinc-800 transition-colors"
        >
          Accept
        </button>
        <button
          onClick={() => setShow(false)}
          className="flex-1 bg-zinc-100 text-zinc-900 text-xs font-medium py-2 rounded-lg hover:bg-zinc-200 transition-colors"
        >
          Decline
        </button>
      </div>
    </div>
  );
}
