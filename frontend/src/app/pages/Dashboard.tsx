// src/app/pages/Dashboard.tsx
import { TrendingUp, Users, Package, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  getVentesAujourdhui,
  getClientsAujourdhui,
  getProduitsStockBas,
  ventesMock,
  produitsMock,
} from '@/lib/mockData';

// Données pour le graphique des ventes
const ventesData = [
  { jour: 'Lun', ventes: 45000 },
  { jour: 'Mar', ventes: 52000 },
  { jour: 'Mer', ventes: 38000 },
  { jour: 'Jeu', ventes: 67000 },
  { jour: 'Ven', ventes: 81000 },
  { jour: 'Sam', ventes: 95000 },
  { jour: 'Dim', ventes: 73000 },
];

// Top produits
const topProduits = produitsMock
  .slice(0, 5)
  .map((p) => ({ nom: p.nom, ventes: Math.floor(Math.random() * 50) + 10 }));

export function Dashboard() {
  const ventesJour = getVentesAujourdhui();
  const clientsJour = getClientsAujourdhui();
  const stockBas = getProduitsStockBas();

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-full">
      {/* En-tête */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Tableau de bord</h1>
        <p className="text-gray-500 mt-1">Vue d'ensemble de votre activité</p>
      </div>

      {/* Cartes KPI */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Ventes du jour</CardTitle>
            <TrendingUp className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-800">{ventesJour.toLocaleString()} FCFA</div>
            <p className="text-xs text-green-600 mt-1 font-medium">+12% vs hier</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Clients aujourd'hui</CardTitle>
            <Users className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-800">{clientsJour}</div>
            <p className="text-xs text-green-600 mt-1 font-medium">+8% vs hier</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Alertes stock bas</CardTitle>
            <Package className="w-4 h-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-800">{stockBas}</div>
            <p className="text-xs text-orange-600 mt-1 font-medium">Produits à commander</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Crédits SMS</CardTitle>
            <MessageSquare className="w-4 h-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-800">1,250</div>
            <p className="text-xs text-gray-600 mt-1">Restants ce mois</p>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Graphique des ventes */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800">Ventes sur 7 jours</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={ventesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="jour" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  formatter={(value: number) => `${value.toLocaleString()} FCFA`}
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                />
                <Line
                  type="monotone"
                  dataKey="ventes"
                  stroke="#3B82F6"
                  strokeWidth={3}
                  dot={{ fill: '#3B82F6', r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top produits */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800">Top 5 produits/services</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topProduits}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="nom" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                />
                <Bar dataKey="ventes" fill="#8B5CF6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Activité récente */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-800">Activité récente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {ventesMock.slice(0, 5).map((vente) => (
              <div
                key={vente.id}
                className="flex items-center justify-between py-3 border-b last:border-0 hover:bg-gray-50 -mx-2 px-2 rounded transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      Vente #{vente.id} - {vente.methodePaiement}
                    </p>
                    <p className="text-xs text-gray-500">{vente.date}</p>
                  </div>
                </div>
                <div className="text-sm font-semibold text-gray-800">{vente.total.toLocaleString()} FCFA</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}