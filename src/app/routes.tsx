import { createBrowserRouter } from "react-router";
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { SignupPage } from "./pages/SignupPage";
import { DashboardLayout } from "./pages/DashboardLayout";
import { DashboardHome } from "./pages/DashboardHome";
import { TrackerPage } from "./pages/TrackerPage";
import { ChatbotPage } from "./pages/ChatbotPage";
import { ProfilePage } from "./pages/ProfilePage";
import { EmergencyPage } from "./pages/EmergencyPage";
import { ReportsPage } from "./pages/ReportsPage";
import { WelcomePage } from "./pages/WelcomePage";
import { NotFoundPage } from "./pages/NotFoundPage";

const getBasename = (): string => {
  const hostname = window.location.hostname;
  const pathname = window.location.pathname;
  if (hostname.includes("github.io")) {
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length > 0) {
      return `/${segments[0]}`;
    }
  }
  return "/";
};

const basename = getBasename();

export const router = createBrowserRouter([
  {
    path: "/",
    Component: LandingPage,
  },
  {
    path: "/login",
    Component: LoginPage,
  },
  {
    path: "/signup",
    Component: SignupPage,
  },
  {
    path: "/welcome",
    Component: WelcomePage,
  },
  {
    path: "/dashboard",
    Component: DashboardLayout,
    children: [
      { index: true, Component: DashboardHome },
      { path: "tracker", Component: TrackerPage },
      { path: "chatbot", Component: ChatbotPage },
      { path: "profile", Component: ProfilePage },
      { path: "reports", Component: ReportsPage },
      { path: "emergency", Component: EmergencyPage },
    ],
  },
  {
    path: "*",
    Component: NotFoundPage,
  },
], { basename });
