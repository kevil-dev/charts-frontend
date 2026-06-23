import Link from "next/link";
import Image from "next/image";
import { buttonVariants } from "@/components/ui/button";
import NavLinks from "./Navlinks";
import MobileMenuToggle from "./MobileToggle";
import Logo from "./Logo";

export default function LeftLinks() {
  return (
    <header className="w-full border-b bg-background sticky top-0 bg-white shadow-2xs z-50">
      <div className="mx-auto flex max-w-7xl items-center justify-between p-3">
        {/* Logo and Client-Side Navigation */}
        <div className="flex items-center gap-6">
          {/* <Link href="/" className="inline-flex items-center gap-2">
            <Image
              src="/logo.jpeg"
              alt="Logo"
              width={32}
              height={32}
              className="block"
            />
            <span className="text-base font-semibold">Million</span>
          </Link> */}
          <Link href= "/">
            <Logo />
          </Link>
          <NavLinks />
        </div>

        {/* Server-Rendered Auth Buttons */}
        <div className="flex items-center gap-2 max-md:hidden">
          <Link
            href="/login"
            className={buttonVariants({ variant: "secondary", size: "lg" })}
          >
            Login
          </Link>
          <Link href="/start" className={buttonVariants({ size: "lg" })}>
            Free Trial
          </Link>
        </div>

        {/* Client-Side Mobile Toggle */}
        <MobileMenuToggle />
      </div>
    </header>
  );
}
