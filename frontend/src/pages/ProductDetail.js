import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const CAT_ICONS = { vegetables: '🥬', fruits: '🍎', grains: '🌾', dairy: '🥛', spices: '🌶️', other: '📦' };

const ProductDetail = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [address, setAddress] = useState('');
  const [ordering, setOrdering] = useState(false);

  useEffect(() => {
    axios.get(`/api/products/${id}`)
      .then(res => setProduct(res.data))
      .catch(() => toast.error('Product not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleOrder = async () => {
    if (!isAuthenticated) { toast.error('Please login to place an order'); navigate('/login'); return; }
    if (!address.trim()) { toast.error('Please enter delivery address'); return; }
    setOrdering(true);
    try {
      await axios.post('/api/orders', { productId: id, quantity: qty, deliveryAddress: address });
      toast.success('Order placed successfully! 🎉');
      navigate('/my-orders');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setOrdering(false);
    }
  };

  if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;
  if (!product) return <div className="page container"><p>Product not found</p></div>;

  return (
    <div className="page">
      <div className="container">
        <button onClick={() => navigate(-1)} style={styles.backBtn}>← Back to Marketplace</button>

        <div style={styles.grid}>
          {/* Image */}
          <div style={styles.imageBox}>
            {product.images?.[0]
              ? <img src={`http://localhost:5000/${product.images[0]}`} alt={product.title} style={styles.image} />
              : <div style={styles.imagePlaceholder}>{CAT_ICONS[product.category] || '🌿'}</div>
            }
          </div>

          {/* Details */}
          <div style={styles.details}>
            <span className="badge badge-green" style={{ marginBottom: 12 }}>{product.category}</span>
            <h1 style={styles.title}>{product.title}</h1>

            <div style={styles.farmerInfo}>
              <span style={{ fontSize: '1.5rem' }}>🚜</span>
              <div>
                <p style={{ fontWeight: 600, color: '#1a4a2e' }}>{product.farmer?.name}</p>
                <p style={{ fontSize: '0.85rem', color: '#4a6b4a' }}>📍 {product.location || product.farmer?.location || 'Local Farm'}</p>
              </div>
            </div>

            <div style={styles.priceRow}>
              <span style={styles.price}>₹{product.price}</span>
              <span style={{ color: '#4a6b4a', fontSize: '1rem' }}>per {product.unit}</span>
            </div>

            <p style={styles.desc}>{product.description}</p>

            <div style={styles.meta}>
              <div style={styles.metaItem}>
                <span style={styles.metaLabel}>Available Stock</span>
                <span style={styles.metaValue}>{product.quantity} {product.unit}</span>
              </div>
              <div style={styles.metaItem}>
                <span style={styles.metaLabel}>Status</span>
                <span className={`badge ${product.isAvailable ? 'badge-green' : 'badge-gray'}`}>
                  {product.isAvailable ? '✅ Available' : '❌ Out of Stock'}
                </span>
              </div>
            </div>

            {product.isAvailable && user?.role !== 'farmer' && (
              <div style={styles.orderBox}>
                <h3 style={{ fontFamily: "'Playfair Display', serif", color: '#1a4a2e', marginBottom: 16 }}>Place Order</h3>

                <div style={styles.qtyRow}>
                  <span style={{ fontWeight: 500 }}>Quantity ({product.unit})</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <button onClick={() => setQty(q => Math.max(1, q - 1))} style={styles.qtyBtn}>−</button>
                    <span style={{ fontWeight: 700, fontSize: '1.1rem', minWidth: 32, textAlign: 'center' }}>{qty}</span>
                    <button onClick={() => setQty(q => Math.min(product.quantity, q + 1))} style={styles.qtyBtn}>+</button>
                  </div>
                </div>

                <div style={styles.totalRow}>
                  <span style={{ color: '#4a6b4a' }}>Total Amount</span>
                  <span style={{ fontWeight: 700, fontSize: '1.3rem', color: '#1a4a2e' }}>₹{(product.price * qty).toFixed(2)}</span>
                </div>

                <div className="form-group">
                  <label className="form-label">Delivery Address</label>
                  <textarea
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    className="form-control"
                    placeholder="Enter your full delivery address..."
                    rows={3}
                  />
                </div>

                <button className="btn btn-primary btn-full" onClick={handleOrder} disabled={ordering}>
                  {ordering ? '⏳ Placing Order...' : '🛒 Place Order'}
                </button>
              </div>
            )}

            {!isAuthenticated && (
              <div style={styles.loginPrompt}>
                <p>Please <a href="/login" style={{ color: '#2d7a4f', fontWeight: 600 }}>login</a> to buy this product.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  backBtn: {
    background: 'none', border: 'none', color: '#2d7a4f', fontWeight: 600,
    cursor: 'pointer', fontSize: '0.95rem', marginBottom: 32, fontFamily: "'DM Sans', sans-serif",
  },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'start' },
  imageBox: { borderRadius: 20, overflow: 'hidden', boxShadow: '0 8px 40px rgba(26,74,46,0.15)' },
  image: { width: '100%', height: 400, objectFit: 'cover' },
  imagePlaceholder: {
    width: '100%', height: 400, background: '#e8f5ec',
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '6rem',
  },
  details: {},
  title: { fontFamily: "'Playfair Display', serif", fontSize: '2rem', color: '#1a2e1a', marginBottom: 16 },
  farmerInfo: {
    display: 'flex', alignItems: 'center', gap: 12,
    background: '#f0f7f2', borderRadius: 12, padding: '12px 16px', marginBottom: 20,
  },
  priceRow: { display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 16 },
  price: { fontFamily: "'Playfair Display', serif", fontSize: '2.5rem', fontWeight: 700, color: '#1a4a2e' },
  desc: { color: '#4a6b4a', lineHeight: 1.7, marginBottom: 20 },
  meta: { display: 'flex', gap: 24, marginBottom: 24 },
  metaItem: { display: 'flex', flexDirection: 'column', gap: 4 },
  metaLabel: { fontSize: '0.8rem', color: '#8aab8a', textTransform: 'uppercase', letterSpacing: 1 },
  metaValue: { fontWeight: 600, color: '#1a4a2e' },
  orderBox: { background: '#f0f7f2', borderRadius: 16, padding: 24 },
  qtyRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  qtyBtn: {
    width: 36, height: 36, borderRadius: 8, border: '1.5px solid #d4e8d4',
    background: 'white', cursor: 'pointer', fontWeight: 700, fontSize: '1.1rem',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  totalRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid #d4e8d4' },
  loginPrompt: {
    background: '#fff8e1', borderRadius: 12, padding: 20, textAlign: 'center',
    border: '1px solid #f59e0b', color: '#92400e',
  },
};

export default ProductDetail;
