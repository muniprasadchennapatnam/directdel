import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const CATEGORIES = ['vegetables', 'fruits', 'grains', 'dairy', 'spices', 'other'];
const UNITS = ['kg', 'g', 'litre', 'ml', 'dozen', 'piece', 'bunch', 'quintal'];

const AddProduct = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', category: 'vegetables',
    price: '', unit: 'kg', quantity: '', location: ''
  });
  const [images, setImages] = useState([]);
  const [preview, setPreview] = useState([]);

  useEffect(() => {
    if (isEditing) {
      axios.get(`/api/products/${id}`)
        .then(res => {
          const p = res.data;
          setForm({ title: p.title, description: p.description, category: p.category, price: p.price, unit: p.unit, quantity: p.quantity, location: p.location || '' });
        })
        .catch(() => toast.error('Failed to load product'));
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    setPreview(files.map(f => URL.createObjectURL(f)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.price || !form.quantity) { toast.error('Please fill required fields'); return; }
    setLoading(true);

    const data = new FormData();
    Object.entries(form).forEach(([k, v]) => data.append(k, v));
    images.forEach(img => data.append('images', img));

    try {
      if (isEditing) {
        await axios.put(`/api/products/${id}`, data);
        toast.success('Product updated successfully!');
      } else {
        await axios.post('/api/products', data);
        toast.success('Product listed successfully! 🌾');
      }
      navigate('/farmer/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 700 }}>
        <button onClick={() => navigate(-1)} style={styles.backBtn}>← Back</button>
        <h1 className="page-title">{isEditing ? 'Edit Product' : 'List a New Crop'}</h1>
        <p className="page-subtitle">{isEditing ? 'Update your product details' : 'Add your crop to reach buyers across the region'}</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div className="form-group">
            <label className="form-label">Product Title *</label>
            <input name="title" value={form.title} onChange={handleChange}
              className="form-control" placeholder="e.g. Fresh Organic Tomatoes" required />
          </div>

          <div style={styles.row}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Category *</label>
              <select name="category" value={form.category} onChange={handleChange} className="form-control">
                {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Unit *</label>
              <select name="unit" value={form.unit} onChange={handleChange} className="form-control">
                {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>

          <div style={styles.row}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Price per {form.unit} (₹) *</label>
              <input type="number" name="price" value={form.price} onChange={handleChange}
                className="form-control" placeholder="0.00" min="0" step="0.01" required />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Available Quantity *</label>
              <input type="number" name="quantity" value={form.quantity} onChange={handleChange}
                className="form-control" placeholder="0" min="0" required />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Farm Location</label>
            <input name="location" value={form.location} onChange={handleChange}
              className="form-control" placeholder="Village, District, State" />
          </div>

          <div className="form-group">
            <label className="form-label">Description *</label>
            <textarea name="description" value={form.description} onChange={handleChange}
              className="form-control" placeholder="Describe your product — freshness, how it's grown, best uses..."
              rows={4} required />
          </div>

          <div className="form-group">
            <label className="form-label">Product Images (max 5)</label>
            <div style={styles.imageUpload}>
              <span style={{ fontSize: '2rem' }}>📷</span>
              <p style={{ color: '#4a6b4a', marginBottom: 8 }}>Click to upload images</p>
              <input type="file" accept="image/*" multiple onChange={handleImageChange}
                style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
            </div>
            {preview.length > 0 && (
              <div style={styles.previewGrid}>
                {preview.map((src, i) => (
                  <img key={i} src={src} alt="" style={styles.previewImg} />
                ))}
              </div>
            )}
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={loading} style={{ marginTop: 8, padding: '16px' }}>
            {loading ? '⏳ Saving...' : (isEditing ? '💾 Update Product' : '🌾 List My Crop')}
          </button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  backBtn: { background: 'none', border: 'none', color: '#2d7a4f', fontWeight: 600, cursor: 'pointer', fontSize: '0.95rem', marginBottom: 20, fontFamily: "'DM Sans', sans-serif" },
  form: { background: 'white', borderRadius: 20, padding: 40, boxShadow: '0 4px 24px rgba(26,74,46,0.1)' },
  row: { display: 'flex', gap: 16 },
  imageUpload: {
    position: 'relative', border: '2px dashed #d4e8d4', borderRadius: 12,
    padding: 32, textAlign: 'center', background: '#f9fdf9', cursor: 'pointer',
  },
  previewGrid: { display: 'flex', gap: 10, marginTop: 12, flexWrap: 'wrap' },
  previewImg: { width: 80, height: 80, objectFit: 'cover', borderRadius: 8, border: '1.5px solid #d4e8d4' },
};

export default AddProduct;
