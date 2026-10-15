// Pi Network Configuration. Sandbox mode is enabled only when the Pi Sandbox
// launches the app with ?sandbox=true; ordinary production visits remain unchanged.

export const PI_NETWORK_CONFIG = {
  SDK_URL: "https://sdk.minepi.com/pi-sdk.js",
} as const

export function isPiSandboxMode(): boolean {
  if (typeof window === "undefined") return false
  return new URLSearchParams(window.location.search).get("sandbox") === "true"
}

export const BACKEND_CONFIG = {
  BASE_URL: "",
} as const

export const BACKEND_URLS = {
  LOGIN: "/api/auth/pi-login",
} as const
