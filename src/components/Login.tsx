import { Calendar } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

export default function Login() {
  const { signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);
      await signInWithGoogle();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm max-w-md w-full p-8 text-center space-y-6">
        <div className="flex items-center justify-center gap-3 text-blue-600">
          <Calendar className="w-10 h-10" />
          <div>
            <p className="text-sm uppercase tracking-wide text-gray-500">
              Sistema de Gestão de Eventos
            </p>
            <h1 className="text-gray-900 text-2xl font-semibold">
              Acesse sua conta
            </h1>
          </div>
        </div>

        <p className="text-gray-600 text-sm">
          Faça login com sua conta corporativa Google para visualizar e gerenciar
          os eventos da sua equipe.
        </p>

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-70"
        >
          <svg
            className="w-5 h-5"
            viewBox="0 0 533.5 544.3"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M533.5 278.4c0-17.4-1.5-34.1-4.4-50.2H272.1v94.9h147.1c-6.3 34-25.2 62.8-53.7 81.9v67h86.9c50.8-46.8 81.1-115.8 81.1-193.6z"
              fill="#4285f4"
            />
            <path
              d="M272.1 544.3c72.9 0 134.2-24.1 178.9-66.3l-86.9-67c-24.1 16.2-55 25.7-92 25.7-70.7 0-130.5-47.7-152-111.7h-90.4v70.3c44.4 88 135.7 149 242.4 149z"
              fill="#34a853"
            />
            <path
              d="M120.1 325c-10.5-31.4-10.5-65.2 0-96.6v-70.3h-90.4c-39.8 79.5-39.8 173.4 0 252.9l90.4-70.3z"
              fill="#fbbc04"
            />
            <path
              d="M272.1 107.7c38.7-.6 75.8 13.8 104 40.5l77.4-77.4C366.3 24 305 0 232 0 125.2 0 34 61 89.7 158.1l90.4 70.3c21.5-64 81.3-120.7 152-120.7z"
              fill="#ea4335"
            />
          </svg>
          {loading ? "Redirecionando..." : "Entrar com Google"}
        </button>
      </div>
      <p className="text-xs text-gray-400 mt-6 text-center max-w-sm">
        O acesso é restrito aos membros das equipes cadastradas. Entre em contato
        com o administrador caso não consiga acessar.
      </p>
    </div>
  );
}
