import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/data";

export default async function Home() {
  // getCurrentProfile throws NetworkError on transient failures (retry UI
  // via the root error boundary) and returns null only for a genuine
  // unauthenticated session — that's the only case that redirects to login.
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  redirect(profile.role === "admin" ? "/admin" : "/dashboard");
}
