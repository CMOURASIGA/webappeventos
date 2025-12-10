import { Plus } from "lucide-react";

interface FABProps {
  onClick: () => void;
  label: string;
}

export function FAB({ onClick, label }: FABProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95"
      aria-label={label}
    >
      <Plus className="h-6 w-6" />
    </button>
  );
}
