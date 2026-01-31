// src/app/pages/Produits/components/ProductsSubTabs.tsx
import { Package } from 'lucide-react';

type ProductSubTab = 'tous' | 'vente' | 'utilisation';

interface ProductsSubTabsProps {
  activeTab: ProductSubTab;
  onTabChange: (tab: ProductSubTab) => void;
}

export function ProductsSubTabs({ activeTab, onTabChange }: ProductsSubTabsProps) {
  const tabs = [
    { id: 'tous' as const, label: 'Tous les produits' },
    { id: 'vente' as const, label: 'Produits en vente' },
    { id: 'utilisation' as const, label: 'Produits salon' }
  ];

  return (
    <div className="border-b border-gray-200">
      <nav className="-mb-px flex space-x-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === tab.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Package className="w-4 h-4 inline mr-2" />
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
}