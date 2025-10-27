import { useState, useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthPage } from "./pages/AuthPage";
import { PartnerDashboard } from "./pages/PartnerDashboard";
import { AgentDashboard } from "./pages/AgentDashboard";
import { AdminDashboard } from "./pages/AdminDashboard";
import { AppHeader } from "./components/AppHeader";

function AppContent() {
  const { data: currentUser, isLoading, error } = useQuery<any>({
    queryKey: ["/api/auth/me"],
    retry: false,
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/auth/logout");
    },
    onSuccess: () => {
      queryClient.clear();
    },
  });

  const handleLogin = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!currentUser || error) {
    return <AuthPage onLogin={handleLogin} />;
  }

  const userRole = currentUser?.role;
  const userName = currentUser?.fullName;
  const userId = currentUser?.id;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppHeader userName={userName} userRole={userRole} onLogout={handleLogout} />
      <main className="flex-1 p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {userRole === "partner" && <PartnerDashboard />}
          {userRole === "agent" && <AgentDashboard />}
          {userRole === "admin" && <AdminDashboard />}
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppContent />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
