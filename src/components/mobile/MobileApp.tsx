import { useState, useCallback, useMemo, memo } from "react";
import { Calendar, CheckSquare, LayoutGrid, PlusCircle, BarChart3, ArrowLeft, User, LogOut } from "lucide-react";
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

  const isDetailView = view === "evento-detalhes" || view === "novo-evento" || view === "editar-evento";

  const renderTitle = () => {
    const titles: Record<MobileView, string> = {
      "evento-detalhes": "Detalhes do Evento",
      "novo-evento": "Novo Evento",
      "editar-evento": "Editar Evento",
      "dashboard": "Painel Geral",
      "eventos": "Meus Eventos",
      "aprovacoes": "Aprovações",
      "relatorios": "Relatórios"
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
        return canAccessApprovals ? (
          <MobileApprovals />
        ) : (
          <div className="flex items-center justify-center h-64">
            <p className="text-sm text-gray-500">Sem acesso a esta seção.</p>
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

  const visibleTabs = useMemo(() => 
    tabs.filter(tab => tab.id !== "aprovacoes" || canAccessApprovals),
    [canAccessApprovals]
  );

  const displayName = profile?.nome ?? user?.email ?? "Usuário";

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-blue-50/30 overscroll-contain">
      {/* Header com glassmorphism */}
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-xl px-4 py-3 border-b border-gray-200/60 shadow-sm safe-area-inset-top">
        <div className="flex items-center justify-between gap-3">
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
              <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide truncate">
                {displayName}
              </p>
              <h1 className="text-lg font-bold text-gray-900 truncate">{renderTitle()}</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-blue-600" />
            </div>
            <button
              onClick={signOut}
              className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-100 text-gray-600 active:scale-95 active:bg-gray-200 transition-all touch-manipulation"
              aria-label="Sair"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Content Area com scroll otimizado */}
      <main className="flex-1 overflow-y-auto px-4 py-4 pb-32 overscroll-contain scroll-smooth">
        <div className="animate-fadeIn">
          {renderContent()}
        </div>
      </main>

      {/* Bottom Navigation com glassmorphism */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-gray-200/50 shadow-2xl rounded-t-3xl safe-area-inset-bottom">
        <div className="px-2 pt-3 pb-2">
          <div 
            className="grid gap-1.5" 
            style={{ gridTemplateColumns: `repeat(${visibleTabs.length}, 1fr)` }}
          >
            {visibleTabs.map((tab) => {
              const Icon = tab.icon;
              const active = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setView(tab.id as MobileView)}
                  className={`flex flex-col items-center py-3 px-2 rounded-2xl transition-all touch-manipulation min-h-[60px] ${
                    active
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30 scale-105"
                      : "text-gray-500 hover:bg-gray-100 active:bg-gray-200 active:scale-95"
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

        {/* CTA Button */}
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

      {/* Animations */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in;
        }
        
        .safe-area-inset-top {
          padding-top: max(0.75rem, env(safe-area-inset-top));
        }
        
        .safe-area-inset-bottom {
          padding-bottom: max(0.5rem, env(safe-area-inset-bottom));
        }
        
        .scroll-smooth {
          scroll-behavior: smooth;
        }
        
        .overscroll-contain {
          overscroll-behavior: contain;
        }
        
        .touch-manipulation {
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
        }
      `}</style>
    </div>
  );
}