// app/pricing/page.tsx
// Pricing is not needed for local use — redirect to dashboard
import { redirect } from "next/navigation";

export default function PricingPage() {
  redirect("/dashboard");
}
