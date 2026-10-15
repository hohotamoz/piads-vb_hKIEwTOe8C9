import { redirect } from "next/navigation"

/** Pi Network is the only supported user-facing authentication method. */
export default function RegisterPage() {
  redirect("/auth/login")
}
