import { useState, useCallback, useMemo } from "react";
import { Calendar, CheckSquare, LayoutGrid, Plus, BarChart3, ArrowLeft, LogOut, User } from "lucide-react";
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

  const handleSelectEvent = useCallback((eventId: string) => {
    setSelectedEventId(eventId);
    setView("evento-detalhes");
  }, []);

  const handleCreateEvent = useCallback(() => setView("novo-evento"), []);
  
  const handleEditEvent = useCallback((eventId: string) => {
    setSelectedEventId(eventId);
    setView("editar-evento");
  }, []);

  const handleBack = useCallback(() => {
    setSelectedEventId(null);
    setView("eventos");
  }, []);

  const currentTab = useMemo(() => {
    if (view === "evento-detalhes" || view === "novo-evento" || view === "editar-evento") {
      return "eventos";
    }
    return view;
  }, [view]);

  const isDetailView = ["evento-detalhes", "novo-evento", "editar-evento"].includes(view);

  const renderTitle = () => {
    const titles: Record<MobileView, string> = {
      "evento-detalhes": "Detalhes",
      "novo-evento": "Novo Evento",
      "editar-evento": "Editar Evento",
      "dashboard": "Visão Geral",
      "eventos": "Meus Eventos",
      "aprovacoes": "Aprovações",
      "relatorios": "Performance"
    };
    return titles[view] || "Sistema";
  };

  const renderContent = () => {
    switch (view) {
      case "dashboard":
        return <MobileDashboard onCreateEvent={handleCreateEvent} onSelectEvent={handleSelectEvent} />;
      case "eventos":
        return <MobileEvents onCreateEvent={handleCreateEvent} onSelectEvent={handleSelectEvent} />;
      case "aprovacoes":
        return canAccessApprovals ? <MobileApprovals /> : <AccessDenied />;
      case "relatorios":
        return <MobileReports />;
      case "evento-detalhes":
        return selectedEventId ? <MobileEventDetails eventId={selectedEventId} onEdit={handleEditEvent} /> : <EmptyState />;
      case "novo-evento":
        return <EventForm onBack={handleBack} />;
      case "editar-evento":
        return selectedEventId ? <EventForm eventId={selectedEventId} onBack={handleBack} /> : <EmptyState />;
      default:
        return null;
    }
  };

  const visibleTabs = useMemo(() => 
    tabs.filter(tab => tab.id !== "aprovacoes" || canAccessApprovals),
    [canAccessApprovals]
  );

  const firstName = profile?.nome?.split(' ')[0] ?? user?.email?.split('@')[0] ?? "Olá";

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-sans text-slate-900 overscroll-y-none">
      
      {/* Header Moderno e Limpo */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100 px-5 py-4 safe-area-inset-top transition-all">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isDetailView && (
              <button
                onClick={handleBack}
                className="w-10 h-10 -ml-2 flex items-center justify-center rounded-full active:bg-gray-100 text-slate-700 transition-colors touch-manipulation"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
            )}
            <div>
              {!isDetailView && <p className="text-xs text-slate-500 font-medium mb-0.5">Olá, {firstName}</p>}
              <h1 className="text-xl font-bold tracking-tight text-slate-900 leading-none">{renderTitle()}</h1>
            </div>
          </div>
          
          <button
            onClick={signOut}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-slate-500 hover:bg-red-50 hover:text-red-500 active:scale-95 transition-all touch-manipulation"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Área Principal com Scroll Suave */}
      <main className="flex-1 overflow-y-auto px-5 py-6 pb-32 scroll-smooth no-scrollbar">
        <div className="animate-fadeIn w-full max-w-lg mx-auto">
          {renderContent()}
        </div>
      </main>

      {/* Navegação Flutuante (Island Style) */}
      {!isDetailView && (
        <nav className="fixed bottom-6 left-4 right-4 z-40 safe-area-inset-bottom max-w-lg mx-auto">
          <div className="bg-white/90 backdrop-blur-xl border border-white/20 shadow-2xl shadow-blue-900/10 rounded-2xl px-2 py-2 flex items-center justify-around relative">
            
            {visibleTabs.map((tab) => {
              const Icon = tab.icon;
              const active = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setView(tab.id as MobileView)}
                  className={`relative flex flex-col items-center justify-center w-14 h-14 rounded-xl transition-all duration-300 touch-manipulation ${
                    active ? "text-blue-600 bg-blue-50" : "text-slate-400 hover:bg-gray-50 active:bg-gray-100"
                  }`}
                >
                  <Icon 
                    className={`w-6 h-6 transition-transform duration-300 ${active ? "scale-110" : "scale-100"}`} 
                    strokeWidth={active ? 2.5 : 2} 
                  />
                  {active && <span className="absolute -bottom-1 w-1 h-1 bg-blue-600 rounded-full"></span>}
                </button>
              );
            })}

            {/* Botão de Ação Principal (FAB) */}
            {isAdmin && (
              <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                <button
                  onClick={handleCreateEvent}
                  className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-full text-white shadow-lg shadow-blue-600/40 flex items-center justify-center transform active:scale-90 transition-all border-4 border-gray-50"
                >
                  <Plus className="w-7 h-7" />
                </button>
              </div>
            )}
          </div>
        </nav>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .safe-area-inset-bottom { padding-bottom: env(safe-area-inset-bottom); }
      `}</style>
    </div>
  );
}

const AccessDenied = () => (
  <div className="text-center py-12 opacity-50">
    <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"><User className="w-8 h-8" /></div>
    <p>Acesso restrito.</p>
  </div>
);

const EmptyState = () => (
  <div className="text-center py-12 opacity-50">
    <p>Nada selecionado.</p>
  </div>
);
