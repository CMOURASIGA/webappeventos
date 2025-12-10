import { Plus } from 'lucide-react';
import { memo } from 'react';
import { cn } from '../../ui/utils';

// This would typically come from a shared types definition file
export interface Tab {
  id: string;
  label: string;
  icon: React.ElementType;
}

interface BottomNavProps {
  tabs: Tab[];
  currentTab: string;
  onTabChange: (tabId: string) => void;
  onCreateEvent: () => void;
}

export const BottomNav = memo(({ tabs, currentTab, onTabChange, onCreateEvent }: BottomNavProps) => {
  // Ensure we have at most 4 tabs visible for the layout
  const visibleTabs = tabs.slice(0, 4);

  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50 h-[88px] rounded-t-3xl',
        'bg-white/95 backdrop-blur-xl',
        'border-t border-gray-200/60 shadow-[0_-8px_30px_rgba(0,0,0,0.08)]'
      )}
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="relative grid h-full grid-cols-5 items-center px-2">
        {/* Navigation buttons */}
        {visibleTabs.map((tab, index) => {
          const isActive = tab.id === currentTab;
          // Adjust grid column based on index to leave space for the FAB
          const col = index < 2 ? `col-start-${index + 1}` : `col-start-${index + 2}`;
          
          return (
            <div key={tab.id} className={`${col} flex justify-center`}>
              <button
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  'flex h-[60px] flex-col items-center justify-center gap-1 rounded-xl px-3 transition-all duration-200 ease-in-out',
                  'min-w-[64px] active:scale-95',
                  isActive
                    ? 'font-bold text-blue-600 bg-blue-600/10'
                    : 'text-gray-500 hover:text-blue-600'
                )}
              >
                <tab.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-xs font-semibold tracking-wide">{tab.label}</span>
              </button>
            </div>
          );
        })}

        {/* Floating Action Button */}
        <div className="col-start-3 -mt-12 flex justify-center">
          <button
            onClick={onCreateEvent}
            className={cn(
              'flex h-16 w-16 items-center justify-center rounded-2xl', // rounded-2xl per prompt
              'bg-blue-600 text-white',
              'shadow-lg shadow-blue-600/40',
              'transition-transform active:scale-95'
            )}
          >
            <Plus size={32} />
          </button>
        </div>
      </div>
    </nav>
  );
});

BottomNav.displayName = 'BottomNav';