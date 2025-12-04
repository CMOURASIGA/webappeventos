import { useState, useCallback } from "react";
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
  { id: "aprovacoes", label: "Aprovacoes", icon: CheckSquare },
  { id: "relatorios", label: "Relatorios", icon: BarChart3 },
];

export default function MobileApp() {
  const { profile, user, signOut, isAdmin, canAccessApprovals } = useAuth();
  const [view, setView] = useState<MobileView>("dashboard");
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  // Memoize callbacks para evitar re-renderizacoes desnecessarias
  const handleSelectEvent = useCallback((eventId: string) => {
    setSelectedEventId(eventId);
    setView("evento-detalhes");
  }, []);

  const handleCreateEvent = useCallback(() => setView("novo-evento"), []);
  
  const handleEditEvent = useCallback((eventId: string) => {
    setSelectedEventId(eventId);
    setView("editar-evento");
  }, []);

  const handleBack = useCallback(() => setView("eventos"), []);

  const currentTab = view === "evento-detalhes" || view === "novo-evento" || view === "editar-evento" ? "eventos" : view;
  const isDetailView = view === "evento-detalhes" || view === "novo-evento" || view === "editar-evento";

  const renderTitle = () => {
    if (view === "evento-detalhes") return "Detalhes";
    if (view === "novo-evento") return "Novo Evento";
    if (view === "editar-evento") return "Editar";
    if (view === "dashboard") return "Painel Geral";
    if (view === "eventos") return "Meus Eventos";
    if (view === "aprovacoes") return "Aprovacoes";
    if (view === "relatorios") return "Relatorios";
    return "Sistema";
  };

  const renderContent = () => {
    switch (view) {
      case "dashboard":
        return <MobileDashboard onCreateEvent={handleCreateEvent} onSelectEvent={handleSelectEvent} />;
      case "eventos":
        return <MobileEvents onCreateEvent={handleCreateEvent} onSelectEvent={handleSelectEvent} />;
      case "aprovacoes":
        return canAccessApprovals ? (
          <MobileApprovals />
        ) : (
          <div className="flex items-center justify-center h-64">
            <p className="text-sm text-gray-500">Sem acesso a esta secao.</p>
          </div>
        );
      case "relatorios":
        return <MobileReports />;
      case "evento-detalhes":
        return selectedEventId ? (
          <MobileEventDetails eventId={selectedEventId} onEdit={handleEditEvent} />
        ) : (
          <div className="flex items-center justify-center h-64">
            <p className="text-sm text-gray-500">Selecione um evento.</p>
          </div>
        );
      case "novo-evento":
        return <EventForm onBack={handleBack} />;
      case "editar-evento":
        return selectedEventId ? (
          <EventForm eventId={selectedEventId} onBack={handleBack} />
        ) : (
          <div className="flex items-center justify-center h-64">
            <p className="text-sm text-gray-500">Selecione um evento.</p>
          </div>
        );
      default:
        return null;
    }
  };

  const visibleTabs = tabs.filter(tab => {
    if (tab.id === "aprovacoes" && !canAccessApprovals) return false;
    return true;
  });

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-blue-50/30">
      {/* Header com glassmorphism */}
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-xl px-4 py-3 border-b border-gray-200/60 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {isDetailView && (
              <button
                onClick={handleBack}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 text-gray-700 active:scale-95 active:bg-gray-200 transition-all touch-manipulation"
                aria-label="Voltar"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wide truncate">
                {profile?.nome ?? user?.email}
              </p>
              <h1 className="text-lg font-bold text-gray-900 truncate">{renderTitle()}</h1>
            </div>
          </div>
          <button
            onClick={signOut}
            className="text-xs text-gray-700 bg-gray-100 px-4 py-2.5 rounded-xl font-semibold hover:bg-gray-200 active:scale-95 transition-all whitespace-nowrap ml-2 touch-manipulation"
          >
          Sair
          </button>
        </div>
      </header>

      {/* Content Area */}
      <main className="flex-1 overflow-y-auto px-4 py-4 pb-32 overscroll-contain">
        {renderContent()}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-200/50 shadow-2xl rounded-t-3xl safe-area-inset-bottom">
        <div className="px-2 pt-3 pb-2">
          <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${visibleTabs.length}, 1fr)` }}>
            {visibleTabs.map((tab) => {
              const Icon = tab.icon;
              const active = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setView(tab.id as MobileView)}
                  className={`flex flex-col items-center py-3 px-2 rounded-2xl transition-all touch-manipulation min-h-[60px] ${
                    active
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                      : "text-gray-500 hover:bg-gray-100 active:bg-gray-200"
                  }`}
                  aria-label={tab.label}
                  aria-current={active ? "page" : undefined}
                >
                  <Icon className={`w-5 h-5 mb-1 ${active ? "text-white" : "text-gray-400"}`} />
                  <span className="text-[11px] font-semibold leading-tight">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {isAdmin && (
          <div className="px-4 pb-4 pt-2">
            <button
              onClick={handleCreateEvent}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-2xl flex items-center justify-center gap-2 font-bold shadow-lg shadow-blue-600/30 active:scale-95 transition-all touch-manipulation"
            >
              <PlusCircle className="w-5 h-5" />
              Novo Evento
            </button>
          </div>
        )}
      </nav>
    </div>
  );
}
