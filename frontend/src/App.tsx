import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider } from "@/components/ui/theme-provider"

import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { ProjectProvider } from "@/contexts/ProjectContext";
import { PreferencesProvider } from "@/contexts/PreferencesContext";

import Teachers from "@/pages/Teachers";
import Schools from "@/pages/Schools";
import TeacherProfile from "@/pages/TeacherProfile";
import SchoolProfile from "@/pages/SchoolProfile";
import Documents from "@/pages/Documents";
import Settings from "@/pages/Settings";
import ProjectSettings from "@/pages/ProjectSettings";
import AlertSettings from "@/pages/AlertSettings";
import StageSettings from "@/pages/StageSettings";
import PreferencesSettings from "@/pages/PreferencesSettings";
import ImportSettings from "@/pages/ImportSettings";
import { Toaster } from "@/components/ui/sonner";

import Dashboard from "@/pages/Dashboard";

const ROUTE_TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/teachers': 'Teachers',
  '/schools': 'Schools',
  '/documents': 'Documents',
  '/settings': 'Settings',
  '/settings/projects': 'Project Settings',
  '/settings/alerts': 'Alert Rules',
  '/settings/stages': 'Pipeline Stages',
  '/settings/preferences': 'User Preferences',
  '/settings/import': 'Data Import',
};

function getPageTitle(pathname: string): string {
  // Exact match first
  if (ROUTE_TITLES[pathname]) {
    return ROUTE_TITLES[pathname];
  }
  // Handle dynamic routes
  if (pathname.startsWith('/teachers/')) return 'Teacher Profile';
  if (pathname.startsWith('/schools/')) return 'School Profile';
  return 'Dashboard';
}

function AppContent() {
  const location = useLocation();
  const title = getPageTitle(location.pathname);

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={title} />
        <main className="flex-1 overflow-y-auto p-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/teachers" element={<Teachers />} />
            <Route path="/schools" element={<Schools />} />
            <Route path="/schools/:id" element={<SchoolProfile />} />
            <Route path="/teachers/:id" element={<TeacherProfile />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/settings/projects" element={<ProjectSettings />} />
            <Route path="/settings/alerts" element={<AlertSettings />} />
            <Route path="/settings/stages" element={<StageSettings />} />
            <Route path="/settings/preferences" element={<PreferencesSettings />} />
            <Route path="/settings/import" element={<ImportSettings />} />
          </Routes>
        </main>
      </div>
      <Toaster />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <Router>
        <PreferencesProvider>
          <ProjectProvider>
            <AppContent />
          </ProjectProvider>
        </PreferencesProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
