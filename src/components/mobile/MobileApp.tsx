import { useState } from "react";
import { Calendar, CheckSquare, LayoutGrid, PlusCircle, BarChart3, ArrowLeft } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import MobileDashboard from "./MobileDashboard";
import MobileEvents from "./MobileEvents";
import MobileEventDetails from "./MobileEventDetails";
import MobileApprovals from "./MobileApprovals";
import MobileReports from "./MobileReports";
import EventForm from "../EventForm";

type MobileView =
  | "dashboard"
  | "eventos"
  | "aprovacoes"
  | "relatorios"
  | "evento-detalhes"
  | "novo-evento"
  | "editar-evento";

const tabs = [
  { id: "dashboard", label: "Resumo", icon: LayoutGrid },
  { id: "eventos", label: "Eventos", icon: Calendar },
  { id: "aprovacoes", label: "Aprovações", icon: CheckSquare },
  { id: "relatorios", label: "Relatórios", icon: BarChart3 },
];

export default function MobileApp() {
  const { profile, user, signOut, isAdmin, canAccessApprovals } = useAuth();
  const [view, setView] = useState<MobileView>("dashboard");
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const handleSelectEvent = (eventId: string) => {
    setSelectedEventId(eventId);
    setView("evento-detalhes");
  };

  const handleCreateEvent = () => setView("novo-evento");
  const handleEditEvent = (eventId: string) => {
    setSelectedEventId(eventId);
    setView("editar-evento");
  };

  const currentTab = view === "evento-detalhes" || view === "novo-evento" || view === "editar-evento" ? "eventos" : view;
  const isDetailView = view === "evento-detalhes" || view === "novo-evento" || view === "editar-evento";

  const renderTitle = () => {
    if (view === "evento-detalhes") return "Detalhes do Evento";
    if (view === "novo-evento") return "Novo Evento";
    if (view === "editar-evento") return "Editar Evento";
    if (view === "dashboard") return "Painel geral";
    if (view === "eventos") return "Eventos";
    if (view === "aprovacoes") return "Aprovações";
    if (view === "relatorios") return "Relatórios";
    return "Sistema";
  };

  const renderContent = () => {
    switch (view) {
      case "dashboard":
        return <MobileDashboard onCreateEvent={handleCreateEvent} onSelectEvent={handleSelectEvent} />;
      case "eventos":
        return <MobileEvents onCreateEvent={handleCreateEvent} onSelectEvent={handleSelectEvent} />;
      case "aprovacoes":
        return canAccessApprovals ? <MobileApprovals /> : <p className="text-sm text-gray-500">Sem acesso.</p>;
      case "relatorios":
        return <MobileReports />;
      case "evento-detalhes":
        return selectedEventId ? (
          <MobileEventDetails eventId={selectedEventId} onEdit={handleEditEvent} />
        ) : (
          <p className="text-sm text-gray-500">Selecione um evento.</p>
        );
      case "novo-evento":
        return <EventForm onBack={() => setView("eventos")} />;
      case "editar-evento":
        return selectedEventId ? (
          <EventForm eventId={selectedEventId} onBack={() => setView("eventos")} />
        ) : (
          <p className="text-sm text-gray-500">Selecione um evento.</p>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 pb-20">
      <header className="bg-white px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isDetailView ? (
            <button onClick={() => setView("eventos")} className="p-2 rounded-lg border border-gray-200 text-gray-600">
              <ArrowLeft className="w-5 h-5" />
            </button>
          ) : null}
          <div>
            <p className="text-xs text-gray-500">{profile?.nome ?? user?.email}</p>
            <h1 className="text-lg font-semibold text-gray-900">{renderTitle()}</h1>
          </div>
        </div>
        <button onClick={signOut} className="text-xs text-gray-500 border border-gray-200 px-3 py-1 rounded-lg">
          Sair
        </button>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-4">{renderContent()}</main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg rounded-t-3xl px-4">
        <div className="grid grid-cols-4 py-3">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = currentTab === tab.id;
            if (tab.id === "aprovacoes" && !canAccessApprovals) {
              return null;
            }
            return (
              <button
                key={tab.id}
                onClick={() => setView(tab.id as MobileView)}
                className={`flex flex-col items-center text-xs font-medium ${
                  active ? "text-blue-600" : "text-gray-400"
                }`}
              >
                <Icon className={`w-5 h-5 mb-1 ${active ? "text-blue-600" : "text-gray-400"}`} />
                {tab.label}
              </button>
            );
          })}
        </div>
        {isAdmin && (
          <button
            onClick={handleCreateEvent}
            className="w-full mb-3 bg-blue-600 text-white py-3 rounded-2xl flex items-center justify-center gap-2 font-semibold"
          >
            <PlusCircle className="w-5 h-5" />
            Novo evento
          </button>
        )}
      </nav>
    </div>
  );
}
