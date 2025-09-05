import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { 
  BarChart3, 
  Crown,
  TrendingUp, 
  DollarSign, 
  FileText, 
  Users, 
  Package,
  Calendar,
  Download,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';

export default function Reports() {
  const { t } = useLanguage();
  const { invoices, clients, products } = useData();
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  // Fonction pour filtrer les factures selon la période
  const getFilteredInvoices = () => {
    const now = new Date();
    let startDate = new Date();

    switch (selectedPeriod) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(now.getMonth() - 1);
    }

    return invoices.filter(invoice => new Date(invoice.date) >= startDate);
  };

  const filteredInvoices = getFilteredInvoices();

  // Calculs des statistiques basés sur la période sélectionnée
  const paidInvoices = filteredInvoices.filter(invoice => invoice.status === 'paid');
  const unpaidInvoices = filteredInvoices.filter(invoice => invoice.status === 'unpaid');
  const collectedInvoices = filteredInvoices.filter(invoice => invoice.status === 'collected');
  
  const totalRevenue = paidInvoices.reduce((sum, invoice) => sum + invoice.totalTTC, 0);
  const unpaidRevenue = unpaidInvoices.reduce((sum, invoice) => sum + invoice.totalTTC, 0);
  const collectedRevenue = collectedInvoices.reduce((sum, invoice) => sum + invoice.totalTTC, 0);

  // Total général de toutes les factures de la période
  const totalAllInvoices = filteredInvoices.reduce((sum, invoice) => sum + invoice.totalTTC, 0);

  // Données réelles pour l'évolution des ventes selon la période
  const getSalesDataForPeriod = () => {
    const periods = [];
    const currentDate = new Date();
    let periodCount = 6;
    let periodType = 'month';

    switch (selectedPeriod) {
      case 'week':
        periodCount = 7;
        periodType = 'day';
        break;
      case 'month':
        periodCount = 6;
        periodType = 'month';
        break;
      case 'quarter':
        periodCount = 4;
        periodType = 'quarter';
        break;
      case 'year':
        periodCount = 5;
        periodType = 'year';
        break;
    }
    
    for (let i = periodCount - 1; i >= 0; i--) {
      let date = new Date();
      let periodName = '';
      
      if (periodType === 'day') {
        date.setDate(currentDate.getDate() - i);
        periodName = date.toLocaleDateString('fr-FR', { weekday: 'short' });
      } else if (periodType === 'month') {
        date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        periodName = date.toLocaleDateString('fr-FR', { month: 'short' });
      } else if (periodType === 'quarter') {
        const quarterStart = Math.floor(currentDate.getMonth() / 3) * 3;
        date = new Date(currentDate.getFullYear(), quarterStart - (i * 3), 1);
        periodName = `T${Math.floor(date.getMonth() / 3) + 1}`;
      } else if (periodType === 'year') {
        date = new Date(currentDate.getFullYear() - i, 0, 1);
        periodName = date.getFullYear().toString();
      }
      
      // Calculer les ventes réelles pour cette période
      const periodSales = paidInvoices
        .filter(invoice => {
          const invoiceDate = new Date(invoice.date);
          if (periodType === 'day') {
            return invoiceDate.toDateString() === date.toDateString();
          } else if (periodType === 'month') {
            return invoiceDate.getMonth() === date.getMonth() && 
                   invoiceDate.getFullYear() === date.getFullYear();
          } else if (periodType === 'quarter') {
            const invoiceQuarter = Math.floor(invoiceDate.getMonth() / 3);
            const periodQuarter = Math.floor(date.getMonth() / 3);
            return invoiceQuarter === periodQuarter && 
                   invoiceDate.getFullYear() === date.getFullYear();
          } else if (periodType === 'year') {
            return invoiceDate.getFullYear() === date.getFullYear();
          }
          return false;
        })
        .reduce((sum, invoice) => sum + invoice.totalTTC, 0);
      
      periods.push({ period: periodName, sales: periodSales });
    }
    
    return periods;
  };

  const periodData = getSalesDataForPeriod();
  const maxSales = Math.max(...periodData.map(d => d.sales), 1);

  const stats = [
    {
      title: 'Total Factures Période',
      value: `${filteredInvoices.length} (${totalAllInvoices.toLocaleString()} MAD)`,
      icon: FileText,
      color: 'from-blue-500 to-indigo-600',
      change: `${totalAllInvoices.toLocaleString()} MAD`,
      count: filteredInvoices.length
    },
    {
      title: 'Factures Payées',
      value: `${paidInvoices.length} (${totalRevenue.toLocaleString()} MAD)`,
      icon: CheckCircle,
      color: 'from-emerald-500 to-teal-600',
      change: `${totalRevenue.toLocaleString()} MAD`,
      count: paidInvoices.length
    },
    {
      title: 'Factures Non Payées',
      value: `${unpaidInvoices.length} (${unpaidRevenue.toLocaleString()} MAD)`,
      icon: XCircle,
      color: 'from-red-500 to-pink-600',
      change: `${unpaidRevenue.toLocaleString()} MAD`,
      count: unpaidInvoices.length
    },
    {
      title: 'Factures Encaissées',
      value: `${collectedInvoices.length} (${collectedRevenue.toLocaleString()} MAD)`,
      icon: Clock,
      color: 'from-yellow-500 to-orange-600',
      change: `${collectedRevenue.toLocaleString()} MAD`,
      count: collectedInvoices.length
    }
  ];

  const periods = [
    { id: 'week', label: 'Cette semaine' },
    { id: 'month', label: 'Ce mois' },
    { id: 'quarter', label: 'Ce trimestre' },
    { id: 'year', label: 'Cette année' }
  ];

  const getPeriodLabel = () => {
    const labels = {
      'week': 'cette semaine',
      'month': 'ce mois',
      'quarter': 'ce trimestre',
      'year': 'cette année'
    };
    return labels[selectedPeriod as keyof typeof labels] || 'cette période';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
                <div>

     <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <BarChart3 className="w-8 h-8 text-blue-600" />
            <span>Gestion financière </span>
            <Crown className="w-6 h-6 text-yellow-500" />
          </h1>
         <p className="text-gray-600 mt-2">
           La section Gestion financière vous permet d’analyser les performances financières de votre entreprise sur la période de votre choix. Fonctionnalité réservée aux abonnés PRO.
          </p>
  </div>
        
        <div className="flex space-x-3">
          <button className="inline-flex items-center space-x-2 bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white px-4 py-2 rounded-lg transition-all duration-200">
            <Download className="w-4 h-4" />
            <span>Exporter</span>
          </button>
        </div>
      </div>

      {/* Filtre de période uniquement */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Période d'analyse
            </label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              {periods.map(period => (
                <option key={period.id} value={period.id}>{period.label}</option>
              ))}
            </select>
          </div>
          
          <div className="flex-1 bg-gradient-to-r from-teal-50 to-blue-50 rounded-lg p-4 border border-teal-200">
            <p className="text-sm text-teal-800">
              📊 Analyse des données pour <strong>{getPeriodLabel()}</strong> 
              ({filteredInvoices.length} facture{filteredInvoices.length > 1 ? 's' : ''} trouvée{filteredInvoices.length > 1 ? 's' : ''})
            </p>
          </div>
        </div>
      </div>

      {/* Statistiques par statut */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {stat.title}
                  </p>
                  <p className="text-xl font-bold text-gray-900 mb-2">
                    {stat.count}
                  </p>
                  <div className="flex items-center space-x-1">
                    <DollarSign className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm font-medium text-emerald-600">
                      {stat.change}
                    </span>
                  </div>
                </div>
                <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center shadow-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Résumé financier de la période */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Résumé Financier - {getPeriodLabel()}</h3>
            <p className="text-sm text-gray-600">Performance pour la période sélectionnée</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-2xl font-bold text-blue-600">{totalAllInvoices.toLocaleString()}</p>
            <p className="text-sm text-blue-700">MAD Total Période</p>
            <p className="text-xs text-gray-500">{filteredInvoices.length} factures</p>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
            <p className="text-2xl font-bold text-green-600">{totalRevenue.toLocaleString()}</p>
            <p className="text-sm text-green-700">MAD Payées</p>
            <p className="text-xs text-gray-500">{paidInvoices.length} factures payées</p>
          </div>
          
          <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
            <p className="text-2xl font-bold text-red-600">{unpaidRevenue.toLocaleString()}</p>
            <p className="text-sm text-red-700">MAD Non Payées</p>
            <p className="text-xs text-gray-500">{unpaidInvoices.length} factures non payées</p>
          </div>
          
          <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-2xl font-bold text-yellow-600">{collectedRevenue.toLocaleString()}</p>
            <p className="text-sm text-yellow-700">MAD Encaissées</p>
            <p className="text-xs text-gray-500">{collectedInvoices.length} factures encaissées</p>
          </div>
        </div>

        {/* Pourcentages */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-lg font-bold text-gray-900">
              {filteredInvoices.length > 0 ? Math.round((paidInvoices.length / filteredInvoices.length) * 100) : 0}%
            </p>
            <p className="text-sm text-gray-600">Taux de paiement</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-lg font-bold text-gray-900">
              {filteredInvoices.length > 0 ? Math.round((unpaidInvoices.length / filteredInvoices.length) * 100) : 0}%
            </p>
            <p className="text-sm text-gray-600">Factures en attente</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-lg font-bold text-gray-900">
              {filteredInvoices.length > 0 ? Math.round((collectedInvoices.length / filteredInvoices.length) * 100) : 0}%
            </p>
            <p className="text-sm text-gray-600">Taux d'encaissement</p>
          </div>
        </div>
      </div>
{/* Analyse de performance */}
      {filteredInvoices.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Analyse de Performance</h3>
              <p className="text-sm text-gray-600">Indicateurs clés pour {getPeriodLabel()}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg border border-emerald-200">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                <p className="text-lg font-bold text-emerald-600">
                  {filteredInvoices.length > 0 ? Math.round((totalRevenue / totalAllInvoices) * 100) : 0}%
                </p>
              </div>
              <p className="text-sm text-emerald-700">Taux de recouvrement</p>
              <p className="text-xs text-gray-500">Factures payées / Total</p>
            </div>
            
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <DollarSign className="w-5 h-5 text-blue-600" />
                <p className="text-lg font-bold text-blue-600">
                  {filteredInvoices.length > 0 ? Math.round(totalAllInvoices / filteredInvoices.length).toLocaleString() : '0'}
                </p>
              </div>
              <p className="text-sm text-blue-700">Panier moyen</p>
              <p className="text-xs text-gray-500">MAD par facture</p>
            </div>
            
            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-violet-50 rounded-lg border border-purple-200">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                <p className="text-lg font-bold text-purple-600">
                  {periodData.length > 1 ? 
                    Math.round(periodData.reduce((acc, d) => acc + d.sales, 0) / periodData.length).toLocaleString() : 
                    '0'
                  }
                </p>
              </div>
              <p className="text-sm text-purple-700">Moyenne période</p>
              <p className="text-xs text-gray-500">MAD par {selectedPeriod === 'week' ? 'jour' : selectedPeriod === 'month' ? 'mois' : selectedPeriod === 'quarter' ? 'trimestre' : 'année'}</p>
            </div>
          </div>
        </div>
      )}
      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Évolution des ventes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Évolution des Ventes</h3>
              <p className="text-sm text-gray-600">Chiffre d'affaires pour {getPeriodLabel()}</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
          </div>

          <div className="space-y-4">
            {periodData.map((data, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="w-12 text-sm font-medium text-gray-600">
                  {data.period}
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-3 relative overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${maxSales > 0 ? (data.sales / maxSales) * 100 : 0}%` }}
                  />
                </div>
                <div className="w-24 text-sm font-medium text-gray-900 text-right">
                  {data.sales.toLocaleString()} MAD
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Clients pour la période */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Top Clients</h3>
              <p className="text-sm text-gray-600">Clients les plus rentables {getPeriodLabel()}</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
          </div>

          <div className="space-y-4">
            {clients.slice(0, 5).map((client, index) => {
              const clientRevenue = filteredInvoices
                .filter(invoice => invoice.clientId === client.id && invoice.status === 'paid')
                .reduce((sum, invoice) => sum + invoice.totalTTC, 0);
              
              const clientInvoicesCount = filteredInvoices
                .filter(invoice => invoice.clientId === client.id)
                .length;
              
              return (
                <div key={client.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                      #{index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{client.name}</p>
                      <p className="text-sm text-gray-500">ICE: {client.ice}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {clientRevenue.toLocaleString()} MAD
                    </p>
                    <p className="text-xs text-gray-500">
                      {clientInvoicesCount} facture{clientInvoicesCount > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {clients.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">Aucun client enregistré</p>
            </div>
          )}
        </div>
      </div>

      {/* Tableau détaillé pour la période */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Factures détaillées - {getPeriodLabel()}
            </h3>
            <button className="text-teal-600 hover:text-teal-700 font-medium text-sm flex items-center space-x-1">
              <Eye className="w-4 h-4" />
              <span>Voir tout</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Numéro
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Montant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInvoices.slice(0, 10).map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(invoice.date).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {invoice.number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {invoice.client.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {invoice.totalTTC.toLocaleString()} MAD
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      invoice.status === 'paid'
                        ? 'bg-emerald-100 text-emerald-800'
                        : invoice.status === 'collected'
                        ? 'bg-yellow-100 text-yellow-800'
                        : invoice.status === 'unpaid'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {invoice.status === 'paid' ? 'Payé' : 
                       invoice.status === 'collected' ? 'Encaissé' :
                       invoice.status === 'unpaid' ? 'Non payé' : 'Autre'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredInvoices.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Aucune facture trouvée pour {getPeriodLabel()}</p>
          </div>
        )}
      </div>

      
    </div>
  );
}