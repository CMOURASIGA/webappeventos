import { useState } from 'react';
import { Filter, Calendar, User, Clock, CheckCircle2, Circle, AlertCircle } from 'lucide-react';
import { mockTasks, mockEvents } from '../data/mockData';
import { TaskStatus } from '../types';
import { getTaskStatusLabel, getTaskStatusColor, getPriorityColor, formatDate, getDaysUntil } from '../utils/helpers';

export default function TasksManager() {
  const [filterStatus, setFilterStatus] = useState<TaskStatus | 'todos'>('todos');
  const [filterResponsavel, setFilterResponsavel] = useState('todos');

  const responsaveis = Array.from(new Set(mockTasks.map(t => t.responsavel)));

  const filteredTasks = mockTasks.filter(task => {
    const matchStatus = filterStatus === 'todos' || task.status === filterStatus;
    const matchResponsavel = filterResponsavel === 'todos' || task.responsavel === filterResponsavel;
    return matchStatus && matchResponsavel;
  });

  const tarefasPorStatus = {
    pendente: filteredTasks.filter(t => t.status === 'pendente').length,
    em_andamento: filteredTasks.filter(t => t.status === 'em_andamento').length,
    concluida: filteredTasks.filter(t => t.status === 'concluida').length,
    cancelada: filteredTasks.filter(t => t.status === 'cancelada').length
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-gray-900 mb-1">Gestão de Tarefas</h2>
        <p className="text-gray-600">Todas as tarefas dos eventos</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 mb-1">Pendentes</p>
              <p className="text-gray-900">{tarefasPorStatus.pendente}</p>
            </div>
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <Circle className="w-5 h-5 text-gray-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 mb-1">Em Andamento</p>
              <p className="text-gray-900">{tarefasPorStatus.em_andamento}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 mb-1">Concluídas</p>
              <p className="text-gray-900">{tarefasPorStatus.concluida}</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 mb-1">Atrasadas</p>
              <p className="text-gray-900">
                {filteredTasks.filter(t => t.status !== 'concluida' && getDaysUntil(t.prazo) < 0).length}
              </p>
            </div>
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as TaskStatus | 'todos')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="todos">Todos os Status</option>
              <option value="pendente">Pendente</option>
              <option value="em_andamento">Em Andamento</option>
              <option value="concluida">Concluída</option>
              <option value="cancelada">Cancelada</option>
            </select>

            <select
              value={filterResponsavel}
              onChange={(e) => setFilterResponsavel(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="todos">Todos os Responsáveis</option>
              {responsaveis.map(resp => (
                <option key={resp} value={resp}>{resp}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-sm text-gray-900">Pendentes</h3>
            <p className="text-xs text-gray-500 mt-1">{tarefasPorStatus.pendente} tarefas</p>
          </div>
          <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
            {filteredTasks
              .filter(t => t.status === 'pendente')
              .map(task => {
                const evento = mockEvents.find(e => e.id === task.evento_id);
                const diasRestantes = getDaysUntil(task.prazo);
                const isOverdue = diasRestantes < 0;
                return (
                  <div key={task.id} className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-sm transition-shadow cursor-pointer">
                    <div className="flex items-start gap-2">
                      <input 
                        type="checkbox" 
                        className="mt-1 w-4 h-4 text-blue-600 rounded border-gray-300"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">{task.titulo}</p>
                        <p className="text-xs text-gray-500 mt-1 truncate">{evento?.titulo}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`text-xs px-2 py-0.5 rounded ${getPriorityColor(task.prioridade)}`}>
                            {task.prioridade}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                          <User className="w-3 h-3" />
                          <span className="truncate">{task.responsavel}</span>
                        </div>
                        <div className={`flex items-center gap-2 mt-1 text-xs ${isOverdue ? 'text-red-600' : 'text-gray-500'}`}>
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(task.prazo)}</span>
                          {isOverdue && <span>(Atrasada)</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            {tarefasPorStatus.pendente === 0 && (
              <p className="text-center text-gray-400 py-8 text-sm">Nenhuma tarefa pendente</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-4 border-b border-gray-200 bg-blue-50">
            <h3 className="text-sm text-gray-900">Em Andamento</h3>
            <p className="text-xs text-gray-500 mt-1">{tarefasPorStatus.em_andamento} tarefas</p>
          </div>
          <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
            {filteredTasks
              .filter(t => t.status === 'em_andamento')
              .map(task => {
                const evento = mockEvents.find(e => e.id === task.evento_id);
                const diasRestantes = getDaysUntil(task.prazo);
                const isOverdue = diasRestantes < 0;
                return (
                  <div key={task.id} className="bg-white border border-blue-200 rounded-lg p-3 hover:shadow-sm transition-shadow cursor-pointer">
                    <div className="flex items-start gap-2">
                      <input 
                        type="checkbox" 
                        className="mt-1 w-4 h-4 text-blue-600 rounded border-gray-300"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">{task.titulo}</p>
                        <p className="text-xs text-gray-500 mt-1 truncate">{evento?.titulo}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`text-xs px-2 py-0.5 rounded ${getPriorityColor(task.prioridade)}`}>
                            {task.prioridade}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                          <User className="w-3 h-3" />
                          <span className="truncate">{task.responsavel}</span>
                        </div>
                        <div className={`flex items-center gap-2 mt-1 text-xs ${isOverdue ? 'text-red-600' : 'text-gray-500'}`}>
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(task.prazo)}</span>
                          {isOverdue && <span>(Atrasada)</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            {tarefasPorStatus.em_andamento === 0 && (
              <p className="text-center text-gray-400 py-8 text-sm">Nenhuma tarefa em andamento</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-4 border-b border-gray-200 bg-green-50">
            <h3 className="text-sm text-gray-900">Concluídas</h3>
            <p className="text-xs text-gray-500 mt-1">{tarefasPorStatus.concluida} tarefas</p>
          </div>
          <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
            {filteredTasks
              .filter(t => t.status === 'concluida')
              .map(task => {
                const evento = mockEvents.find(e => e.id === task.evento_id);
                return (
                  <div key={task.id} className="bg-white border border-green-200 rounded-lg p-3 hover:shadow-sm transition-shadow cursor-pointer">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 line-through">{task.titulo}</p>
                        <p className="text-xs text-gray-500 mt-1 truncate">{evento?.titulo}</p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                          <User className="w-3 h-3" />
                          <span className="truncate">{task.responsavel}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(task.prazo)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            {tarefasPorStatus.concluida === 0 && (
              <p className="text-center text-gray-400 py-8 text-sm">Nenhuma tarefa concluída</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
