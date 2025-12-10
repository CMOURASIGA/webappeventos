import { ArrowLeft, Bell, UserCircle } from 'lucide-react';
import { memo } from 'react';
import { cn } from '../../ui/utils';

interface MobileHeaderProps {
  title: string;
  isDetailView?: boolean;
  onBack?: () => void;
  onSignOut?: () => void; // Assuming this might be triggered from a user menu
}

export const MobileHeader = memo(({ title, isDetailView, onBack }: MobileHeaderProps) => {
  return (
    <header
      className={cn(
        'sticky top-0 z-40 flex h-[60px] items-center justify-between gap-4 px-4',
        'bg-white/95 backdrop-blur-xl',
        'border-b border-gray-200/60'
      )}
    >
      <div className="flex flex-1 items-center gap-2">
        {isDetailView ? (
          <button
            onClick={onBack}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/50 transition-colors active:bg-gray-200/50"
          >
            <ArrowLeft size={20} className="text-gray-900" />
          </button>
        ) : <div className="w-9" /> }
        <h1 className="w-full truncate text-center text-lg font-bold text-gray-900">{title}</h1>
      </div>
      <div className="flex flex-1 items-center justify-end gap-2">
        <button className="flex h-9 w-9 items-center justify-center rounded-full bg-white/50 transition-colors active:bg-gray-200/50">
          <Bell size={20} className="text-gray-800" />
        </button>
        <button className="flex h-9 w-9 items-center justify-center rounded-full bg-white/50 transition-colors active:bg-gray-200/50">
          <UserCircle size={22} className="text-gray-800" />
        </button>
      </div>
    </header>
  );
});

MobileHeader.displayName = 'MobileHeader';