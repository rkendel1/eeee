/**
 * Web API client that provides the same interface as Electron IPC
 * This allows the renderer to work in both Electron and web contexts
 */

// Default API base URL - can be overridden via environment variable
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3001/api";

class WebAPIClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Make an API request
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      credentials: "include", // Include cookies for session management
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API request failed: ${response.status} ${error}`);
    }

    return response.json();
  }

  /**
   * Invoke an IPC-style method
   */
  async invoke(channel: string, ...args: unknown[]): Promise<any> {
    return this.request(`/invoke/${channel}`, {
      method: "POST",
      body: JSON.stringify({ args }),
    });
  }

  /**
   * Subscribe to events (using Server-Sent Events or WebSocket)
   */
  on(channel: string, listener: (...args: unknown[]) => void): () => void {
    const eventSource = new EventSource(`${this.baseUrl}/events/${channel}`, {
      withCredentials: true,
    });

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        listener(data);
      } catch (e) {
        console.error("Failed to parse SSE data:", e);
      }
    };

    eventSource.onerror = (error) => {
      console.error("SSE error:", error);
    };

    // Return cleanup function
    return () => {
      eventSource.close();
    };
  }

  removeAllListeners(_channel: string): void {
    // For web, listeners are managed individually via cleanup functions
    // This is a no-op for compatibility
  }

  removeListener(
    _channel: string,
    _listener: (...args: unknown[]) => void,
  ): void {
    // For web, listeners are managed individually via cleanup functions
    // This is a no-op for compatibility
  }
}

// Create singleton instance
const webAPIClient = new WebAPIClient();

/**
 * Get the IPC renderer (Electron or Web)
 */
export function getIPCRenderer() {
  return {
    invoke: webAPIClient.invoke.bind(webAPIClient),
    on: webAPIClient.on.bind(webAPIClient),
    removeAllListeners: webAPIClient.removeAllListeners.bind(webAPIClient),
    removeListener: webAPIClient.removeListener.bind(webAPIClient),
  };
}
