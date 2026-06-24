import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
import Logo from "@/components/layout/Logo";

export default function AuthLayout({ children }) {
  return (
    <div className="fixed inset-0 z-[100] flex">
      {/* ── Left Panel ────────────────────────────────────────────────────── */}
      <div className="flex w-full flex-col overflow-y-auto bg-background lg:w-[55%]">
        {/* Mini header */}
        <div className="flex items-center justify-between px-8 py-5">
          <Link href="/">
            <Logo />
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeftIcon className="size-3.5" />
            Back to home
          </Link>
        </div>

        {/* Form content — vertically centered */}
        <div className="flex flex-1 items-center justify-center px-8 pb-8">
          <div className="w-full max-w-[400px]">{children}</div>
        </div>

        {/* Bottom legal text */}
        <p className="px-8 pb-6 text-center text-xs text-muted-foreground">
          By continuing you agree to the{" "}
          <span className="cursor-pointer underline underline-offset-2">
            Terms
          </span>{" "}
          &{" "}
          <span className="cursor-pointer underline underline-offset-2">
            Privacy Policy
          </span>
          .
        </p>
      </div>

      {/* ── Right Panel ───────────────────────────────────────────────────── */}
      <div
        className="hidden lg:flex lg:w-[45%] flex-col items-start justify-center pl-12 pr-8"
        style={{
          background:
            "radial-gradient(ellipse at top right, #2d1b69 0%, #1a0a2e 30%, #0a0a0a 70%)",
        }}
      >
        <h2 className="text-5xl font-bold leading-tight tracking-tight text-white">
          Every chart.
          <br />
          One login.
        </h2>
        <p className="mt-4 max-w-md leading-relaxed text-[#888888]">
          Track Apple, Spotify, and YouTube rankings — refreshed daily, with
          movement, hosts, and reach in a single view.
        </p>
      </div>
    </div>
  );
}
