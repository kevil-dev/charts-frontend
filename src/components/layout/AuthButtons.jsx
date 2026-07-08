"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectUser, selectAuthLoading, logout } from "@/store/authSlice";
import { resolveTier } from "@/utils/resolveTier";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Bookmark, CreditCard, LogOut } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

function getTierRing(tier) {
  if (tier === "pro") return "0 0 0 2px #ffffff, 0 0 0 4px #00dfd8";
  if (tier === "elite") return "0 0 0 2px #ffffff, 0 0 0 4px #7928ca";
  return "none";
}

const STATUS_LABELS = {
  trialing: "Trialing",
  active: "Active",
  past_due: "Past due",
};

const TIER_BADGE_COLORS = {
  pro: { bg: "#00dfd8", color: "#004d4a" },
  elite: { bg: "#7928ca", color: "#ffffff" },
};

function getTierBadge(user) {
  const tier = resolveTier(user);
  if (tier === "free" || tier === "guest") return null;

  const tierLabel = tier === "elite" ? "Elite" : "Pro";
  const statusLabel = STATUS_LABELS[user.plan_status];
  const { bg, color } = TIER_BADGE_COLORS[tier];

  return { label: `${tierLabel} · ${statusLabel}`, bg, color };
}

/**
 * Tiny client island for the desktop auth buttons.
 * Keeps LeftLinks as a server component.
 */
export default function AuthButtons() {
  const user = useAppSelector(selectUser);
  const isLoading = useAppSelector(selectAuthLoading);
  const dispatch = useAppDispatch();
  const router = useRouter();

  if (isLoading) {
    return <div className="w-24" />;
  }

  if (!user) {
    return (
      <>
        <Link
          href="/login"
          className={buttonVariants({ variant: "secondary", size: "lg" })}
        >
          Login
        </Link>
        <Link href="/register?from=/pricing" className={buttonVariants({ size: "lg" })}>
          Sign up free
        </Link>
      </>
    );
  }

  const initial = (user.name?.[0] ?? user.email?.[0] ?? "U").toUpperCase();
  const tier = resolveTier(user);
  const ring = getTierRing(tier);
  const badge = getTierBadge(user);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label="Open user menu"
          style={{ boxShadow: ring }}
          className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#171717] text-white text-sm font-semibold select-none cursor-pointer transition-opacity hover:opacity-80"
        >
          {initial}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-[220px] p-0 rounded-[10px] border border-[#ebebeb] shadow-[0_4px_16px_rgba(0,0,0,0.08)]"
      >
        <div className="px-[14px] py-[12px]">
          <p className="text-[13px] font-medium text-[#171717] truncate">
            {user.name ?? user.email}
          </p>
          <p className="text-[12px] text-[#888888] truncate mt-0.5">{user.email}</p>
          {badge && (
            <span
              style={{ background: badge.bg, color: badge.color }}
              className="mt-[6px] inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold"
            >
              {badge.label}
            </span>
          )}
        </div>
        <DropdownMenuSeparator className="m-0 bg-[#ebebeb]" />

        <div className="p-[6px]">
          <DropdownMenuItem
            asChild
            className="gap-2 px-[10px] py-2 text-[13px] text-[#4d4d4d] rounded-md cursor-pointer hover:bg-[#f5f5f5] focus:bg-[#f5f5f5]"
          >
            <Link href="/lists">
              <Bookmark className="size-4 shrink-0" />
              My Lists
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            asChild
            className="gap-2 px-[10px] py-2 text-[13px] text-[#4d4d4d] rounded-md cursor-pointer hover:bg-[#f5f5f5] focus:bg-[#f5f5f5]"
          >
            <Link href="/billing">
              <CreditCard className="size-4 shrink-0" />
              Billing
            </Link>
          </DropdownMenuItem>
        </div>
        <DropdownMenuSeparator className="m-0 bg-[#ebebeb]" />

        <div className="p-[6px]">
          <DropdownMenuItem
            className="gap-2 px-[10px] py-2 text-[13px] text-[#ee0000] rounded-md cursor-pointer hover:bg-[#fff0f0] focus:bg-[#fff0f0]"
            onSelect={() => {
              dispatch(logout());
              router.push("/charts/apple/us/top");
            }}
          >
            <LogOut className="size-4 shrink-0" />
            Log out
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
