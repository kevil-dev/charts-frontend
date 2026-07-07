"use client";

import { Loader2Icon } from "lucide-react";

function formatDate(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr.replace(" ", "T")).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function CancelRow({
  planStatus,
  cancelAtPeriodEnd,
  currentPeriodEnd,
  onCancelClick,
  onConfirmCancel,
  onKeep,
  canceling,
  confirming,
}) {
  const formattedPeriodEnd = formatDate(currentPeriodEnd);

  if (cancelAtPeriodEnd) {
    return (
      <p className="mt-5 text-sm text-center" style={{ color: "#888888" }}>
        Access stays until {formattedPeriodEnd}.
      </p>
    );
  }

  if (planStatus !== "trialing" && planStatus !== "active") {
    return null;
  }

  if (confirming) {
    return (
      <div className="mt-5 text-sm text-center">
        <p style={{ color: "#888888" }}>
          {planStatus === "trialing" ? "Cancel your free trial?" : "Cancel your subscription?"}
        </p>
        <div className="mt-1 flex justify-center items-center" style={{ gap: "12px" }}>
          <button
            onClick={onConfirmCancel}
            disabled={canceling}
            className="text-sm underline inline-flex items-center"
            style={{ color: "#ee0000", gap: "4px" }}
          >
            {canceling && <Loader2Icon className="size-3 animate-spin" />}
            Yes, cancel
          </button>
          <button onClick={onKeep} className="text-sm underline" style={{ color: "#888888" }}>
            Keep it
          </button>
        </div>
      </div>
    );
  }

  const prefix =
    planStatus === "trialing"
      ? `Cancel before ${formattedPeriodEnd} and you won't be charged. `
      : `Access stays until ${formattedPeriodEnd}. `;

  return (
    <p className="mt-5 text-sm text-center">
      {prefix}
      <span onClick={onCancelClick} className="underline cursor-pointer" style={{ color: "#ee0000" }}>
        Cancel subscription
      </span>
    </p>
  );
}
