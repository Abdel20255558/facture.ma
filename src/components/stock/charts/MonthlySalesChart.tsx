import React, { useState } from 'react';
import { BarChart3, Calendar, TrendingUp } from 'lucide-react';

interface MonthlySalesData {
  month: string;
  quantity: number;
  value: number;
  ordersCount: number;
}

interface MonthlySalesChartProps {
  data: MonthlySalesData[];
  selectedYear: number;
}

export default function MonthlySalesChart({ data, selectedYear }: MonthlySalesChartProps) {
  const [viewMode, setViewMode] = useState<'quantity' | 'value'>('value');
  const [hoveredMonth, setHoveredMonth] = useState<number | null>(null);

  const maxQuantity = Math.max(...data.map(d => d.quantity), 1);
  const maxValue = Math.max(...data.map(d => d.value), 1);
  
  const getBarHeight = (item: MonthlySalesData) => {
    if (viewMode === 'quantity') {
      return (item.quantity / maxQuantity) * 100;
    } else {
      return (item.value / maxValue) * 100;
    }
  };

  const totalQuantity = data.reduce((sum, item) => sum + item.quantity, 0);
  const totalValue = data.reduce((sum, item) => sum + item.value, 0);
  const totalOrders = data.reduce((sum, item) => sum + item.ordersCount, 0);

  const averageOrderValue = totalOrders > 0 ? totalValue / totalOrders : 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Ventes Mensuelles {selectedYear}</h3>
          <p className="text-sm text-gray-600">Performance mensuelle détaillée</p>
        </div>
        
        {/* Toggle View Mode */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode('value')}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              viewMode === 'value' 
                ? 'bg-white text-purple-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Valeur (MAD)
          </button>
          <button
            onClick={() => setViewMode('quantity')}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              viewMode === 'quantity' 
                ? 'bg-white text-purple-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Quantité
          </button>
        </div>
      </div>

      {/* Statistiques globales */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
          <div className="text-lg font-bold text-blue-600">{totalQuantity.toFixed(0)}</div>
          <div className="text-xs text-blue-700">Quantité totale</div>
        </div>
        <div className="text-center p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
          <div className="text-lg font-bold text-green-600">{totalValue.toLocaleString()}</div>
          <div className="text-xs text-green-700">MAD total</div>
        </div>
        <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200">
          <div className="text-lg font-bold text-purple-600">{averageOrderValue.toFixed(0)}</div>
          <div className="text-xs text-purple-700">MAD/commande</div>
        </div>
      </div>

      {/* Graphique en barres */}
      <div className="space-y-3">
        {data.map((item, index) => (
          <div 
            key={index}
            className={`transition-all duration-200 ${
              hoveredMonth === index ? 'transform scale-105' : ''
            }`}
            onMouseEnter={() => setHoveredMonth(index)}
            onMouseLeave={() => setHoveredMonth(null)}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">{item.month}</span>
              </div>
              <div className="text-right text-sm">
                {viewMode === 'value' ? (
                  <span className="font-bold text-green-600">{item.value.toLocaleString()} MAD</span>
                ) : (
                  <span className="font-bold text-blue-600">{item.quantity.toFixed(1)} unités</span>
                )}
                <div className="text-xs text-gray-500">{item.ordersCount} commande{item.ordersCount > 1 ? 's' : ''}</div>
              </div>
            </div>
            
            <div className="relative">
              <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out ${
                    viewMode === 'value'
                      ? 'bg-gradient-to-r from-green-400 to-emerald-500'
                      : 'bg-gradient-to-r from-blue-400 to-indigo-500'
                  } ${hoveredMonth === index ? 'shadow-lg' : ''}`}
                  style={{ 
                    width: `${getBarHeight(item)}%`,
                    animationDelay: `${index * 0.1}s`
                  }}
                />
              </div>
              
              {/* Indicateur de performance */}
              {hoveredMonth === index && (
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-2 py-1 rounded text-xs whitespace-nowrap">
                  {viewMode === 'value' 
                    ? `${item.value.toLocaleString()} MAD` 
                    : `${item.quantity.toFixed(1)} unités`
                  }
                </div>
              )}
            </div>

            {/* Détails au survol */}
            {hoveredMonth === index && (
              <div className="mt-3 p-3 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                <div className="grid grid-cols-3 gap-4 text-xs">
                  <div className="text-center">
                    <div className="font-bold text-blue-600">{item.quantity.toFixed(1)}</div>
                    <div className="text-gray-500">Quantité vendue</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-green-600">{item.value.toLocaleString()}</div>
                    <div className="text-gray-500">Valeur (MAD)</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-purple-600">{item.ordersCount}</div>
                    <div className="text-gray-500">Commandes</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {data.length === 0 && (
        <div className="text-center py-12">
          <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Aucune donnée de vente disponible</p>
        </div>
      )}

      {/* Résumé de performance */}
      {data.length > 0 && (
        <div className="mt-6 p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <span className="font-medium text-purple-900">Performance {selectedYear}</span>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-purple-900">
                Moyenne: {(totalValue / 12).toLocaleString()} MAD/mois
              </div>
              <div className="text-xs text-purple-700">
                {(totalQuantity / 12).toFixed(1)} unités/mois
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}