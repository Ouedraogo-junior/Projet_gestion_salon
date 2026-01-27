import { FileDown, Calendar } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

// Données pour les graphiques
const ventesData = [
  { mois: 'Juil', ventes: 245000 },
  { mois: 'Août', ventes: 287000 },
  { mois: 'Sept', ventes: 312000 },
  { mois: 'Oct', ventes: 298000 },
  { mois: 'Nov', ventes: 345000 },
  { mois: 'Déc', ventes: 412000 },
];

const categoriesData = [
  { name: 'Produits coiffage', value: 45 },
  { name: 'Soins', value: 30 },
  { name: 'Accessoires', value: 15 },
  { name: 'Services', value: 10 },
];

const COLORS = ['#3B82F6', '#8B5CF6', '#F59E0B', '#10B981'];

export function Rapports() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl">Rapports</h1>
          <p className="text-gray-600 mt-1">Analyse des performances et statistiques</p>
        </div>
        <div className="flex items-center gap-2">
          <Select defaultValue="mois">
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="aujourd'hui">Aujourd'hui</SelectItem>
              <SelectItem value="semaine">Cette semaine</SelectItem>
              <SelectItem value="mois">Ce mois</SelectItem>
              <SelectItem value="annee">Cette année</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <FileDown className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
          <Button variant="outline">
            <FileDown className="w-4 h-4 mr-2" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Graphiques ventes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Évolution des ventes (6 derniers mois)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={ventesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mois" />
                <YAxis />
                <Tooltip
                  formatter={(value: number) => `${value.toLocaleString()} FCFA`}
                />
                <Line
                  type="monotone"
                  dataKey="ventes"
                  stroke="#3B82F6"
                  strokeWidth={3}
                  dot={{ fill: '#3B82F6', r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Répartition par catégorie</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoriesData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoriesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tableau des meilleures ventes */}
      <Card>
        <CardHeader>
          <CardTitle>Top 10 des meilleures ventes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b">
                <tr className="text-left text-sm text-gray-600">
                  <th className="pb-3">Rang</th>
                  <th className="pb-3">Produit/Service</th>
                  <th className="pb-3">Catégorie</th>
                  <th className="pb-3 text-right">Quantité vendue</th>
                  <th className="pb-3 text-right">CA généré</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {[
                  {
                    rang: 1,
                    nom: 'Entretien dreadlocks',
                    categorie: 'Services',
                    quantite: 125,
                    ca: 625000,
                  },
                  {
                    rang: 2,
                    nom: 'Cire de torsade',
                    categorie: 'Produits',
                    quantite: 89,
                    ca: 311500,
                  },
                  {
                    rang: 3,
                    nom: 'Huile de coco bio',
                    categorie: 'Soins',
                    quantite: 67,
                    ca: 335000,
                  },
                ].map((item) => (
                  <tr key={item.rang} className="border-b hover:bg-gray-50">
                    <td className="py-3">#{item.rang}</td>
                    <td className="py-3">{item.nom}</td>
                    <td className="py-3">{item.categorie}</td>
                    <td className="py-3 text-right">{item.quantite}</td>
                    <td className="py-3 text-right">{item.ca.toLocaleString()} FCFA</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Analyse clientèle */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Nouveaux clients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">23</div>
            <p className="text-xs text-green-600 mt-1">+15% vs mois dernier</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Clients fidèles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">187</div>
            <p className="text-xs text-blue-600 mt-1">+8% vs mois dernier</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Clients perdus</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">12</div>
            <p className="text-xs text-orange-600 mt-1">Inactifs depuis 3+ mois</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
