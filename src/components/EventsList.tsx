import { useState } from 'react';
import { Plus, Filter, Calendar, MapPin, Users, DollarSign, Eye } from 'lucide-react';
import { mockEvents } from '../data/mockData';
import { Event, EventStatus, EventPriority } from '../types';
import { getStatusLabel, getStatusColor, getPriorityLabel, getPriorityColor, formatDate, formatCurrency } from '../utils/helpers';

interface EventsListProps {
  onViewChange: (view: string, eventId?: string) => void;
}

export default function EventsList({ onViewChange }: EventsListProps) {
  const [filterStatus, setFilterStatus] = useState<EventStatus | 'todos'>('todos');
  const [filterPriority, setFilterPriority] = useState<EventPriority | 'todos'>('todos');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEvents = mockEvents.filter(event => {
    const matchStatus = filterStatus === 'todos' || event.status === filterStatus;
    const matchPriority = filterPriority === 'todos' || event.prioridade === filterPriority;
    const matchSearch = event.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       event.local.toLowerCase().includes(searchTerm.toLowerCase());
    return matchStatus && matchPriority && matchSearch;
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-900 mb-1">Gestão de Eventos</h2>
          <p className="text-gray-600">Todos os eventos cadastrados no sistema</p>
        </div>
        <button 
          onClick={() => onViewChange('novo-evento')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Novo Evento
        </button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Buscar eventos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as EventStatus | 'todos')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="todos">Todos os Status</option>
              <option value="input">Input do Evento</option>
              <option value="criacao_tarefas">Criação de Tarefas</option>
              <option value="geracao_orcamento">Geração de Orçamento</option>
              <option value="aguardando_aprovacao">Aguardando Aprovação</option>
              <option value="execucao">Em Execução</option>
              <option value="pos_evento">Pós-Evento</option>
            </select>

            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value as EventPriority | 'todos')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="todos">Todas as Prioridades</option>
              <option value="baixa">Baixa</option>
              <option value="media">Média</option>
              <option value="alta">Alta</option>
              <option value="urgente">Urgente</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs text-gray-600 uppercase tracking-wider">Evento</th>
                <th className="text-left px-6 py-3 text-xs text-gray-600 uppercase tracking-wider">Data</th>
                <th className="text-left px-6 py-3 text-xs text-gray-600 uppercase tracking-wider">Local</th>
                <th className="text-left px-6 py-3 text-xs text-gray-600 uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-3 text-xs text-gray-600 uppercase tracking-wider">Prioridade</th>
                <th className="text-left px-6 py-3 text-xs text-gray-600 uppercase tracking-wider">Responsável</th>
                <th className="text-left px-6 py-3 text-xs text-gray-600 uppercase tracking-wider">Orçamento</th>
                <th className="text-center px-6 py-3 text-xs text-gray-600 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredEvents.map((event) => (
                <tr key={event.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm text-gray-900">{event.titulo}</p>
                      <p className="text-xs text-gray-500 mt-1">{event.tipo}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      {formatDate(event.data_inicio)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span className="truncate max-w-[150px]">{event.local}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-block text-xs px-2 py-1 rounded ${getStatusColor(event.status)}`}>
                      {getStatusLabel(event.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-block text-xs px-2 py-1 rounded ${getPriorityColor(event.prioridade)}`}>
                      {getPriorityLabel(event.prioridade)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-600">{event.responsavel}</p>
                  </td>
                  <td className="px-6 py-4">
                    {event.orcamento_aprovado ? (
                      <div className="flex items-center gap-1 text-sm text-gray-900">
                        <DollarSign className="w-4 h-4" />
                        {formatCurrency(event.orcamento_aprovado)}
                      </div>
                    ) : event.orcamento_previsto ? (
                      <div className="text-sm text-gray-500">
                        {formatCurrency(event.orcamento_previsto)}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => onViewChange('evento-detalhes', event.id)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Ver detalhes"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredEvents.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Nenhum evento encontrado</p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-sm text-gray-600">
        <p>Mostrando {filteredEvents.length} de {mockEvents.length} eventos</p>
      </div>
    </div>
  );
}
