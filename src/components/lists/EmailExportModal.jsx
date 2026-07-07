"use client";

import { useState, useEffect } from "react";
import { XIcon, Loader2Icon } from "lucide-react";
import { toast } from "sonner";
import listsApi from "@/services/listsApi";
import { useAuth } from "@/providers/AuthContext";

export default function EmailExportModal({ list, onClose }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [recipient, setRecipient] = useState("account");
  const [customEmail, setCustomEmail] = useState("");
  const [format, setFormat] = useState("csv");

  useEffect(() => {
    function handleEscape(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (loading) return;
    
    if (recipient === "custom" && !customEmail.trim()) {
      toast.error("Please enter a custom email address");
      return;
    }

    setLoading(true);
    try {
      await listsApi.emailExport(list.id, {
        format,
        recipient,
        email: customEmail.trim(),
      });
      toast.success("List emailed successfully!");
      onClose();
    } catch {
      toast.error("Couldn't send email. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="text-lg font-semibold">Email Export</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Send this list as an attachment.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 hover:bg-muted transition-colors"
            aria-label="Close"
          >
            <XIcon className="size-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Recipient */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Recipient</label>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="recipient"
                  value="account"
                  checked={recipient === "account"}
                  onChange={() => setRecipient("account")}
                  className="accent-foreground"
                />
                <span className="text-sm">Account email ({user?.email ?? "Loading..."})</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="recipient"
                  value="custom"
                  checked={recipient === "custom"}
                  onChange={() => setRecipient("custom")}
                  className="accent-foreground"
                />
                <span className="text-sm">Custom email</span>
              </label>
            </div>
            
            {recipient === "custom" && (
              <input
                type="email"
                required
                placeholder="hello@example.com"
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                className="mt-1 rounded-md border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-foreground transition-colors"
              />
            )}
          </div>

          {/* Format */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Format</label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="format"
                  value="csv"
                  checked={format === "csv"}
                  onChange={() => setFormat("csv")}
                  className="accent-foreground"
                />
                <span className="text-sm">CSV</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="format"
                  value="json"
                  checked={format === "json"}
                  onChange={() => setFormat("json")}
                  className="accent-foreground"
                />
                <span className="text-sm">JSON</span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-foreground text-background px-4 py-2.5 text-sm font-medium hover:opacity-80 transition-opacity disabled:opacity-50 mt-2"
          >
            {loading && <Loader2Icon className="size-4 animate-spin" />}
            {loading ? "Sending…" : "Send Email"}
          </button>
        </form>
      </div>
    </div>
  );
}
