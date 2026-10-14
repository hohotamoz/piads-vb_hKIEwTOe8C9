// Pi Network Configuration for Testnet

export const PI_NETWORK_CONFIG = {
  SDK_URL: "https://sdk.minepi.com/pi-sdk.js",
  // IMPORTANT: Testnet is NOT Sandbox
  // sandbox=false for Testnet environment
  // sandbox=true only for Sandbox environment (sandbox.minepi.com)
  SANDBOX: false,
} as const

export const BACKEND_CONFIG = {
  BASE_URL: "",
} as const

export const BACKEND_URLS = {
  LOGIN: "/api/auth/pi-login",
} as const
