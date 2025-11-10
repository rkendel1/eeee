/**
 * Platform-agnostic IPC interface
 * Automatically uses Electron IPC or Web API client based on the environment
 */

import { isElectron } from "./platform";
import { getIPCRenderer as getWebIPCRenderer } from "./web-ipc-client";

/**
 * Get the IPC renderer for the current platform
 */
export function getIPCRenderer() {
  if (isElectron()) {
    // In Electron, use the exposed electron.ipcRenderer
    return (window as any).electron.ipcRenderer;
  } else {
    // In web, use the web API client
    return getWebIPCRenderer();
  }
}

/**
 * Type-safe IPC renderer interface
 */
export const ipc = getIPCRenderer();
