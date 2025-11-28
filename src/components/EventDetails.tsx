import { useState } from 'react';
import { ArrowLeft, Calendar, MapPin, Users, DollarSign, Clock, Edit2, CheckCircle2, Plus, Trash2, MoreVertical } from 'lucide-react';
import { mockEvents, mockTasks, mockBudgetItems } from '../data/mockData';
import { getStatusLabel, getStatusColor, getPriorityLabel, getPriorityColor, formatDate, formatCurrency, getTaskStatusLabel, getTaskStatusColor, getDaysUntil } from '../utils/helpers';
import { EventStatus } from '../types';

interface EventDetailsProps {
  eventId: string;
  onBack: () => void;
}

export default function EventDetails({ eventId, onBack }: EventDetailsProps) {
  const [activeTab, setActiveTab] = useState<'geral' | 'tarefas' | 'orcamento' | 'historico'>('geral');
  const [showAddTask, setShowAddTask] = useState(false);
  
  const evento = mockEvents.find(e => e.id === eventId);
  const tarefasEvento = mockTasks.filter(t => t.evento_id === eventId);
  const orcamentoEvento = mockBudgetItems.filter(b => b.evento_id === eventId);

  if (!evento) {
    return (
      <div className="p-6">
        <p className="text-gray-500">Evento não encontrado</p>
      </div>
    );
  }

  const totalOrcamento = orcamentoEvento.reduce((sum, item) => sum + item.valor_total, 0);
  const tarefasConcluidas = tarefasEvento.filter(t => t.status === 'concluida').length;
  const progressoTarefas = tarefasEvento.length > 0 ? (tarefasConcluidas / tarefasEvento.length) * 100 : 0;

  const statusOptions: EventStatus[] = [
    'input',
    'criacao_tarefas',
    'geracao_orcamento',
    'aguardando_aprovacao',
    'execucao',
    'pos_evento'
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-gray-900">{evento.titulo}</h2>
            <p className="text-gray-600">{evento.tipo}</p>
          </div>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Edit2 className="w-4 h-4" />
          Editar Evento
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Data do Evento</p>
              <p className="text-sm text-gray-900">{formatDate(evento.data_inicio)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Progresso</p>
              <p className="text-sm text-gray-900">{progressoTarefas.toFixed(0)}% Concluído</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Orçamento</p>
              <p className="text-sm text-gray-900">
                {evento.orcamento_aprovado ? formatCurrency(evento.orcamento_aprovado) : 'A definir'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Participantes</p>
              <p className="text-sm text-gray-900">{evento.participantes_esperados || 'A definir'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200">
          <div className="flex gap-6 px-6">
            {[
              { id: 'geral', label: 'Informações Gerais' },
              { id: 'tarefas', label: 'Tarefas', badge: tarefasEvento.length },
              { id: 'orcamento', label: 'Orçamento' },
              { id: 'historico', label: 'Histórico' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <span className="flex items-center gap-2">
                  {tab.label}
                  {tab.badge !== undefined && (
                    <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">{tab.badge}</span>
                  )}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'geral' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Status Atual</label>
                  <select 
                    value={evento.status}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {statusOptions.map(status => (
                      <option key={status} value={status}>
                        {getStatusLabel(status)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-2">Prioridade</label>
                  <span className={`inline-block px-3 py-2 rounded-lg ${getPriorityColor(evento.prioridade)}`}>
                    {getPriorityLabel(evento.prioridade)}
                  </span>
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-2">Local</label>
                  <div className="flex items-center gap-2 text-gray-900">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span>{evento.local}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-2">Responsável</label>
                  <p className="text-gray-900">{evento.responsavel}</p>
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-2">Solicitante</label>
                  <p className="text-gray-900">{evento.solicitante}</p>
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-2">Departamento</label>
                  <p className="text-gray-900">{evento.departamento}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-2">Descrição</label>
                <p className="text-gray-900">{evento.descricao}</p>
              </div>

              <div className="pt-6 border-t border-gray-200">
                <h4 className="text-gray-900 mb-4">Fluxo do Evento</h4>
                <div className="relative">
                  <div className="flex items-center justify-between">
                    {statusOptions.map((status, index) => {
                      const isCompleted = statusOptions.indexOf(evento.status) >= index;
                      const isCurrent = evento.status === status;
                      return (
                        <div key={status} className="flex-1 relative">
                          <div className="flex flex-col items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                              isCompleted 
                                ? 'bg-blue-600 border-blue-600' 
                                : 'bg-white border-gray-300'
                            } ${isCurrent ? 'ring-4 ring-blue-100' : ''}`}>
                              {isCompleted && (
                                <CheckCircle2 className="w-5 h-5 text-white" />
                              )}
                            </div>
                            <p className={`text-xs mt-2 text-center max-w-[100px] ${
                              isCompleted ? 'text-gray-900' : 'text-gray-500'
                            }`}>
                              {getStatusLabel(status)}
                            </p>
                          </div>
                          {index < statusOptions.length - 1 && (
                            <div className={`absolute top-5 left-1/2 w-full h-0.5 ${
                              statusOptions.indexOf(evento.status) > index
                                ? 'bg-blue-600'
                                : 'bg-gray-300'
                            }`} style={{ zIndex: -1 }}></div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tarefas' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-600">
                    {tarefasConcluidas} de {tarefasEvento.length} tarefas concluídas
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${progressoTarefas}%` }}
                    ></div>
                  </div>
                </div>
                <button 
                  onClick={() => setShowAddTask(!showAddTask)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Nova Tarefa
                </button>
              </div>

              {showAddTask && (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-4">
                  <h4 className="text-gray-900 mb-3">Adicionar Nova Tarefa</h4>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Título da tarefa"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <textarea
                      placeholder="Descrição"
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="Responsável"
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="date"
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          alert('Tarefa adicionada!');
                          setShowAddTask(false);
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Adicionar
                      </button>
                      <button 
                        onClick={() => setShowAddTask(false)}
                        className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {tarefasEvento.map(tarefa => {
                  const diasRestantes = getDaysUntil(tarefa.prazo);
                  const isOverdue = diasRestantes < 0;
                  return (
                    <div key={tarefa.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                      <div className="flex items-start gap-3">
                        <input 
                          type="checkbox" 
                          checked={tarefa.status === 'concluida'}
                          className="mt-1 w-5 h-5 text-blue-600 rounded border-gray-300"
                          onChange={() => {}}
                        />
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className={`text-sm ${tarefa.status === 'concluida' ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                                {tarefa.titulo}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">{tarefa.descricao}</p>
                            </div>
                            <button className="p-1 hover:bg-gray-100 rounded">
                              <MoreVertical className="w-4 h-4 text-gray-400" />
                            </button>
                          </div>
                          <div className="flex items-center gap-3 mt-3">
                            <span className={`text-xs px-2 py-1 rounded ${getTaskStatusColor(tarefa.status)}`}>
                              {getTaskStatusLabel(tarefa.status)}
                            </span>
                            <span className="text-xs text-gray-500">{tarefa.responsavel}</span>
                            <span className={`text-xs flex items-center gap-1 ${isOverdue ? 'text-red-600' : 'text-gray-500'}`}>
                              <Clock className="w-3 h-3" />
                              {formatDate(tarefa.prazo)}
                              {isOverdue && ' (Atrasada)'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {tarefasEvento.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p>Nenhuma tarefa cadastrada para este evento</p>
                    <p className="text-sm mt-1">Clique em "Nova Tarefa" para adicionar</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'orcamento' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-gray-900">Total do Orçamento</p>
                  <p className="text-gray-600">{formatCurrency(totalOrcamento)}</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <Plus className="w-4 h-4" />
                  Novo Item
                </button>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs text-gray-600 uppercase">Categoria</th>
                      <th className="text-left px-4 py-3 text-xs text-gray-600 uppercase">Descrição</th>
                      <th className="text-right px-4 py-3 text-xs text-gray-600 uppercase">Qtd</th>
                      <th className="text-right px-4 py-3 text-xs text-gray-600 uppercase">Valor Unit.</th>
                      <th className="text-right px-4 py-3 text-xs text-gray-600 uppercase">Total</th>
                      <th className="text-center px-4 py-3 text-xs text-gray-600 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {orcamentoEvento.map(item => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">{item.categoria}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{item.descricao}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 text-right">{item.quantidade}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 text-right">{formatCurrency(item.valor_unitario)}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-right">{formatCurrency(item.valor_total)}</td>
                        <td className="px-4 py-3 text-center">
                          {item.aprovado ? (
                            <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-100 px-2 py-1 rounded">
                              <CheckCircle2 className="w-3 h-3" />
                              Aprovado
                            </span>
                          ) : (
                            <span className="text-xs text-yellow-700 bg-yellow-100 px-2 py-1 rounded">
                              Pendente
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {orcamentoEvento.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>Nenhum item de orçamento cadastrado</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'historico' && (
            <div className="space-y-4">
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-200"></div>
                <div className="space-y-6">
                  <div className="relative pl-10">
                    <div className="absolute left-2 w-5 h-5 rounded-full bg-blue-500 border-2 border-white"></div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-900">Evento criado</p>
                      <p className="text-xs text-gray-500 mt-1">por {evento.solicitante}</p>
                      <p className="text-xs text-gray-400 mt-2">{formatDate(evento.created_at)}</p>
                    </div>
                  </div>

                  <div className="relative pl-10">
                    <div className="absolute left-2 w-5 h-5 rounded-full bg-green-500 border-2 border-white"></div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-900">Status atualizado para: {getStatusLabel(evento.status)}</p>
                      <p className="text-xs text-gray-500 mt-1">por {evento.responsavel}</p>
                      <p className="text-xs text-gray-400 mt-2">{formatDate(evento.updated_at)}</p>
                    </div>
                  </div>

                  {evento.orcamento_aprovado && (
                    <div className="relative pl-10">
                      <div className="absolute left-2 w-5 h-5 rounded-full bg-purple-500 border-2 border-white"></div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-900">Orçamento aprovado</p>
                        <p className="text-xs text-gray-500 mt-1">Valor: {formatCurrency(evento.orcamento_aprovado)}</p>
                        <p className="text-xs text-gray-400 mt-2">{formatDate(evento.updated_at)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
