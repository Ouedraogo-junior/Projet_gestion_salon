// src/app/pages/Produits/components/ProductsSubTabs.tsx
import { Package } from 'lucide-react';

type ProductSubTab = 'tous' | 'vente' | 'utilisation' | 'reserve';

interface ProductsSubTabsProps {
  activeTab: ProductSubTab;
  onTabChange: (tab: ProductSubTab) => void;
}

export function ProductsSubTabs({ activeTab, onTabChange }: ProductsSubTabsProps) {
  const tabs = [
    { id: 'tous' as const, label: 'Tous les produits', shortLabel: 'Tous' },
    { id: 'vente' as const, label: 'Produits en vente', shortLabel: 'Vente' },
    { id: 'utilisation' as const, label: 'Produits salon', shortLabel: 'Salon' },
    { id: 'reserve' as const, label: 'Produits en réserve', shortLabel: 'Réserve' }
  ];

  return (
    <div className="border-b border-gray-200">
      {/* Desktop tabs */}
      <nav className="hidden sm:flex -mb-px space-x-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
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

      {/* Mobile tabs */}
      <nav className="sm:hidden -mb-px flex">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex-1 py-3 px-2 border-b-2 font-medium text-xs text-center ${
              activeTab === tab.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500'
            }`}
          >
            <Package className="w-4 h-4 inline mb-1" />
            <span className="block">{tab.shortLabel}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}