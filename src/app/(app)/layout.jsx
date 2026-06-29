import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function AppLayout({ children }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("mp_token");

  if (!token) {
    redirect("/login");
  }

  return <>{children}</>;
}