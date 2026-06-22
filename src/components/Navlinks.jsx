"use client"; // This must be a client component

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navLinks } from "../../config/navigation";
import { cn } from "@/lib/utils"; // Using cn!
import { buttonVariants } from "@/components/ui/button";

export default function NavLinks() {
  const pathname = usePathname();

  return (
    <div className="inline-flex gap-1 max-md:hidden">
      {navLinks.map((link) => {
        const isActive = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              isActive ? "bg-muted text-foreground font-medium border-b-2 border-primary rounded-none" : ""
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </div>
  );
}