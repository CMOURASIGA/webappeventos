import { BarChart3, CheckSquare, FilePlus2, PlusCircle } from 'lucide-react';

export function QuickActions() {
  const actions = [
    { label: 'Nova Tarefa', icon: PlusCircle, className: 'text-blue-500' },
    { label: 'Criar Relatório', icon: BarChart3, className: 'text-purple-500' },
    { label: 'Nova Aprovação', icon: CheckSquare, className: 'text-green-500' },
    { label: 'Adicionar Doc', icon: FilePlus2, className: 'text-orange-500' },
  ];

  return (
    <div className="rounded-2xl bg-gradient-to-r from-indigo-500/20 to-sky-500/20 p-0.5 shadow-sm">
      <div className="w-full rounded-[15px] bg-white p-3">
        <div className="flex items-center justify-between">
          {actions.map((action) => (
            <button
              key={action.label}
              className="flex flex-col items-center gap-2 rounded-xl px-2 py-1 text-center transition-colors active:bg-gray-100"
            >
              <action.icon size={22} className={action.className} strokeWidth={2.5} />
              <span className="text-xs font-bold text-gray-700">{action.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
