import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    subcategories: ['']
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API}/admin/categories`, {
        withCredentials: true
      });
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        subcategories: formData.subcategories.filter(s => s.trim() !== '')
      };

      if (editingCategory) {
        await axios.put(
          `${API}/admin/categories/${editingCategory.category_id}`,
          data,
          { withCredentials: true }
        );
        toast.success('Category updated');
      } else {
        await axios.post(`${API}/admin/categories`, data, {
          withCredentials: true
        });
        toast.success('Category created');
      }

      setShowForm(false);
      setEditingCategory(null);
      setFormData({ name: '', description: '', subcategories: [''] });
      fetchCategories();
    } catch (error) {
      toast.error('Failed to save category');
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      subcategories: category.subcategories || ['']
    });
    setShowForm(true);
  };

  const handleDelete = async (categoryId) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;

    try {
      await axios.delete(`${API}/admin/categories/${categoryId}`, {
        withCredentials: true
      });
      toast.success('Category deleted');
      fetchCategories();
    } catch (error) {
      toast.error('Failed to delete category');
    }
  };

  const addSubcategoryField = () => {
    setFormData({
      ...formData,
      subcategories: [...formData.subcategories, '']
    });
  };

  const updateSubcategory = (index, value) => {
    const newSubcategories = [...formData.subcategories];
    newSubcategories[index] = value;
    setFormData({ ...formData, subcategories: newSubcategories });
  };

  const removeSubcategory = (index) => {
    const newSubcategories = formData.subcategories.filter((_, i) => i !== index);
    setFormData({ ...formData, subcategories: newSubcategories });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-metallic"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-display text-3xl text-admin-text mb-2">Categories</h1>
          <p className="text-admin-text-secondary">Manage product categories and subcategories</p>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingCategory(null);
            setFormData({ name: '', description: '', subcategories: [''] });
          }}
          className="bg-gold-metallic text-white px-6 py-3 font-medium hover:bg-gold-matte transition-colors flex items-center space-x-2"
          data-testid="add-category-btn"
        >
          <Plus className="h-5 w-5" />
          <span>Add Category</span>
        </button>
      </div>

      {showForm && (
        <div className="bg-admin-card border border-admin-text-secondary/20 p-8">
          <h2 className="font-display text-2xl text-admin-text mb-6">
            {editingCategory ? 'Edit Category' : 'New Category'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-admin-text mb-2">Category Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-admin-bg border border-admin-text-secondary/30 text-admin-text focus:border-gold-metallic outline-none"
                required
                data-testid="category-name-input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-admin-text mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows="3"
                className="w-full px-4 py-3 bg-admin-bg border border-admin-text-secondary/30 text-admin-text focus:border-gold-metallic outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-admin-text mb-2">Subcategories</label>
              <div className="space-y-3">
                {formData.subcategories.map((sub, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={sub}
                      onChange={(e) => updateSubcategory(index, e.target.value)}
                      placeholder="Subcategory name"
                      className="flex-1 px-4 py-3 bg-admin-bg border border-admin-text-secondary/30 text-admin-text focus:border-gold-metallic outline-none"
                    />
                    {formData.subcategories.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSubcategory(index)}
                        className="p-3 text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addSubcategoryField}
                  className="text-gold-metallic hover:text-gold-matte text-sm font-medium"
                >
                  + Add Subcategory
                </button>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                className="bg-gold-metallic text-white px-8 py-3 font-medium hover:bg-gold-matte transition-all"
                data-testid="save-category-btn"
              >
                {editingCategory ? 'Update' : 'Create'} Category
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingCategory(null);
                  setFormData({ name: '', description: '', subcategories: [''] });
                }}
                className="border border-admin-text-secondary/30 text-admin-text px-8 py-3 font-medium hover:bg-admin-bg transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {categories.map((category) => (
          <div
            key={category.category_id}
            className="bg-admin-card border border-admin-text-secondary/20 p-6"
            data-testid={`category-${category.category_id}`}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-display text-xl text-admin-text mb-1">{category.name}</h3>
                {category.description && (
                  <p className="text-sm text-admin-text-secondary">{category.description}</p>
                )}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(category)}
                  className="p-2 text-blue-400 hover:bg-blue-500/10 transition-colors"
                  data-testid={`edit-category-${category.category_id}`}
                >
                  <Edit2 className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleDelete(category.category_id)}
                  className="p-2 text-red-400 hover:bg-red-500/10 transition-colors"
                  data-testid={`delete-category-${category.category_id}`}
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>

            {category.subcategories && category.subcategories.length > 0 && (
              <div>
                <p className="text-xs text-admin-text-secondary mb-2">Subcategories:</p>
                <div className="flex flex-wrap gap-2">
                  {category.subcategories.map((sub, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 text-xs bg-admin-bg text-admin-text border border-admin-text-secondary/20"
                    >
                      {sub}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminCategories;