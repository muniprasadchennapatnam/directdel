import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const STATUS_STEPS = ['pending', 'confirmed', 'shipped', 'delivered'];

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/orders/my-orders')
      .then(res => setOrders(res.data))
      .catch(() => toast.error('Failed to load orders'))
      .finally(() => setLoading(false));
  }, []);

  const cancelOrder = async (orderId) => {
    if (!window.confirm('Cancel this order?')) return;
    try {
      await axios.put(`/api/orders/${orderId}/status`, { status: 'cancelled' });
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: 'cancelled' } : o));
      toast.success('Order cancelled');
    } catch {
      toast.error('Failed to cancel order');
    }
  };

  if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 800 }}>
        <h1 className="page-title">My Orders</h1>
        <p className="page-subtitle">{orders.length} order{orders.length !== 1 ? 's' : ''} placed</p>

        {orders.length === 0 ? (
          <div style={styles.empty}>
            <span style={{ fontSize: '4rem' }}>🛒</span>
            <h3>No orders yet</h3>
            <p>Browse the marketplace and buy fresh produce!</p>
            <Link to="/marketplace" className="btn btn-primary" style={{ marginTop: 16 }}>Browse Marketplace</Link>
          </div>
        ) : (
          <div>
            {orders.map(order => {
              const stepIdx = STATUS_STEPS.indexOf(order.status);
              return (
                <div key={order._id} style={styles.orderCard}>
                  <div style={styles.orderTop}>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <span style={{ fontSize: '2.5rem' }}>📦</span>
                      <div>
                        <p style={{ fontWeight: 700, fontSize: '1.05rem' }}>{order.product?.title}</p>
                        <p style={{ fontSize: '0.85rem', color: '#4a6b4a' }}>
                          From: {order.farmer?.name} · 📞 {order.farmer?.phone}
                        </p>
                        <p style={{ fontSize: '0.8rem', color: '#8aab8a', marginTop: 2 }}>
                          Placed: {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontWeight: 700, fontSize: '1.2rem', color: '#1a4a2e' }}>₹{order.totalPrice}</p>
                      <p style={{ fontSize: '0.85rem', color: '#4a6b4a' }}>Qty: {order.quantity} {order.product?.unit}</p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  {order.status !== 'cancelled' ? (
                    <div style={styles.progress}>
                      {STATUS_STEPS.map((step, i) => (
                        <React.Fragment key={step}>
                          <div style={styles.step}>
                            <div style={{
                              ...styles.stepDot,
                              background: i <= stepIdx ? '#2d7a4f' : '#d4e8d4',
                              border: `3px solid ${i <= stepIdx ? '#1a4a2e' : '#d4e8d4'}`,
                            }}>
                              {i < stepIdx ? '✓' : ''}
                            </div>
                            <span style={{ fontSize: '0.75rem', color: i <= stepIdx ? '#1a4a2e' : '#8aab8a', fontWeight: i === stepIdx ? 700 : 400 }}>
                              {step.charAt(0).toUpperCase() + step.slice(1)}
                            </span>
                          </div>
                          {i < STATUS_STEPS.length - 1 && (
                            <div style={{ flex: 1, height: 3, background: i < stepIdx ? '#2d7a4f' : '#d4e8d4', marginBottom: 18 }} />
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  ) : (
                    <div style={{ marginTop: 16 }}>
                      <span className="badge status-cancelled">❌ Order Cancelled</span>
                    </div>
                  )}

                  <div style={{ marginTop: 12, padding: '12px 16px', background: '#f0f7f2', borderRadius: 8 }}>
                    <p style={{ fontSize: '0.85rem', color: '#4a6b4a' }}>📍 Delivery: {order.deliveryAddress}</p>
                  </div>

                  {order.status === 'pending' && (
                    <button onClick={() => cancelOrder(order._id)} style={styles.cancelBtn} className="btn btn-sm">
                      Cancel Order
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  empty: { textAlign: 'center', padding: '80px 0', color: '#4a6b4a' },
  orderCard: { background: 'white', borderRadius: 16, padding: 24, marginBottom: 20, boxShadow: '0 2px 12px rgba(26,74,46,0.08)' },
  orderTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  progress: { display: 'flex', alignItems: 'flex-end', gap: 0 },
  step: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, minWidth: 60 },
  stepDot: { width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', color: 'white', fontWeight: 700 },
  cancelBtn: { marginTop: 16, background: '#fce4e4', color: '#c62828', border: 'none' },
};

export default MyOrders;
