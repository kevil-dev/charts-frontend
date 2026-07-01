"use client";

import { useState } from "react";

export default function BgDemoPage() {
  const [bgType, setBgType] = useState("refined");

  return (
    <>
      {/* Backgrounds */}
      <div className="fixed inset-0 z-0 bg-[#fafafa]">
        {bgType === "refined" ? (
          <div className="refined-mesh-full" aria-hidden="true" />
        ) : (
          <div className="relative w-full h-full overflow-hidden">
            <div className="hero-mesh" aria-hidden="true" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-xl mx-auto pt-24 px-4 text-center">
        <div className="inline-flex items-center gap-1 rounded-full border border-border bg-white/50 backdrop-blur-md p-1 mb-8 shadow-sm">
          <button
            onClick={() => setBgType("original")}
            className={[
              "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              bgType === "original"
                ? "bg-black text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            ].join(" ")}
          >
            Original Hero Mesh
          </button>
          <button
            onClick={() => setBgType("refined")}
            className={[
              "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              bgType === "refined"
                ? "bg-black text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            ].join(" ")}
          >
            New Full-Page Mesh
          </button>
        </div>

        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-4">
          Compare Backgrounds
        </p>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl text-[#171717] leading-tight">
          Never miss a move in the charts.
        </h1>
        <p className="text-base color-[#666] mt-4">
          Toggle between the original contained hero-mesh and the new full-page smooth mesh 
          to see how they feel behind content.
        </p>
      </div>
    </>
  );
}
