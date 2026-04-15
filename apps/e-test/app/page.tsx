import { redirect } from "next/navigation";

const DOTSCHOOL_URL = process.env.NEXT_PUBLIC_DOTSCHOOL_URL || "http://localhost:3000";

export default function HomePage() {
  redirect(DOTSCHOOL_URL);
}
