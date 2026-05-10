import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const CAT_ICONS = { vegetables: '🥬', fruits: '🍎', grains: '🌾', dairy: '🥛', spices: '🌶️', other: '📦' };

const FarmerDashboard = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('products');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, ordRes] = await Promise.all([
          axios.get('/api/products/farmer/my-products'),
          axios.get('/api/orders/farmer-orders')
        ]);
        setProducts(prodRes.data);
        setOrders(ordRes.data);
      } catch (err) {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await axios.delete(`/api/products/${id}`);
      setProducts(prev => prev.filter(p => p._id !== id));
      toast.success('Product deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      await axios.put(`/api/orders/${orderId}/status`, { status });
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status } : o));
      toast.success('Order status updated');
    } catch {
      toast.error('Failed to update status');
    }
  };

  const stats = {
    totalProducts: products.length,
    activeProducts: products.filter(p => p.isAvailable).length,
    totalOrders: orders.length,
    pendingOrders: orders.filter(o => o.status === 'pending').length,
    revenue: orders.filter(o => o.status === 'delivered').reduce((sum, o) => sum + o.totalPrice, 0),
  };

  if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;

  return (
    <div className="page">
      <div className="container">
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 className="page-title">My Farm Dashboard</h1>
            <p style={{ color: '#4a6b4a' }}>Welcome back, {user?.name} 🌱</p>
          </div>
          <Link to="/farmer/add-product" className="btn btn-primary">+ Add New Product</Link>
        </div>

        {/* Stats */}
        <div style={styles.statsGrid}>
          {[
            { label: 'Total Listings', value: stats.totalProducts, icon: '🌿', color: '#e8f5ec' },
            { label: 'Active Listings', value: stats.activeProducts, icon: '✅', color: '#e8f5ec' },
            { label: 'Total Orders', value: stats.totalOrders, icon: '📦', color: '#fdf0e8' },
            { label: 'Pending Orders', value: stats.pendingOrders, icon: '⏳', color: '#fff8e1' },
            { label: 'Revenue Earned', value: `₹${stats.revenue}`, icon: '💰', color: '#e8f5ec' },
          ].map((s, i) => (
            <div key={i} style={{ ...styles.statCard, background: s.color }}>
              <span style={{ fontSize: '2rem' }}>{s.icon}</span>
              <p style={styles.statValue}>{s.value}</p>
              <p style={styles.statLabel}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={styles.tabs}>
          {['products', 'orders'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{ ...styles.tab, ...(activeTab === tab ? styles.tabActive : {}) }}>
              {tab === 'products' ? '🌿 My Products' : '📦 Received Orders'}
            </button>
          ))}
        </div>

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div>
            {products.length === 0 ? (
              <div style={styles.empty}>
                <span style={{ fontSize: '4rem' }}>🌱</span>
                <h3>No products yet</h3>
                <p>Start listing your crops to reach buyers</p>
                <Link to="/farmer/add-product" className="btn btn-primary" style={{ marginTop: 16 }}>+ Add First Product</Link>
              </div>
            ) : (
              <div style={styles.table}>
                <div style={styles.tableHeader}>
                  <span>Product</span><span>Price</span><span>Qty</span><span>Status</span><span>Actions</span>
                </div>
                {products.map(p => (
                  <div key={p._id} style={styles.tableRow}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: '1.5rem' }}>{CAT_ICONS[p.category]}</span>
                      <span style={{ fontWeight: 600 }}>{p.title}</span>
                    </span>
                    <span style={{ color: '#1a4a2e', fontWeight: 700 }}>₹{p.price}/{p.unit}</span>
                    <span style={{ color: '#4a6b4a' }}>{p.quantity} {p.unit}</span>
                    <span>
                      <span className={`badge ${p.isAvailable ? 'badge-green' : 'badge-gray'}`}>
                        {p.isAvailable ? 'Active' : 'Out of Stock'}
                      </span>
                    </span>
                    <span style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => navigate(`/farmer/edit-product/${p._id}`)} className="btn btn-secondary btn-sm">Edit</button>
                      <button onClick={() => handleDelete(p._id)} style={{ ...styles.deleteBtn }} className="btn btn-sm">Delete</button>
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div>
            {orders.length === 0 ? (
              <div style={styles.empty}>
                <span style={{ fontSize: '4rem' }}>📭</span>
                <h3>No orders yet</h3>
                <p>Orders from buyers will appear here</p>
              </div>
            ) : (
              <div>
                {orders.map(order => (
                  <div key={order._id} style={styles.orderCard}>
                    <div style={styles.orderHeader}>
                      <div>
                        <p style={{ fontWeight: 700 }}>{order.product?.title}</p>
                        <p style={{ fontSize: '0.85rem', color: '#4a6b4a' }}>
                          Buyer: {order.buyer?.name} · 📞 {order.buyer?.phone}
                        </p>
                        <p style={{ fontSize: '0.85rem', color: '#4a6b4a' }}>
                          📍 {order.deliveryAddress}
                        </p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontWeight: 700, fontSize: '1.2rem', color: '#1a4a2e' }}>₹{order.totalPrice}</p>
                        <p style={{ fontSize: '0.85rem', color: '#4a6b4a' }}>Qty: {order.quantity}</p>
                        <span className={`badge status-${order.status}`}>{order.status}</span>
                      </div>
                    </div>
                    {order.status === 'pending' && (
                      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                        <button onClick={() => updateOrderStatus(order._id, 'confirmed')} className="btn btn-primary btn-sm">✅ Confirm</button>
                        <button onClick={() => updateOrderStatus(order._id, 'cancelled')} style={styles.deleteBtn} className="btn btn-sm">❌ Cancel</button>
                      </div>
                    )}
                    {order.status === 'confirmed' && (
                      <button onClick={() => updateOrderStatus(order._id, 'shipped')} className="btn btn-primary btn-sm" style={{ marginTop: 12 }}>🚚 Mark Shipped</button>
                    )}
                    {order.status === 'shipped' && (
                      <button onClick={() => updateOrderStatus(order._id, 'delivered')} className="btn btn-primary btn-sm" style={{ marginTop: 12 }}>✅ Mark Delivered</button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 40 },
  statCard: { padding: 20, borderRadius: 16, textAlign: 'center' },
  statValue: { fontFamily: "'Playfair Display', serif", fontSize: '1.8rem', fontWeight: 700, color: '#1a4a2e', margin: '8px 0 4px' },
  statLabel: { fontSize: '0.8rem', color: '#4a6b4a', textTransform: 'uppercase', letterSpacing: 1 },
  tabs: { display: 'flex', gap: 8, marginBottom: 24 },
  tab: { padding: '10px 24px', borderRadius: 8, border: '1.5px solid #d4e8d4', background: 'white', cursor: 'pointer', fontWeight: 600, fontFamily: "'DM Sans', sans-serif", color: '#4a6b4a', fontSize: '0.95rem' },
  tabActive: { background: '#1a4a2e', borderColor: '#1a4a2e', color: 'white' },
  table: { background: 'white', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 12px rgba(26,74,46,0.08)' },
  tableHeader: { display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: 16, padding: '14px 20px', background: '#f0f7f2', fontWeight: 700, fontSize: '0.85rem', color: '#2d7a4f', textTransform: 'uppercase', letterSpacing: 1 },
  tableRow: { display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: 16, padding: '16px 20px', alignItems: 'center', borderBottom: '1px solid #f0f7f2' },
  deleteBtn: { background: '#fce4e4', color: '#c62828', border: 'none' },
  empty: { textAlign: 'center', padding: '60px 0', color: '#4a6b4a' },
  orderCard: { background: 'white', borderRadius: 16, padding: 24, marginBottom: 16, boxShadow: '0 2px 12px rgba(26,74,46,0.08)' },
  orderHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
};

export default FarmerDashboard;
