import Link from "next/link";
import NavLinks from "../layout/Navlinks";
import MobileMenuToggle from "../layout/MobileToggle";
import Logo from "../layout/Logo";
import AuthButtons from "../layout/AuthButtons";

export default function LeftLinks() {
  return (
    <header className="w-full border-b bg-background sticky top-0 shadow-2xs z-50">
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

        {/* Auth Buttons — client island */}
        <div className="flex items-center gap-2 max-md:hidden">
          <AuthButtons />
        </div>

        {/* Client-Side Mobile Toggle */}
        <MobileMenuToggle />
      </div>
    </header>
  );
}
