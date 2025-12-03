import { Bell, LogOut, Search, User } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export default function Header() {
  const { user, profile, signOut } = useAuth();
  const displayName =
    profile?.nome ??
    (user?.user_metadata?.name as string | undefined) ??
    user?.email ??
    "Usuário";
  const role =
    profile?.papel ??
    (user?.user_metadata?.role as string | undefined) ??
    "Colaborador";
  const avatarUrl =
    (user?.user_metadata?.picture as string | undefined) ??
    (user?.user_metadata?.avatar_url as string | undefined) ??
    undefined;

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex-1 max-w-xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar eventos, tarefas ou pessoas..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex items-center gap-4 ml-6">
          <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
            <div className="text-right">
              <p className="text-sm text-gray-900">{displayName}</p>
              <p className="text-xs text-gray-500">{role}</p>
            </div>
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName}
                className="w-10 h-10 rounded-full object-cover border border-gray-200"
              />
            ) : (
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600" />
              </div>
            )}
            <button
              onClick={signOut}
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
              title="Sair"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
