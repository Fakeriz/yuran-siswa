import { redirect } from "next/navigation";
import { getProfile } from "../lib/auth";
import { LandingPage } from "../components/landing/landing-page";

export default async function Home() {
  let profile = null;
  try {
    profile = await getProfile();
  } catch {
    // If session check fails or is unconfigured, proceed to landing page
  }

  if (profile?.peran === "admin") {
    redirect("/admin");
  } else if (profile?.peran === "staff") {
    redirect("/staff");
  } else if (profile?.peran === "orang_tua") {
    redirect("/orangtua");
  }

  return <LandingPage />;
}
