import React, { useEffect, useState } from 'react';
import { Plus, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { apiRequest, apiUpload } from '../utils/apiClient';
import { resolveImageUrl } from '../config/api';
import Modal from './Modal.jsx';

const emptyForm = {
  name: '',
  price: '',
  originalPrice: '',
  rating: '',
  category: '',
  description: '',
  image: '',
  images: '',
  colors: '',
  sizes: '',
};

function toFormState(product) {
  return {
    name: product.name || '',
    price: product.price ?? '',
    originalPrice: product.originalPrice ?? '',
    rating: product.rating ?? '',
    category: product.category || '',
    description: product.description || '',
    image: product.image || '',
    images: (product.images || []).join(', '),
    colors: (product.colors || []).join(', '),
    sizes: (product.sizes || []).join(', '),
  };
}

function toPayload(form) {
  const splitList = (str) =>
    str
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

  return {
    name: form.name,
    price: Number(form.price),
    originalPrice: form.originalPrice === '' ? null : Number(form.originalPrice),
    rating: form.rating === '' ? 0 : Number(form.rating),
    category: form.category,
    description: form.description,
    image: form.image,
    images: splitList(form.images),
    colors: splitList(form.colors),
    sizes: splitList(form.sizes),
  };
}

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [uploading, setUploading] = useState(false);

  const fetchProducts = () => {
    setLoading(true);
    apiRequest('/api/products')
      .then(setProducts)
      .catch((err) => console.error('Failed to load products:', err))
      .finally(() => setLoading(false));
  };

  useEffect(fetchProducts, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormError('');
    setFormOpen(true);
    setOpenMenuId(null);
  };

  const openEdit = (product) => {
    setEditingId(product.id);
    setForm(toFormState(product));
    setFormError('');
    setFormOpen(true);
    setOpenMenuId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    try {
      const payload = toPayload(form);
      if (editingId) {
        await apiRequest(`/api/products/${editingId}`, { method: 'PUT', body: payload });
      } else {
        await apiRequest('/api/products', { method: 'POST', body: payload });
      }
      setFormOpen(false);
      fetchProducts();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;

    setUploading(true);
    setFormError('');
    try {
      const { url } = await apiUpload('/api/upload', file);
      setForm((f) => ({ ...f, image: url }));
    } catch (err) {
      setFormError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await apiRequest(`/api/products/${deleteTarget.id}`, { method: 'DELETE' });
      setDeleteTarget(null);
      fetchProducts();
    } catch (err) {
      console.error('Failed to delete product:', err);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-20 font-bold text-slate-500">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black uppercase tracking-tight">Products</h1>
        <button
          type="button"
          onClick={openCreate}
          className="flex items-center gap-2 bg-indigo-600 text-white text-sm font-semibold px-4 py-2.5 rounded-full hover:bg-indigo-700 transition"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-slate-400 uppercase border-b border-slate-100">
              <th className="px-6 py-4 font-semibold">Product</th>
              <th className="px-6 py-4 font-semibold">Price</th>
              <th className="px-6 py-4 font-semibold">Rating</th>
              <th className="px-6 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b border-slate-50 last:border-0">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img src={resolveImageUrl(product.image)} alt="" className="w-11 h-11 rounded-xl object-cover bg-slate-100" />
                    <div>
                      <p className="font-bold">{product.name}</p>
                      <p className="text-xs text-slate-400">{product.category}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="font-bold">${product.price}</span>
                  {product.originalPrice && (
                    <span className="text-slate-400 line-through text-xs ml-2">${product.originalPrice}</span>
                  )}
                </td>
                <td className="px-6 py-4">{product.rating}/5</td>
                <td className="px-6 py-4 text-right relative">
                  <button
                    type="button"
                    onClick={() => setOpenMenuId(openMenuId === product.id ? null : product.id)}
                    className="p-2 hover:bg-slate-100 rounded-full transition"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  {openMenuId === product.id && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setOpenMenuId(null)} />
                      <div className="absolute right-6 mt-2 w-36 bg-white border border-slate-200 rounded-2xl shadow-lg p-1.5 z-50 text-left">
                        <button
                          type="button"
                          onClick={() => openEdit(product)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-xl hover:bg-slate-100 transition"
                        >
                          <Pencil className="w-3.5 h-3.5" /> Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setDeleteTarget(product);
                            setOpenMenuId(null);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-xl hover:bg-red-50 text-red-500 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                      </div>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editingId ? 'Edit Product' : 'Add Product'}>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            required
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full bg-slate-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              required
              type="number"
              min="0"
              step="0.01"
              placeholder="Price"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="w-full bg-slate-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="Original Price (optional)"
              value={form.originalPrice}
              onChange={(e) => setForm({ ...form, originalPrice: e.target.value })}
              className="w-full bg-slate-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              min="0"
              max="5"
              step="0.1"
              placeholder="Rating (0-5)"
              value={form.rating}
              onChange={(e) => setForm({ ...form, rating: e.target.value })}
              className="w-full bg-slate-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              required
              placeholder="Category"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full bg-slate-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={2}
            className="w-full bg-slate-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              {form.image && (
                <img src={resolveImageUrl(form.image)} alt="" className="w-12 h-12 rounded-xl object-cover bg-slate-100 shrink-0" />
              )}
              <label className="flex-1 flex items-center justify-center gap-2 bg-slate-100 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 cursor-pointer hover:bg-slate-200 transition">
                {uploading ? 'Uploading...' : 'Upload Image'}
                <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} className="hidden" />
              </label>
            </div>
            <input
              required
              placeholder="Or paste an Image URL"
              value={form.image}
              onChange={(e) => setForm({ ...form, image: e.target.value })}
              className="w-full bg-slate-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <input
            placeholder="Extra images (comma-separated, optional)"
            value={form.images}
            onChange={(e) => setForm({ ...form, images: e.target.value })}
            className="w-full bg-slate-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            placeholder="Colors, comma-separated hex (optional)"
            value={form.colors}
            onChange={(e) => setForm({ ...form, colors: e.target.value })}
            className="w-full bg-slate-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            placeholder="Sizes, comma-separated (optional)"
            value={form.sizes}
            onChange={(e) => setForm({ ...form, sizes: e.target.value })}
            className="w-full bg-slate-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
          />

          {formError && <p className="text-red-500 text-xs font-medium">{formError}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-indigo-600 text-white rounded-xl py-3 font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {submitting ? 'Saving...' : editingId ? 'Save Changes' : 'Add Product'}
          </button>
        </form>
      </Modal>

      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Product"
        footer={
          <>
            <button
              type="button"
              onClick={() => setDeleteTarget(null)}
              className="px-4 py-2 rounded-full text-sm font-medium hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="px-4 py-2 rounded-full text-sm font-semibold bg-red-500 text-white hover:bg-red-600 transition disabled:opacity-50"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          Delete <span className="font-bold">{deleteTarget?.name}</span>? This can't be undone.
        </p>
      </Modal>
    </div>
  );
}
