import { type LucideIcon } from 'lucide-react';
import { cn } from '../../ui/utils';

interface DashboardCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  gradient: string; // e.g., 'from-indigo-500 to-blue-600'
}

export function DashboardCard({ label, value, icon: Icon, gradient }: DashboardCardProps) {
  return (
    <div
      className={cn(
        'relative transform overflow-hidden rounded-2xl p-4 text-white shadow-lg transition-all active:scale-95',
        'flex flex-col justify-between',
        'min-h-[120px]',
        gradient
      )}
    >
      {/* Decorative Circle */}
      <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-white/10"></div>

      {/* Icon */}
      <div className="flex justify-start">
        <div className="rounded-xl bg-white/20 p-0.5">
          <Icon size={20} className="opacity-90" />
        </div>
      </div>

      {/* Content */}
      <div className="z-10">
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs font-medium opacity-90">{label}</p>
      </div>
    </div>
  );
}
