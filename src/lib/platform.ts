/**
 * Platform detection utilities to determine if running in Electron or Web context
 */

export type Platform = "electron" | "web";

/**
 * Detect the current platform
 */
export function getPlatform(): Platform {
  // Check if we're in an Electron environment
  if (typeof window !== "undefined" && (window as any).electron) {
    return "electron";
  }
  return "web";
}

/**
 * Check if running in Electron
 */
export function isElectron(): boolean {
  return getPlatform() === "electron";
}

/**
 * Check if running in Web
 */
export function isWeb(): boolean {
  return getPlatform() === "web";
}
