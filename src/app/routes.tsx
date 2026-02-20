import { createBrowserRouter } from "react-router";
import { MainLayout } from "./components/MainLayout";
import { ChatPage } from "./components/ChatPage";
import { FlashcardsPage } from "./components/FlashcardsPage";
import { DocumentationPage } from "./components/DocumentationPage";
import { SavedAnswersPage } from "./components/SavedAnswersPage";
import { AnalyticsPage } from "./components/AnalyticsPage";
import { SettingsPage } from "./components/SettingsPage";
import { ProfileSettingsPage } from "./components/ProfileSettingsPage";
import { LoginPage } from "./components/LoginPage";
import { SignupPage } from "./components/SignupPage";
import { NotFoundPage } from "./components/NotFoundPage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { PublicRoute } from "./components/PublicRoute";

export const router = createBrowserRouter([
  // Auth routes (public)
  {
    path: "/login",
    element: (
      <PublicRoute>
        <LoginPage />
      </PublicRoute>
    ),
  },
  {
    path: "/signup",
    element: (
      <PublicRoute>
        <SignupPage />
      </PublicRoute>
    ),
  },
  // Protected routes
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, Component: ChatPage },
      { path: "flashcards", Component: FlashcardsPage },
      { path: "documentation", Component: DocumentationPage },
      { path: "saved", Component: SavedAnswersPage },
      { path: "analytics", Component: AnalyticsPage },
      { path: "settings", Component: SettingsPage },
      { path: "profile", Component: ProfileSettingsPage },
      { path: "*", Component: NotFoundPage },
    ],
  },
]);