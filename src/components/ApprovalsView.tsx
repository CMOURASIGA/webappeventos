import { CheckCircle, XCircle, Clock, FileText } from 'lucide-react';
import { mockApprovals, mockEvents } from '../data/mockData';
import { formatDate, formatCurrency } from '../utils/helpers';

export default function ApprovalsView() {
  const pendentes = mockApprovals.filter(a => a.status === 'pendente');
  const aprovadas = mockApprovals.filter(a => a.status === 'aprovado');
  const rejeitadas = mockApprovals.filter(a => a.status === 'rejeitado');

  const handleApprove = (id: string) => {
    alert(`Aprovação ${id} aprovada!`);
  };

  const handleReject = (id: string) => {
    alert(`Aprovação ${id} rejeitada!`);
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-gray-900 mb-1">Central de Aprovações</h2>
        <p className="text-gray-600">Gerencie todas as solicitações de aprovação</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 mb-1">Pendentes</p>
              <p className="text-gray-900">{pendentes.length}</p>
            </div>
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 mb-1">Aprovadas</p>
              <p className="text-gray-900">{aprovadas.length}</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 mb-1">Rejeitadas</p>
              <p className="text-gray-900">{rejeitadas.length}</p>
            </div>
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-gray-900 mb-3">Aprovações Pendentes</h3>
          {pendentes.length > 0 ? (
            <div className="space-y-3">
              {pendentes.map(aprovacao => {
                const evento = mockEvents.find(e => e.id === aprovacao.evento_id);
                return (
                  <div key={aprovacao.id} className="bg-white border border-yellow-200 rounded-lg p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FileText className="w-5 h-5 text-yellow-600" />
                          </div>
                          <div>
                            <h4 className="text-gray-900">{evento?.titulo}</h4>
                            <p className="text-sm text-gray-500">
                              {aprovacao.tipo === 'orcamento' ? 'Aprovação de Orçamento' : 'Aprovação de Evento'}
                            </p>
                          </div>
                        </div>

                        <div className="ml-13 space-y-2">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-gray-500">Solicitante</p>
                              <p className="text-gray-900">{aprovacao.solicitante}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Aprovador</p>
                              <p className="text-gray-900">{aprovacao.aprovador}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Data da Solicitação</p>
                              <p className="text-gray-900">{formatDate(aprovacao.data_solicitacao)}</p>
                            </div>
                            {evento?.orcamento_previsto && aprovacao.tipo === 'orcamento' && (
                              <div>
                                <p className="text-gray-500">Valor do Orçamento</p>
                                <p className="text-gray-900">{formatCurrency(evento.orcamento_previsto)}</p>
                              </div>
                            )}
                          </div>

                          {aprovacao.observacoes && (
                            <div>
                              <p className="text-gray-500 text-sm">Observações</p>
                              <p className="text-gray-900 text-sm">{aprovacao.observacoes}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => handleApprove(aprovacao.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Aprovar
                      </button>
                      <button
                        onClick={() => handleReject(aprovacao.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <XCircle className="w-4 h-4" />
                        Rejeitar
                      </button>
                      <button className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                        Ver Detalhes
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
              <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Nenhuma aprovação pendente</p>
            </div>
          )}
        </div>

        <div>
          <h3 className="text-gray-900 mb-3">Histórico de Aprovações</h3>
          <div className="bg-white rounded-lg border border-gray-200">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-xs text-gray-600 uppercase">Evento</th>
                  <th className="text-left px-6 py-3 text-xs text-gray-600 uppercase">Tipo</th>
                  <th className="text-left px-6 py-3 text-xs text-gray-600 uppercase">Solicitante</th>
                  <th className="text-left px-6 py-3 text-xs text-gray-600 uppercase">Data</th>
                  <th className="text-left px-6 py-3 text-xs text-gray-600 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {[...aprovadas, ...rejeitadas].map(aprovacao => {
                  const evento = mockEvents.find(e => e.id === aprovacao.evento_id);
                  return (
                    <tr key={aprovacao.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">{evento?.titulo}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {aprovacao.tipo === 'orcamento' ? 'Orçamento' : 'Evento'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{aprovacao.solicitante}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {aprovacao.data_resposta ? formatDate(aprovacao.data_resposta) : formatDate(aprovacao.data_solicitacao)}
                      </td>
                      <td className="px-6 py-4">
                        {aprovacao.status === 'aprovado' ? (
                          <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-100 px-2 py-1 rounded">
                            <CheckCircle className="w-3 h-3" />
                            Aprovado
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-red-700 bg-red-100 px-2 py-1 rounded">
                            <XCircle className="w-3 h-3" />
                            Rejeitado
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
