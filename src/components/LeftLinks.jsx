import Link from "next/link";
import Image from "next/image";
import { buttonVariants } from "@/components/ui/button";
import NavLinks from "./Navlinks";
import MobileMenuToggle from "./MobileToggle";

export default function LeftLinks() {
  return (
    <header className="w-full border-b bg-background sticky top-0 bg-white shadow-md z-50">
      <div className="mx-auto flex max-w-7xl items-center justify-between p-4">
        
        {/* Logo and Client-Side Navigation */}
        <div className="flex items-center gap-6">
          <Link href="/">
            <Image src="/logo.jpeg" alt="Logo" width={32} height={32} className="mr-2" />
          </Link>
          <NavLinks /> 
        </div>

        {/* Server-Rendered Auth Buttons */}
        <div className="flex items-center gap-2 max-md:hidden">
          <Link
            href="/signin"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            Sign in
          </Link>
          <Link href="/start" className={buttonVariants({ size: "sm" })}>
            Get Started
          </Link>
        </div>

        {/* Client-Side Mobile Toggle */}
        <MobileMenuToggle />
        
      </div>
    </header>
  );
}