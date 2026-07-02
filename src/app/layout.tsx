import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import LeftLinks from "@/components/layout/LeftLinks";
import Footer from "@/components/layout/Footer";
import { AuthProvider } from "@/features/auth/context/AuthContext";
import { ListsCacheProvider } from "@/features/lists/context/ListsCacheContext";
import QueryProvider from "@/components/providers/QueryProvider";
import Script from "next/script";
import { Toaster } from "sonner";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Million Charts",
  description: "Million Podcasts — ranked charts across Apple, Spotify, and YouTube.",
};

async function getServerUser() {
  const cookieStore = await cookies();
  try {
    const res = await fetch(`${process.env.INTERNAL_API_URL}/auth/me`, {
      headers: { Cookie: cookieStore.toString() },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data?.user ?? json.data ?? null;
  } catch {
    return null;
  }
}

async function getInitialLists() {
  const cookieStore = await cookies();
  try {
    const res = await fetch(`${process.env.INTERNAL_API_URL}/lists`, {
      headers: { Cookie: cookieStore.toString() },
      cache: "no-store",
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data?.lists ?? [];
  } catch {
    return [];
  }
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const initialUser = await getServerUser();
  const initialLists = await getInitialLists();

  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" />
        <QueryProvider>
          <AuthProvider initialUser={initialUser}>
            <ListsCacheProvider initialLists={initialLists}>
              <LeftLinks />
              <main className="flex-1">{children}</main>
              <Footer />
              <Toaster position="bottom-right" />
            </ListsCacheProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
