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

export default function App() {
  const [activeView, setActiveView] = useState("dashboard");
  const [selectedEventId, setSelectedEventId] = useState<
    string | null
  >(null);

  const handleViewChange = (view: string, eventId?: string) => {
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
      case "aprovacoes":
        return <ApprovalsView />;
      case "relatorios":
        return <ReportsView />;
      default:
        return <Dashboard onViewChange={handleViewChange} />;
    }
  };

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