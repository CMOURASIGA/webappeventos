import { 
  LayoutDashboard, 
  Calendar, 
  ListChecks, 
  FileText, 
  CheckSquare, 
  BarChart3,
  Settings,
  HelpCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

export default function Sidebar({ activeView, onViewChange }: SidebarProps) {
  const { isAdmin, canAccessApprovals } = useAuth();
  const baseItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'eventos', label: 'Eventos', icon: Calendar },
    { id: 'tarefas', label: 'Tarefas', icon: ListChecks },
    { id: 'orcamentos', label: 'Orçamentos', icon: FileText },
    canAccessApprovals ? { id: 'aprovacoes', label: 'Aprovações', icon: CheckSquare } : null,
    { id: 'relatorios', label: 'Relatórios', icon: BarChart3 }
  ];
  const menuItems = baseItems.filter(Boolean) as { id: string; label: string; icon: any }[];

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-blue-600">Sistema de Gestão de Eventos</h1>
        <p className="text-gray-500 text-sm mt-1">CNC</p>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => onViewChange(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'
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

      <div className="p-4 border-t border-gray-200">
        {isAdmin && (
          <button
            onClick={() => onViewChange('configuracoes')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Settings className="w-5 h-5" />
            <span>Configurações</span>
          </button>
        )}
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
          <HelpCircle className="w-5 h-5" />
          <span>Ajuda</span>
        </button>
      </div>
    </div>
  );
}
