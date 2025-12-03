import {
  LayoutDashboard,
  Calendar,
  ListChecks,
  FileText,
  CheckSquare,
  BarChart3,
  Settings,
  HelpCircle,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  isMobileOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({
  activeView,
  onViewChange,
  isMobileOpen,
  onClose,
}: SidebarProps) {
  const { isAdmin, canAccessApprovals } = useAuth();
  const baseItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "eventos", label: "Eventos", icon: Calendar },
    { id: "tarefas", label: "Tarefas", icon: ListChecks },
    { id: "orcamentos", label: "Orcamentos", icon: FileText },
    canAccessApprovals ? { id: "aprovacoes", label: "Aprovacoes", icon: CheckSquare } : null,
    { id: "relatorios", label: "Relatorios", icon: BarChart3 },
  ];
  const menuItems = baseItems.filter(Boolean) as { id: string; label: string; icon: any }[];

  const handleNavigate = (view: string) => {
    onViewChange(view);
    onClose();
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity lg:hidden ${
          isMobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 lg:static lg:w-64 lg:translate-x-0 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h1 className="text-blue-600 text-lg font-semibold leading-tight">Sistema de Gestao de Eventos</h1>
            <p className="text-gray-500 text-sm mt-1">CNC</p>
          </div>
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-500"
            onClick={onClose}
            aria-label="Fechar menu"
          >
            &times;
          </button>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => handleNavigate(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-200 space-y-2">
          {isAdmin && (
            <button
              onClick={() => handleNavigate("configuracoes")}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Settings className="w-5 h-5" />
              <span>Configuracoes</span>
            </button>
          )}
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
            <HelpCircle className="w-5 h-5" />
            <span>Ajuda</span>
          </button>
        </div>
      </aside>
    </>
  );
}
