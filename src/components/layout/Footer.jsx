import { FaLinkedin, FaInstagram, FaTwitter, FaFacebook } from "react-icons/fa";
import Logo from "./Logo";
import { footerLinks } from "../../../config/navigation";

const iconMap = {
  Linkedin: FaLinkedin,
  Instagram: FaInstagram,
  Twitter: FaTwitter,
  Facebook: FaFacebook,
};

export default function Footer() {
  return (
    <footer className="w-full border-t bg-background">
      <div className="mx-auto flex max-w-7xl flex-col items-center px-4 py-12 sm:items-start">
        <Logo />

        <nav className="mt-6 flex items-center space-x-3">
          {footerLinks.map((link) => {
            const Icon = iconMap[link.icon];
            return (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg bg-muted p-1 text-muted-foreground transition hover:bg-background hover:text-foreground"
              >
                {Icon && <Icon className="h-6 w-6" />}
              </a>
            );
          })}
        </nav>

        <nav className="mt-12 flex w-full flex-col-reverse items-center justify-between space-y-4 space-y-reverse text-xs font-medium text-muted-foreground sm:flex-row sm:space-y-0">
          <p>© 2026, Million. All Rights Reserved.</p>
          <div>
            <a href="/privacy" className="hover:underline">Privacy</a>
            <span> · </span>
            <a href="/terms" className="hover:underline">Terms</a>
          </div>
        </nav>
      </div>
    </footer>
  );
}