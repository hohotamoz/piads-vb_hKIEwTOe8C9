import { redirect } from "next/navigation"

/** Pi Network is the only supported user-facing authentication method. */
export default function OAuthCallbackProcessingPage() {
  redirect("/auth/login?error=pi_only_auth")
}
