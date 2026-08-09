import { toast } from "sonner";

const getApiBaseUrl = (): string => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  const hostname = window.location.hostname;
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return "http://localhost:5000/api";
  }
  // Local Wi-Fi network IP access (e.g. 192.168.1.40)
  if (/^(192\.168|10\.|172\.(1[6-9]|2[0-9]|3[0-1]))\./.test(hostname)) {
    return `http://${hostname}:5000/api`;
  }
  // Cloudflare Tunnel access (*.trycloudflare.com)
  if (hostname.endsWith(".trycloudflare.com")) {
    return `${window.location.origin}/api`;
  }
  // Fallback production URL for Render deployment (GitHub Pages)
  return "https://diabeguide-backend.onrender.com/api";
};

const API_BASE_URL = getApiBaseUrl();

// Client-side cache disabled to guarantee 100% real-time MongoDB data
const apiCache = new Map<string, { timestamp: number; data: any }>();
const CACHE_TTL_MS = 0; // Always fetch fresh database records

export const getCachedData = (key: string): any | null => {
  const cached = apiCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }
  return null;
};

export const setCachedData = (key: string, data: any): void => {
  apiCache.set(key, { timestamp: Date.now(), data });
};

export const clearApiCache = (): void => {
  apiCache.clear();
};

const getCleanToken = (): string | null => {
  if (typeof window === "undefined") return null;
  let token = localStorage.getItem("token") || sessionStorage.getItem("token");
  if (!token || token === "null" || token === "undefined") return null;
  token = token.trim();
  if (token.startsWith('"') && token.endsWith('"')) {
    token = token.slice(1, -1).trim();
  }
  if (token.startsWith("Bearer ")) {
    token = token.slice(7).trim();
  }
  return token || null;
};

// Helper to get authorization headers
const getHeaders = (isJson = true) => {
  const headers: Record<string, string> = {};
  if (isJson) {
    headers["Content-Type"] = "application/json";
  }
  const token = getCleanToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

// Generic fetch response handler
const handleResponse = async (response: Response) => {
  const isJson = response.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await response.json() : null;

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");
      localStorage.removeItem("user");
      sessionStorage.removeItem("user");
      clearApiCache();
    }
    throw new Error(data?.message || `HTTP Error ${response.status}`);
  }
  return data;
};

export const api = {
  auth: {
    registerOtp: async (username: string, email: string, password: string) => {
      const response = await fetch(`${API_BASE_URL}/auth/register-otp`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ username, email, password }),
      });
      return await handleResponse(response);
    },
    verifyOtp: async (email: string, otp: string) => {
      const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ email, otp }),
      });
      const data = await handleResponse(response);
      if (data && data.token) {
        localStorage.setItem("token", data.token);
        if (data.user) {
          localStorage.setItem("user", JSON.stringify(data.user));
        }
      }
      return data;
    },
    login: async (email: string, password: string, rememberMe = true) => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
      clearApiCache();

      const storage = rememberMe ? localStorage : sessionStorage;
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ email, password }),
      });
      const data = await handleResponse(response);
      if (data && data.token) {
        storage.setItem("token", data.token);
        if (data.user) {
          storage.setItem("user", JSON.stringify(data.user));
        }
      }
      return data;
    },
    logout: () => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
      clearApiCache();
    },
    getMe: async () => {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: "GET",
        headers: getHeaders(),
      });
      return await handleResponse(response);
    },
    updateProfile: async (profileData: any) => {
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(profileData),
      });
      const data = await handleResponse(response);
      if (data && data.user) {
        const storage = localStorage.getItem("token") ? localStorage : sessionStorage;
        storage.setItem("user", JSON.stringify(data.user));
      }
      return data;
    },
    forgotPassword: async (email: string) => {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ email }),
      });
      return await handleResponse(response);
    },
    resetPassword: async (email: string, otp: string, newPassword: string) => {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ email, otp, newPassword }),
      });
      return await handleResponse(response);
    },
  },

  readings: {
    getStats: async (localDate?: string) => {
      const url = localDate
        ? `${API_BASE_URL}/readings/stats?localDate=${localDate}`
        : `${API_BASE_URL}/readings/stats`;
      const response = await fetch(url, {
        method: "GET",
        headers: getHeaders(),
      });
      return await handleResponse(response);
    },
    getAll: async (params?: { startDate?: string; endDate?: string; meal?: string; timeOfDay?: string }) => {
      const queryParams = new URLSearchParams();
      if (params?.startDate) queryParams.append("startDate", params.startDate);
      if (params?.endDate) queryParams.append("endDate", params.endDate);
      if (params?.meal && params.meal !== "all") queryParams.append("meal", params.meal);
      if (params?.timeOfDay && params.timeOfDay !== "all") queryParams.append("timeOfDay", params.timeOfDay);

      const url = `${API_BASE_URL}/readings?${queryParams.toString()}`;
      const response = await fetch(url, {
        method: "GET",
        headers: getHeaders(),
      });
      return await handleResponse(response);
    },
    add: async (reading: { value: number; meal: string; timeOfDay: string; date?: string; time?: string; notes?: string }) => {
      const response = await fetch(`${API_BASE_URL}/readings`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(reading),
      });
      clearApiCache();
      return await handleResponse(response);
    },
    update: async (id: string, reading: { value: number; meal: string; timeOfDay: string; date?: string; time?: string; notes?: string }) => {
      const response = await fetch(`${API_BASE_URL}/readings/${id}`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(reading),
      });
      clearApiCache();
      return await handleResponse(response);
    },
    delete: async (id: string) => {
      const response = await fetch(`${API_BASE_URL}/readings/${id}`, {
        method: "DELETE",
        headers: getHeaders(),
      });
      clearApiCache();
      return await handleResponse(response);
    },
    getWeeklyTrends: async (startDate?: string) => {
      const url = startDate
        ? `${API_BASE_URL}/readings/weekly-trends?startDate=${startDate}`
        : `${API_BASE_URL}/readings/weekly-trends`;
      const response = await fetch(url, {
        method: "GET",
        headers: getHeaders(),
      });
      return await handleResponse(response);
    },
    getDailyTrends: async () => {
      const response = await fetch(`${API_BASE_URL}/readings/daily-trends`, {
        method: "GET",
        headers: getHeaders(),
      });
      return await handleResponse(response);
    },
    getAnalytics: async (timeRange: "week" | "month" | "year" = "month") => {
      const response = await fetch(`${API_BASE_URL}/readings/analytics?timeRange=${timeRange}`, {
        method: "GET",
        headers: getHeaders(),
      });
      return await handleResponse(response);
    },
  },

  chatbot: {
    getSessions: async () => {
      const response = await fetch(`${API_BASE_URL}/chatbot/sessions`, {
        method: "GET",
        headers: getHeaders(),
      });
      return await handleResponse(response);
    },
    getSessionMessages: async (id: string) => {
      const response = await fetch(`${API_BASE_URL}/chatbot/sessions/${id}`, {
        method: "GET",
        headers: getHeaders(),
      });
      return await handleResponse(response);
    },
    saveSession: async (session: { title: string; messages: any[] }) => {
      const response = await fetch(`${API_BASE_URL}/chatbot/sessions`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(session),
      });
      return await handleResponse(response);
    },
    deleteSession: async (id: string) => {
      const response = await fetch(`${API_BASE_URL}/chatbot/sessions/${id}`, {
        method: "DELETE",
        headers: getHeaders(),
      });
      return await handleResponse(response);
    },
    sendMessage: async (sessionId: string, text: string) => {
      const response = await fetch(`${API_BASE_URL}/chatbot/sessions/${sessionId}/message`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ text }),
      });
      return await handleResponse(response);
    },
  },

  emergency: {
    getContacts: async () => {
      const response = await fetch(`${API_BASE_URL}/emergency/contacts`, {
        method: "GET",
        headers: getHeaders(),
      });
      return await handleResponse(response);
    },
    addContact: async (contact: any) => {
      const response = await fetch(`${API_BASE_URL}/emergency/contacts`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(contact),
      });
      return await handleResponse(response);
    },
    deleteContact: async (id: string) => {
      const response = await fetch(`${API_BASE_URL}/emergency/contacts/${id}`, {
        method: "DELETE",
        headers: getHeaders(),
      });
      return await handleResponse(response);
    },
    triggerAlert: async (location?: { lat: number; lng: number }) => {
      const response = await fetch(`${API_BASE_URL}/emergency/alert`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ location }),
      });
      return await handleResponse(response);
    },
  },
};
