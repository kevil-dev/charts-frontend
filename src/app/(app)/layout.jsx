import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function AppLayout({ children }) {
  const cookieStore = await cookies();

  const res = await fetch(`${process.env.INTERNAL_API_URL}/auth/me`, {
    headers: { Cookie: cookieStore.toString() },
    cache: "no-store",
  });

  if (!res.ok) {
    redirect("/login");
  }

  return <>{children}</>;
}
