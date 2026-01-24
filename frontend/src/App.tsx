import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";

import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { ProjectProvider } from "@/contexts/ProjectContext";

import Teachers from "@/pages/Teachers";
import Schools from "@/pages/Schools";
import TeacherProfile from "@/pages/TeacherProfile";
import SchoolProfile from "@/pages/SchoolProfile";
import Documents from "@/pages/Documents";
import Settings from "@/pages/Settings";
import ProjectSettings from "@/pages/ProjectSettings";
import { Toaster } from "@/components/ui/sonner";

import Dashboard from "@/pages/Dashboard";

const ROUTE_TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/teachers': 'Teachers',
  '/schools': 'Schools',
  '/documents': 'Documents',
  '/settings': 'Settings',
  '/settings/projects': 'Project Settings',
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
    <div className="flex h-screen bg-slate-50">
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
          </Routes>
        </main>
      </div>
      <Toaster />
    </div>
  );
}

function App() {
  return (
    <Router>
      <ProjectProvider>
        <AppContent />
      </ProjectProvider>
    </Router>
  );
}

export default App;
