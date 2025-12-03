import { useState } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Dashboard from "./components/Dashboard";
import EventsList from "./components/EventsList";
import EventForm from "./components/EventForm";
import EventDetails from "./components/EventDetails";
import TasksManager from "./components/TasksManager";
import ApprovalsView from "./components/ApprovalsView";
import ReportsView from "./components/ReportsView";
import TeamManager from "./components/TeamManager";
import Login from "./components/Login";
import BudgetManager from "./components/BudgetManager";
import { useAuth } from "./contexts/AuthContext";

export default function App() {
  const { user, loading, profileLoading, teamsLoading, isAdmin, canAccessApprovals } = useAuth();
  const [activeView, setActiveView] = useState("dashboard");
  const [selectedEventId, setSelectedEventId] = useState<
    string | null
  >(null);

  const handleViewChange = (view: string, eventId?: string) => {
    if (view === "configuracoes" && !isAdmin) {
      return;
    }
    if (view === "aprovacoes" && !canAccessApprovals) {
      return;
    }
    setActiveView(view);
    if (eventId) {
      setSelectedEventId(eventId);
    }
  };

  const handleBackToList = () => {
    setActiveView("eventos");
    setSelectedEventId(null);
  };

  const renderContent = () => {
    switch (activeView) {
      case "dashboard":
        return <Dashboard onViewChange={handleViewChange} />;
      case "eventos":
        return <EventsList onViewChange={handleViewChange} />;
      case "novo-evento":
        return <EventForm onBack={handleBackToList} />;
      case "evento-detalhes":
        return selectedEventId ? (
          <EventDetails
            eventId={selectedEventId}
            onBack={handleBackToList}
          />
        ) : (
          <EventsList onViewChange={handleViewChange} />
        );
      case "tarefas":
        return <TasksManager />;
      case "orcamentos":
        return <BudgetManager />;
      case "aprovacoes":
        return canAccessApprovals ? (
          <ApprovalsView />
        ) : (
          <Dashboard onViewChange={handleViewChange} />
        );
      case "relatorios":
        return <ReportsView />;
      case "configuracoes":
        return isAdmin ? <TeamManager /> : <Dashboard onViewChange={handleViewChange} />;
      default:
        return <Dashboard onViewChange={handleViewChange} />;
    }
  };

  if (loading || profileLoading || teamsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-gray-500">
            Carregando informações de acesso...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        activeView={activeView}
        onViewChange={handleViewChange}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
