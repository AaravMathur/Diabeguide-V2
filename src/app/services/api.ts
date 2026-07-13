import { toast } from "sonner";

const getApiBaseUrl = (): string => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  const hostname = window.location.hostname;
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return "http://localhost:5000/api";
  }
  // Fallback production URL for Render deployment
  return "https://diabeguide-backend.onrender.com/api";
};

const API_BASE_URL = getApiBaseUrl();

// Track whether the app has switched to offline mock mode
let useMockMode = localStorage.getItem("demo_mode") === "true";

if (typeof window !== "undefined") {
  useMockMode = false;
  localStorage.removeItem("demo_mode");
}

const isNetworkError = (err: any) => {
  return err instanceof TypeError || err.message?.includes("Failed to fetch") || err.message?.includes("network error") || err.message?.includes("Load failed");
};

const getLocalTodayString = (): string => {
  const localDate = new Date();
  const yyyy = localDate.getFullYear();
  const mm = String(localDate.getMonth() + 1).padStart(2, "0");
  const dd = String(localDate.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};const triggerMockMode = () => {
  if (typeof window !== "undefined" && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
    throw new Error("Unable to connect to the cloud database server. Please refresh or try again in a few seconds.");
  }
  if (!useMockMode) {
    useMockMode = true;
    localStorage.setItem("demo_mode", "true");
    toast.info("Connection to local database server failed. DiabeGuide has automatically switched to Offline Demo Mode! All your logs and chats are saved securely in your browser.", {
      duration: 9000,
      position: "top-center"
    });
  }
};
// Helper to get authorization headers
const getHeaders = (isJson = true) => {
  const headers: Record<string, string> = {};
  if (isJson) {
    headers["Content-Type"] = "application/json";
  }
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
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
    if (response.status === 401 || response.status === 410) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
      if (window.location.hash !== "#/login" && window.location.hash !== "#/signup" && window.location.hash !== "") {
        window.location.hash = "/login";
      }
    }
    throw new Error(data?.message || "Something went wrong");
  }
  return data;
};

// ==========================================
// OFFLINE MOCK IMPLEMENTATION (LOCALSTORAGE)
// ==========================================

const getLocalReadings = (): any[] => {
  const data = localStorage.getItem("demo_readings");
  if (!data) {
    const defaultReadings = [
      { _id: "1", value: 150, meal: "After Lunch", timeOfDay: "Afternoon", date: new Date().toISOString().split("T")[0], time: "01:12 PM" },
      { _id: "2", value: 130, meal: "Before Lunch", timeOfDay: "Afternoon", date: new Date(Date.now() - 86400000).toISOString().split("T")[0], time: "04:20 PM" },
      { _id: "3", value: 105, meal: "After Breakfast", timeOfDay: "Morning", date: new Date(Date.now() - 172800000).toISOString().split("T")[0], time: "09:30 AM" }
    ];
    localStorage.setItem("demo_readings", JSON.stringify(defaultReadings));
    return defaultReadings;
  }
  return JSON.parse(data);
};

const saveLocalReadings = (readings: any[]) => {
  localStorage.setItem("demo_readings", JSON.stringify(readings));
};

const parseDateTime = (dateStr: string, timeStr: string): Date => {
  try {
    const parts = timeStr.trim().split(" ");
    const timePart = parts[0];
    const ampm = parts[1]?.toLowerCase();
    let [hours, minutes] = timePart.split(":").map(Number);
    if (ampm === "pm" && hours !== 12) {
      hours += 12;
    } else if (ampm === "am" && hours === 12) {
      hours = 0;
    }
    const hh = String(hours).padStart(2, "0");
    const mm = String(minutes).padStart(2, "0");
    return new Date(`${dateStr}T${hh}:${mm}:00`);
  } catch (e) {
    return new Date(dateStr);
  }
};

const getStartOfWeekDateString = (): string => {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  const yyyy = monday.getFullYear();
  const mm = String(monday.getMonth() + 1).padStart(2, "0");
  const dd = String(monday.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const getLocalChatSessions = (): any[] => {
  const data = localStorage.getItem("demo_chat_sessions");
  if (!data) {
    const defaultSessions = [
      {
        _id: "demo-welcome",
        title: "Welcome Chat",
        createdAt: new Date().toLocaleDateString(),
        updatedAt: new Date(),
        messages: [
          { text: "Hello! I'm your AI diabetes assistant. How can I help you today?", sender: "ai", timestamp: "10:00 AM" }
        ]
      }
    ];
    localStorage.setItem("demo_chat_sessions", JSON.stringify(defaultSessions));
    return defaultSessions;
  }
  return JSON.parse(data);
};

const saveLocalChatSessions = (sessions: any[]) => {
  localStorage.setItem("demo_chat_sessions", JSON.stringify(sessions));
};

// ==========================================
// CORE API EXPORTS
// ==========================================

export const api = {
  // Authentication & Profile API
  auth: {
    registerOtp: async (username: string, email: string, password: string) => {
      if (useMockMode) {
        return { message: "Demo OTP sent to your email!", devOtp: "123456" };
      }
      try {
        const response = await fetch(`${API_BASE_URL}/auth/register-otp`, {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify({ username, email, password }),
        });
        return await handleResponse(response);
      } catch (err) {
        if (isNetworkError(err)) {
          triggerMockMode();
          return { message: "Demo OTP sent to your email!", devOtp: "123456" };
        }
        throw err;
      }
    },
    verifyOtp: async (email: string, otp: string) => {
      if (useMockMode) {
        if (otp !== "123456") {
          throw new Error("Invalid verification code. Use '123456' for Demo mode.");
        }
        const user = { name: email.split("@")[0], email, avatar: "", diabetesType: "Type 2", weight: 75, age: 35 };
        localStorage.setItem("token", "demo-token-12345");
        localStorage.setItem("user", JSON.stringify(user));
        return { message: "Verified successfully", token: "demo-token-12345", user };
      }
      try {
        const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify({ email, otp }),
        });
        const data = await handleResponse(response);
        if (data.token) {
          localStorage.setItem("token", data.token);
          localStorage.setItem("user", JSON.stringify(data.user));
        }
        return data;
      } catch (err) {
        if (isNetworkError(err)) {
          triggerMockMode();
          if (otp !== "123456") {
            throw new Error("Invalid verification code. Use '123456' for Demo mode.");
          }
          const user = { name: email.split("@")[0], email, avatar: "", diabetesType: "Type 2", weight: 75, age: 35 };
          localStorage.setItem("token", "demo-token-12345");
          localStorage.setItem("user", JSON.stringify(user));
          return { message: "Verified successfully", token: "demo-token-12345", user };
        }
        throw err;
      }
    },
    login: async (email: string, password: string, rememberMe = true) => {
      const storage = rememberMe ? localStorage : sessionStorage;
      if (useMockMode) {
        const user = { name: email.split("@")[0] || "Aarav", email, avatar: "", diabetesType: "Type 2", weight: 75, age: 35 };
        storage.setItem("token", "demo-token-12345");
        storage.setItem("user", JSON.stringify(user));
        return { token: "demo-token-12345", user };
      }
      try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify({ email, password }),
        });
        const data = await handleResponse(response);
        if (data.token) {
          storage.setItem("token", data.token);
          storage.setItem("user", JSON.stringify(data.user));
        }
        return data;
      } catch (err) {
        if (isNetworkError(err)) {
          triggerMockMode();
          const user = { name: email.split("@")[0] || "Aarav", email, avatar: "", diabetesType: "Type 2", weight: 75, age: 35 };
          storage.setItem("token", "demo-token-12345");
          storage.setItem("user", JSON.stringify(user));
          return { token: "demo-token-12345", user };
        }
        throw err;
      }
    },
    logout: () => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
      localStorage.removeItem("demo_mode");
      useMockMode = false;
    },
    getMe: async () => {
      if (useMockMode) {
        const localUser = localStorage.getItem("user") || sessionStorage.getItem("user");
        return { user: localUser ? JSON.parse(localUser) : { name: "Demo User", email: "demo@example.com" } };
      }
      try {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
          method: "GET",
          headers: getHeaders(),
        });
        return await handleResponse(response);
      } catch (err) {
        if (isNetworkError(err)) {
          triggerMockMode();
          const localUser = localStorage.getItem("user") || sessionStorage.getItem("user");
          return { user: localUser ? JSON.parse(localUser) : { name: "Demo User", email: "demo@example.com" } };
        }
        throw err;
      }
    },
    updateProfile: async (profileData: any) => {
      if (useMockMode) {
        const localUser = localStorage.getItem("user") || sessionStorage.getItem("user");
        const user = localUser ? JSON.parse(localUser) : { name: "Demo User", email: "demo@example.com" };
        const updatedUser = { ...user, ...profileData };
        if (localStorage.getItem("user")) {
          localStorage.setItem("user", JSON.stringify(updatedUser));
        } else {
          sessionStorage.setItem("user", JSON.stringify(updatedUser));
        }
        return { user: updatedUser };
      }
      try {
        const response = await fetch(`${API_BASE_URL}/auth/profile`, {
          method: "PUT",
          headers: getHeaders(),
          body: JSON.stringify(profileData),
        });
        const data = await handleResponse(response);
        if (data.user) {
          localStorage.setItem("user", JSON.stringify(data.user));
        }
        return data;
      } catch (err) {
        if (isNetworkError(err)) {
          triggerMockMode();
          const localUser = localStorage.getItem("user");
          const user = localUser ? JSON.parse(localUser) : { name: "Demo User", email: "demo@example.com" };
          const updatedUser = { ...user, ...profileData };
          localStorage.setItem("user", JSON.stringify(updatedUser));
          return { user: updatedUser };
        }
        throw err;
      }
    },
    forgotPassword: async (email: string) => {
      if (useMockMode) {
        return { message: "Demo OTP sent to your email!", devOtp: "123456" };
      }
      try {
        const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify({ email }),
        });
        return await handleResponse(response);
      } catch (err) {
        if (isNetworkError(err)) {
          triggerMockMode();
          return { message: "Demo OTP sent to your email!", devOtp: "123456" };
        }
        throw err;
      }
    },
    resetPassword: async (email: string, otp: string, newPassword: string) => {
      if (useMockMode) {
        if (otp !== "123456") {
          throw new Error("Invalid verification code. Use '123456' for Demo mode.");
        }
        return { message: "Password reset successfully" };
      }
      try {
        const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify({ email, otp, newPassword }),
        });
        return await handleResponse(response);
      } catch (err) {
        if (isNetworkError(err)) {
          triggerMockMode();
          if (otp !== "123456") {
            throw new Error("Invalid verification code. Use '123456' for Demo mode.");
          }
          return { message: "Password reset successfully" };
        }
        throw err;
      }
    },
  },

  // Glucose Readings API
  readings: {
    add: async (readingData: any) => {
      if (useMockMode) {
        const list = getLocalReadings();
        const newReading = { ...readingData, _id: String(Date.now()) };
        list.push(newReading);
        saveLocalReadings(list);
        return { message: "Reading added successfully", reading: newReading };
      }
      try {
        const response = await fetch(`${API_BASE_URL}/readings`, {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify(readingData),
        });
        return await handleResponse(response);
      } catch (err) {
        if (isNetworkError(err)) {
          triggerMockMode();
          const list = getLocalReadings();
          const newReading = { ...readingData, _id: String(Date.now()) };
          list.push(newReading);
          saveLocalReadings(list);
          return { message: "Reading added successfully", reading: newReading };
        }
        throw err;
      }
    },
    getAll: async () => {
      if (useMockMode) {
        const list = getLocalReadings();
        const sorted = [...list].sort((a, b) => {
          return parseDateTime(b.date, b.time).getTime() - parseDateTime(a.date, a.time).getTime();
        });
        return { readings: sorted };
      }
      try {
        const response = await fetch(`${API_BASE_URL}/readings`, {
          method: "GET",
          headers: getHeaders(),
        });
        return await handleResponse(response);
      } catch (err) {
        if (isNetworkError(err)) {
          triggerMockMode();
          const list = getLocalReadings();
          const sorted = [...list].sort((a, b) => {
            return parseDateTime(b.date, b.time).getTime() - parseDateTime(a.date, a.time).getTime();
          });
          return { readings: sorted };
        }
        throw err;
      }
    },
    getStats: async () => {
      if (useMockMode) {
        const allReadings = getLocalReadings();
        if (allReadings.length === 0) {
          return {
            currentGlucose: 0,
            currentStatus: "No Data",
            changeMessage: "Log readings to calculate trends",
            weeklyAverage: 0,
            weeklyStatus: "No Data",
            monthlyReadingsCount: 0,
            readingsCountMessage: "No logs registered",
            targetRange: "70-130",
            inRangePercentage: 0,
            isMock: true
          };
        }

        const sorted = [...allReadings].sort((a, b) => {
          return parseDateTime(b.date, b.time).getTime() - parseDateTime(a.date, a.time).getTime();
        });

        const currentReadingObj = sorted[0];
        const currentGlucose = currentReadingObj.value;

        const getStatus = (val: number): string => {
          if (val < 70) return "Low";
          if (val > 130 && val <= 180) return "Slightly High";
          if (val > 180) return "High";
          return "Normal";
        };
        const currentStatus = getStatus(currentGlucose);

        // Filter for current calendar week (Monday to Sunday)
        const startOfWeek = getStartOfWeekDateString();
        const weeklyReadings = allReadings.filter(r => r.date >= startOfWeek);

        let weeklyAverage = 0;
        let weeklyStatus = "Excellent";
        if (weeklyReadings.length > 0) {
          const sum = weeklyReadings.reduce((acc, r) => acc + r.value, 0);
          weeklyAverage = Math.round(sum / weeklyReadings.length);
          if (weeklyAverage < 70) weeklyStatus = "Low";
          else if (weeklyAverage <= 130) weeklyStatus = "Excellent";
          else if (weeklyAverage <= 180) weeklyStatus = "Moderate";
          else weeklyStatus = "High";
        } else {
          weeklyStatus = "No logs this week";
        }

        const inRangeCount = allReadings.filter(r => r.value >= 70 && r.value <= 130).length;
        const inRangePercentage = Math.round((inRangeCount / allReadings.length) * 100);

        return {
          currentGlucose,
          currentStatus,
          changeMessage: sorted.length > 1 ? `${Math.abs(currentGlucose - sorted[1].value)} mg/dL change from last log` : "Initial logged reading",
          weeklyAverage,
          weeklyStatus,
          monthlyReadingsCount: allReadings.length,
          readingsCountMessage: "Logs securely recorded in browser memory",
          targetRange: "70-130",
          inRangePercentage,
          isMock: true
        };
      }
      try {
        const localDate = getLocalTodayString();
        const response = await fetch(`${API_BASE_URL}/readings/stats?localDate=${localDate}`, {
          method: "GET",
          headers: getHeaders(),
        });
        return await handleResponse(response);
      } catch (err) {
        if (isNetworkError(err)) {
          triggerMockMode();
          // Recursively call mock version
          return await api.readings.getStats();
        }
        throw err;
      }
    },
    getWeeklyTrends: async () => {
      if (useMockMode) {
        const allReadings = getLocalReadings();
        const startOfWeek = getStartOfWeekDateString();
        const weeklyReadings = allReadings.filter(r => r.date >= startOfWeek);

        const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        const dayMapping: Record<number, string> = { 1: "Mon", 2: "Tue", 3: "Wed", 4: "Thu", 5: "Fri", 6: "Sat", 0: "Sun" };

        const trendData = days.map(day => ({
          day,
          morning: null as number | null,
          afternoon: null as number | null,
          evening: null as number | null,
          night: null as number | null
        }));

        weeklyReadings.forEach(r => {
          const dateObj = new Date(r.date);
          const dayName = dayMapping[dateObj.getDay()];
          const slot = trendData.find(t => t.day === dayName);
          if (slot) {
            const timeOfDayLower = r.timeOfDay.toLowerCase();
            if (timeOfDayLower.includes("morning")) slot.morning = r.value;
            else if (timeOfDayLower.includes("afternoon")) slot.afternoon = r.value;
            else if (timeOfDayLower.includes("evening")) slot.evening = r.value;
            else if (timeOfDayLower.includes("night")) slot.night = r.value;
          }
        });

        return { weeklyTrends: trendData };
      }
      try {
        const localDate = getLocalTodayString();
        const response = await fetch(`${API_BASE_URL}/readings/weekly-trends?localDate=${localDate}`, {
          method: "GET",
          headers: getHeaders(),
        });
        return await handleResponse(response);
      } catch (err) {
        if (isNetworkError(err)) {
          triggerMockMode();
          return await api.readings.getWeeklyTrends();
        }
        throw err;
      }
    },
    getDailyTrends: async () => {
      if (useMockMode) {
        const allReadings = getLocalReadings();
        const localDateObj = new Date();
        const yyyy = localDateObj.getFullYear();
        const mm = String(localDateObj.getMonth() + 1).padStart(2, "0");
        const dd = String(localDateObj.getDate()).padStart(2, "0");
        const todayStr = `${yyyy}-${mm}-${dd}`;
        const todayReadings = allReadings.filter(r => r.date === todayStr);

        const sorted = [...todayReadings].sort((a, b) => {
          return parseDateTime(a.date, a.time).getTime() - parseDateTime(b.date, b.time).getTime();
        });

        return { dailyTrends: sorted };
      }
      try {
        const localDate = getLocalTodayString();
        const response = await fetch(`${API_BASE_URL}/readings/daily-trends?localDate=${localDate}`, {
          method: "GET",
          headers: getHeaders(),
        });
        return await handleResponse(response);
      } catch (err) {
        if (isNetworkError(err)) {
          triggerMockMode();
          return await api.readings.getDailyTrends();
        }
        throw err;
      }
    },
    delete: async (id: string) => {
      if (useMockMode) {
        const list = getLocalReadings();
        const filtered = list.filter((r: any) => r._id !== id);
        saveLocalReadings(filtered);
        return { message: "Reading deleted successfully" };
      }
      try {
        const response = await fetch(`${API_BASE_URL}/readings/${id}`, {
          method: "DELETE",
          headers: getHeaders(),
        });
        return await handleResponse(response);
      } catch (err) {
        if (isNetworkError(err)) {
          triggerMockMode();
          const list = getLocalReadings();
          const filtered = list.filter((r: any) => r._id !== id);
          saveLocalReadings(filtered);
          return { message: "Reading deleted successfully" };
        }
        throw err;
      }
    },
  },

  // Chatbot Assistant API
  chatbot: {
    getSessions: async () => {
      if (useMockMode) {
        return { sessions: getLocalChatSessions() };
      }
      try {
        const response = await fetch(`${API_BASE_URL}/chatbot/sessions`, {
          method: "GET",
          headers: getHeaders(),
        });
        return await handleResponse(response);
      } catch (err) {
        if (isNetworkError(err)) {
          triggerMockMode();
          return { sessions: getLocalChatSessions() };
        }
        throw err;
      }
    },
    createSession: async (title: string) => {
      if (useMockMode) {
        const list = getLocalChatSessions();
        const newSession = {
          _id: String(Date.now()),
          title: title || "New Discussion",
          createdAt: new Date().toLocaleDateString(),
          updatedAt: new Date(),
          messages: [
            { text: "Hello! I'm your AI diabetes assistant. How can I help you today?", sender: "ai", timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }
          ]
        };
        list.unshift(newSession);
        saveLocalChatSessions(list);
        return { session: newSession };
      }
      try {
        const response = await fetch(`${API_BASE_URL}/chatbot/sessions`, {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify({ title }),
        });
        return await handleResponse(response);
      } catch (err) {
        if (isNetworkError(err)) {
          triggerMockMode();
          const list = getLocalChatSessions();
          const newSession = {
            _id: String(Date.now()),
            title: title || "New Discussion",
            createdAt: new Date().toLocaleDateString(),
            updatedAt: new Date(),
            messages: [
              { text: "Hello! I'm your AI diabetes assistant. How can I help you today?", sender: "ai", timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }
            ]
          };
          list.unshift(newSession);
          saveLocalChatSessions(list);
          return { session: newSession };
        }
        throw err;
      }
    },
    getSessionMessages: async (sessionId: string) => {
      if (useMockMode) {
        const list = getLocalChatSessions();
        const session = list.find(s => s._id === sessionId);
        return { messages: session ? session.messages : [] };
      }
      try {
        const response = await fetch(`${API_BASE_URL}/chatbot/sessions/${sessionId}`, {
          method: "GET",
          headers: getHeaders(),
        });
        return await handleResponse(response);
      } catch (err) {
        if (isNetworkError(err)) {
          triggerMockMode();
          const list = getLocalChatSessions();
          const session = list.find(s => s._id === sessionId);
          return { messages: session ? session.messages : [] };
        }
        throw err;
      }
    },
    sendMessage: async (sessionId: string, text: string) => {
      if (useMockMode) {
        const list = getLocalChatSessions();
        let session = list.find(s => s._id === sessionId);
        if (!session) {
          session = {
            _id: sessionId === "new" ? String(Date.now()) : sessionId,
            title: text.substring(0, 30) + (text.length > 30 ? "..." : ""),
            createdAt: new Date().toLocaleDateString(),
            updatedAt: new Date(),
            messages: []
          };
          list.unshift(session);
        }

        const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        const userMsg = { text, sender: "user", timestamp };
        session.messages.push(userMsg);

        // Generate customized fallback response based on logs
        const readings = getLocalReadings();
        const latest = readings.length > 0 ? readings[0] : null;
        let evalText = "no recent logs found";
        let status = "normal";
        let personalizedDos = "";
        let personalizedDonts = "";

        if (latest) {
          const val = latest.value;
          if (val < 70) {
            status = "low";
            evalText = `low (hypoglycemia: **${val} mg/dL** logged on ${latest.date} - ${latest.meal})`;
            personalizedDos = 
              "• **Eat fast-acting sugar**: Take 15g of simple carbs immediately (e.g. 4 oz fruit juice or soda).\n" +
              "• **Rest & Recheck**: Sit down, wait 15 minutes, and re-test.\n" +
              "• **Stabilize**: Once above 70 mg/dL, eat a snack with protein/complex carbs to prevent another drop.";
            personalizedDonts = 
              "• **Do NOT skip meals** or wait for hours before eating.\n" +
              "• **Do NOT inject extra fast-acting insulin**.\n" +
              "• **Do NOT perform physical exercise** while sugar is low.";
          } else if (val > 130) {
            status = "high";
            evalText = `high (hyperglycemia: **${val} mg/dL** logged on ${latest.date} - ${latest.meal})`;
            personalizedDos = 
              "• **Hydrate heavily**: Drink plenty of water to help kidneys flush sugar.\n" +
              "• **Light walking**: Take a relaxed 15-minute walk. Muscle uptake naturally lowers glucose.\n" +
              "• **Check Ketones**: If above 250 mg/dL, check for ketones and contact your doctor.";
            personalizedDonts = 
              "• **Do NOT eat simple carbohydrates or high-glycemic foods** (white bread, sweets, juice).\n" +
              "• **Do NOT perform intense workouts**, which can stress the body and temporarily raise levels.";
          } else {
            status = "normal";
            evalText = `normal (**${val} mg/dL** logged on ${latest.date} - ${latest.meal})`;
            personalizedDos = 
              "• **Maintain consistency**: Keep up your current healthy meal plans and exercise routine.\n" +
              "• **Stay hydrated**: Choose water over sweetened drinks.\n" +
              "• **Log regularly**: Continue tracking to map your daily patterns.";
            personalizedDonts = 
              "• **Do NOT skip meals**, as keeping consistent intervals helps prevent sudden dips or spikes.\n" +
              "• **Do NOT overindulge in high-sugar treats** simply because your current level is balanced.";
          }
        } else {
          evalText = "I noticed you haven't logged any glucose readings yet. Please log your blood glucose in the Tracker page so I can provide customized clinical advice!";
          personalizedDos = "• Log your logs regularly to capture your daily pattern.";
          personalizedDonts = "• Do not skip logs.";
        }

        const q = text.toLowerCase();
        let responseBody = "";

        if (q.includes("eat") || q.includes("food") || q.includes("lunch") || q.includes("dinner") || q.includes("diet")) {
          responseBody = `### Diet & Nutrition Advice\nGiven your glucose level is **${status}**, here are meal guidelines:\n\n` +
            `**What you CAN do:**\n${personalizedDos}\n` +
            `• Focus on lean proteins (chicken, fish, tofu) and non-starchy vegetables.\n` +
            `• Choose fiber-rich, low-GI foods like leafy greens, oats, or chia seeds.\n\n` +
            `**What you CANNOT do:**\n${personalizedDonts}\n` +
            `• Do not consume processed snacks, white bread, or sweet sodas.`;
        } else if (q.includes("exercise") || q.includes("workout") || q.includes("activity") || q.includes("walk")) {
          responseBody = `### Physical Exercise Guidelines\nHere is how to manage physical movement at your glucose level:\n\n` +
            `**What you CAN do:**\n${personalizedDos}\n` +
            `• Brisk walking for 15-20 minutes after meals is highly recommended to lower post-meal spikes.\n\n` +
            `**What you CANNOT do:**\n${personalizedDonts}\n` +
            `• Do not execute intense workouts without checking your blood sugar levels and ensuring it is safe.`;
        } else {
          responseBody = `### Health & Activity Advice\nHere are recommendations based on your logs:\n\n` +
            `**Action Steps (What you CAN do):**\n${personalizedDos}\n\n` +
            `**Precautions (What you CANNOT do):**\n${personalizedDonts}`;
        }

        const aiReplyText = `[Demo mode AI]: Based on your recent logging history, ${evalText}.\n\n${responseBody}\n\n*Critical Warning: Always confirm medical choices with your doctor or call 911 in case of emergency.*`;
        
        const aiMsg = { text: aiReplyText, sender: "ai" as const, timestamp };
        session.messages.push(aiMsg);
        session.updatedAt = new Date();

        saveLocalChatSessions(list);
        return {
          message: "Message processed",
          userMessage: userMsg,
          aiMessage: aiMsg,
          sessionId: session._id,
          sessionTitle: session.title
        };
      }
      try {
        const response = await fetch(`${API_BASE_URL}/chatbot/sessions/${sessionId}/message`, {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify({ text }),
        });
        return await handleResponse(response);
      } catch (err) {
        if (isNetworkError(err)) {
          triggerMockMode();
          return await api.chatbot.sendMessage(sessionId, text);
        }
        throw err;
      }
    },
  },

  // Reports & Analytics API
  reports: {
    getAnalytics: async () => {
      if (useMockMode) {
        const allReadings = getLocalReadings();
        return {
          stats: {
            total: allReadings.length,
            average: allReadings.length > 0 ? Math.round(allReadings.reduce((a, r) => a + r.value, 0) / allReadings.length) : 0,
            highCount: allReadings.filter(r => r.value > 130).length,
            lowCount: allReadings.filter(r => r.value < 70).length,
            inRange: allReadings.filter(r => r.value >= 70 && r.value <= 130).length
          }
        };
      }
      try {
        const response = await fetch(`${API_BASE_URL}/reports`, {
          method: "GET",
          headers: getHeaders(),
        });
        return await handleResponse(response);
      } catch (err) {
        if (isNetworkError(err)) {
          triggerMockMode();
          return await api.reports.getAnalytics();
        }
        throw err;
      }
    },
  },
};
