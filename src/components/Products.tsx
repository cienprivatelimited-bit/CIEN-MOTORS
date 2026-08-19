import React, { useState } from 'react';
import {
  Plus,
  Search,
  Package,
  Edit2,
  Trash2,
  AlertTriangle,
  Tag,
  Boxes,
  X,
  AlertCircle
} from 'lucide-react';
import { Product, AppSettings, AuthSession } from '../types';
import { checkPermission } from '../lib/permissions';

interface ProductsProps {
  products: Product[];
  settings: AppSettings;
  onSaveProduct: (product: Partial<Product>) => void;
  onDeleteProduct: (id: string) => void;
  validateProduct: (code: string, name: string, excludeId?: string) => string | null;
  showToast: (type: 'success' | 'error' | 'info', message: string) => void;
  session?: AuthSession | null;
}

export const Products: React.FC<ProductsProps> = ({
  products,
  settings,
  onSaveProduct,
  onDeleteProduct,
  validateProduct,
  showToast,
  session
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [stockFilter, setStockFilter] = useState<'ALL' | 'LOW' | 'OUT'>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const canAdd = checkPermission(session?.effectivePermissions, 'products', 'add');
  const canEdit = checkPermission(session?.effectivePermissions, 'products', 'edit');
  const canDelete = checkPermission(session?.effectivePermissions, 'products', 'delete');
  const canAdjustStock = checkPermission(session?.effectivePermissions, 'products', 'edit');

  // Form state
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    category: 'General',
    costPrice: '0',
    sellingPrice: '0',
    currentStock: '0',
    reorderLevel: '10'
  });

  const categories = Array.from(new Set(products.map((p) => p.category))).filter(Boolean);

  const handleOpenAdd = () => {
    setEditingProduct(null);
    const codeCount = products.length + 1;
    setFormData({
      code: `PROD-${String(codeCount).padStart(3, '0')}`,
      name: '',
      category: 'General',
      costPrice: '',
      sellingPrice: '',
      currentStock: '0',
      reorderLevel: '10'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (prod: Product) => {
    setEditingProduct(prod);
    setFormData({
      code: prod.code,
      name: prod.name,
      category: prod.category || 'General',
      costPrice: prod.costPrice.toString(),
      sellingPrice: prod.sellingPrice.toString(),
      currentStock: prod.currentStock.toString(),
      reorderLevel: prod.reorderLevel.toString()
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const costNum = Number(formData.costPrice || 0);
    const sellNum = Number(formData.sellingPrice || 0);
    const stockNum = Number(formData.currentStock || 0);
    const reorderNum = Number(formData.reorderLevel || 0);

    if (sellNum < costNum) {
      if (
        !window.confirm(
          `Warning: Selling price (${settings.currencySymbol} ${sellNum}) is less than Cost price (${settings.currencySymbol} ${costNum}). Continue?`
        )
      ) {
        return;
      }
    }

    const validationError = validateProduct(formData.code, formData.name, editingProduct?.id);
    if (validationError) {
      showToast('error', validationError);
      return;
    }

    onSaveProduct({
      id: editingProduct?.id,
      code: formData.code.trim().toUpperCase(),
      name: formData.name.trim(),
      category: formData.category.trim() || 'General',
      costPrice: costNum,
      sellingPrice: sellNum,
      currentStock: stockNum,
      reorderLevel: reorderNum
    });

    showToast(
      'success',
      editingProduct
        ? `Product "${formData.name.trim()}" updated.`
        : `Product "${formData.name.trim()}" added to inventory catalog.`
    );
    setIsModalOpen(false);
  };

  // Filtering
  const filteredProducts = products.filter((prod) => {
    const q = searchTerm.toLowerCase().trim();
    let matchesQuery = true;
    if (q) {
      const terms = q.split(/\s+/).filter(Boolean);
      matchesQuery = terms.every((t) =>
        [prod.name, prod.code, prod.category].join(' ').toLowerCase().includes(t)
      );
    }
    const matchesCategory = categoryFilter === 'ALL' || prod.category === categoryFilter;

    let matchesStock = true;
    if (stockFilter === 'LOW') {
      matchesStock = prod.currentStock <= prod.reorderLevel && prod.currentStock > 0;
    } else if (stockFilter === 'OUT') {
      matchesStock = prod.currentStock <= 0;
    }

    return matchesQuery && matchesCategory && matchesStock;
  });

  const lowStockCount = products.filter(
    (p) => p.currentStock <= p.reorderLevel && p.currentStock > 0
  ).length;

  return (
    <div className="space-y-6 pb-8">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Product Inventory</h2>
          <p className="text-xs text-slate-500">
            Catalog of products, prices, stock levels & reorder alerts
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-amber-50 border border-amber-200 px-4 py-2 rounded-xl text-right">
            <span className="text-[10px] font-bold text-amber-700 uppercase block">Low Stock Items</span>
            <span className="text-lg font-black text-amber-900 font-mono">
              {lowStockCount} items
            </span>
          </div>

          {canAdd && (
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer text-sm"
            >
              <Plus className="w-4 h-4 text-yellow-400" />
              <span>Add Product</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search code, name, category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:border-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white text-slate-700 focus:outline-hidden focus:border-blue-500 font-medium"
          >
            <option value="ALL">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Stock Filter Pills */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setStockFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
                stockFilter === 'ALL' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
              }`}
            >
              All Stock
            </button>
            <button
              onClick={() => setStockFilter('LOW')}
              className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
                stockFilter === 'LOW' ? 'bg-amber-500 text-slate-950 shadow-2xs' : 'text-slate-600'
              }`}
            >
              Low Stock
            </button>
            <button
              onClick={() => setStockFilter('OUT')}
              className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
                stockFilter === 'OUT' ? 'bg-rose-600 text-white shadow-2xs' : 'text-slate-600'
              }`}
            >
              Out of Stock
            </button>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredProducts.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            No products found in catalog matching filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 uppercase font-bold text-xs border-b border-slate-200 tracking-wider">
                  <th className="p-4">Code</th>
                  <th className="p-4">Product Name</th>
                  <th className="p-4">Category</th>
                  <th className="p-4 text-right">Cost Price</th>
                  <th className="p-4 text-right">Selling Price</th>
                  <th className="p-4 text-center">Stock Level</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredProducts.map((prod) => {
                  const isLow = prod.currentStock <= prod.reorderLevel && prod.currentStock > 0;
                  const isOut = prod.currentStock <= 0;

                  return (
                    <tr key={prod.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4 font-mono font-bold text-slate-900">{prod.code}</td>
                      <td className="p-4">
                        <div className="font-bold text-slate-900">{prod.name}</div>
                        <div className="text-xs text-slate-400">Reorder Level: {prod.reorderLevel} units</div>
                      </td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold">
                          {prod.category}
                        </span>
                      </td>
                      <td className="p-4 text-right font-mono">
                        {settings.currencySymbol} {prod.costPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-4 text-right font-mono font-bold text-slate-900">
                        {settings.currencySymbol} {prod.sellingPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-4 text-center">
                        <div className="inline-flex items-center gap-1.5">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-black font-mono border ${
                              isOut
                                ? 'bg-rose-100 text-rose-800 border-rose-200'
                                : isLow
                                ? 'bg-amber-100 text-amber-900 border-amber-300 animate-pulse'
                                : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                            }`}
                          >
                            {prod.currentStock} units
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {canEdit && (
                            <button
                              onClick={() => handleOpenEdit(prod)}
                              className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg cursor-pointer"
                              title="Edit Product"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}
                          {canDelete && (
                            <button
                              onClick={() => setDeleteConfirmId(prod.id)}
                              className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-lg cursor-pointer"
                              title="Delete Product"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-bold text-lg text-slate-900">
                {editingProduct ? 'Edit Product Item' : 'Add New Inventory Product'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Product Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. PROD-001"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-mono font-bold uppercase focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Rice & Grains"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Product / Item Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Samba Rice 5kg Bag"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-500 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Cost / Purchase Price *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.costPrice}
                    onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Selling Price *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.sellingPrice}
                    onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-mono font-bold text-blue-600 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    {editingProduct ? 'Current Stock' : 'Initial Stock Qty'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    disabled={editingProduct !== null && !canAdjustStock}
                    value={formData.currentStock}
                    onChange={(e) => setFormData({ ...formData, currentStock: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-mono font-bold focus:border-blue-500 disabled:bg-slate-50 disabled:text-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Reorder Alert Level
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.reorderLevel}
                    onChange={(e) => setFormData({ ...formData, reorderLevel: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2 rounded-xl text-sm shadow-xs"
                >
                  {editingProduct ? 'Update Product' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-sm w-full p-6 animate-in fade-in zoom-in-95 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900">Delete Product Item?</h3>
            <p className="text-xs text-slate-500 mt-1">
              Are you sure? This item will be removed from your catalog. Past invoices will preserve historic record.
            </p>
            <div className="mt-5 flex justify-center gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDeleteProduct(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-xs"
              >
                Delete Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
