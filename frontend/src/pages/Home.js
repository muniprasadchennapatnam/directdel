import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div>
      {/* Hero Section */}
      <section style={styles.hero}>
        <div style={styles.heroContent}>
          <span style={styles.heroBadge}>🌱 Fresh from the Field</span>
          <h1 style={styles.heroTitle}>Buy Fresh Crops<br />Direct from Farmers</h1>
          <p style={styles.heroSubtitle}>
            FarmConnect bridges the gap between farmers and consumers.
            No middlemen. Better prices. Fresher produce.
          </p>
          <div style={styles.heroActions}>
            <Link to="/marketplace" className="btn btn-primary" style={{ fontSize: '1rem', padding: '14px 32px' }}>
              Browse Marketplace
            </Link>
            <Link to="/register" className="btn btn-secondary" style={{ fontSize: '1rem', padding: '14px 32px' }}>
              Sell Your Crops
            </Link>
          </div>
        </div>
        <div style={styles.heroEmoji}>🌾</div>
      </section>

      {/* How It Works */}
      <section style={styles.section}>
        <div className="container">
          <h2 style={styles.sectionTitle}>How It Works</h2>
          <div style={styles.stepsGrid}>
            {[
              { icon: '📝', title: 'Sign Up', desc: 'Register as a Farmer or Buyer. Verify your account with OTP.', color: '#e8f5ec' },
              { icon: '🌽', title: 'List or Browse', desc: 'Farmers upload crops. Buyers browse by category, price, location.', color: '#fdf0e8' },
              { icon: '🛒', title: 'Buy & Sell', desc: 'Place orders directly. No middlemen, fair prices for everyone.', color: '#e8f5ec' },
              { icon: '🚜', title: 'Track & Deliver', desc: 'Track your order status from confirmed to delivered.', color: '#fdf0e8' },
            ].map((step, i) => (
              <div key={i} style={{ ...styles.stepCard, background: step.color }}>
                <div style={styles.stepIcon}>{step.icon}</div>
                <h3 style={styles.stepTitle}>{step.title}</h3>
                <p style={styles.stepDesc}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section style={{ ...styles.section, background: '#f0f7f2' }}>
        <div className="container">
          <h2 style={styles.sectionTitle}>Browse by Category</h2>
          <div style={styles.catGrid}>
            {[
              { icon: '🥬', label: 'Vegetables', value: 'vegetables' },
              { icon: '🍎', label: 'Fruits', value: 'fruits' },
              { icon: '🌾', label: 'Grains', value: 'grains' },
              { icon: '🥛', label: 'Dairy', value: 'dairy' },
              { icon: '🌶️', label: 'Spices', value: 'spices' },
              { icon: '📦', label: 'Other', value: 'other' },
            ].map((cat, i) => (
              <Link key={i} to={`/marketplace?category=${cat.value}`} style={styles.catCard}>
                <span style={styles.catIcon}>{cat.icon}</span>
                <span style={styles.catLabel}>{cat.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={styles.cta}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{ ...styles.sectionTitle, color: 'white' }}>Are You a Farmer?</h2>
          <p style={{ color: '#a8d5b8', marginBottom: 32, fontSize: '1.1rem' }}>
            Start selling your crops today. Reach thousands of buyers directly.
          </p>
          <Link to="/register" className="btn" style={{ background: 'white', color: '#1a4a2e', fontSize: '1rem', padding: '14px 32px' }}>
            Start Selling Free →
          </Link>
        </div>
      </section>
    </div>
  );
};

const styles = {
  hero: {
    background: 'linear-gradient(135deg, #1a4a2e 0%, #2d7a4f 60%, #4caf78 100%)',
    minHeight: '85vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '80px 120px',
    position: 'relative',
    overflow: 'hidden',
  },
  heroContent: { maxWidth: 600, zIndex: 1 },
  heroBadge: {
    display: 'inline-block',
    background: 'rgba(255,255,255,0.15)',
    color: '#a8e6c0',
    padding: '6px 16px',
    borderRadius: 20,
    fontSize: '0.9rem',
    fontWeight: 600,
    marginBottom: 24,
    backdropFilter: 'blur(8px)',
  },
  heroTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: '3.5rem',
    fontWeight: 700,
    color: 'white',
    lineHeight: 1.2,
    marginBottom: 20,
  },
  heroSubtitle: {
    color: '#c8f0d8',
    fontSize: '1.15rem',
    lineHeight: 1.7,
    marginBottom: 40,
  },
  heroActions: { display: 'flex', gap: 16, flexWrap: 'wrap' },
  heroEmoji: {
    fontSize: '12rem',
    opacity: 0.15,
    position: 'absolute',
    right: 80,
    userSelect: 'none',
  },
  section: { padding: '80px 0' },
  sectionTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: '2rem',
    color: '#1a4a2e',
    marginBottom: 40,
    textAlign: 'center',
  },
  stepsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: 24,
  },
  stepCard: {
    padding: 32,
    borderRadius: 16,
    textAlign: 'center',
  },
  stepIcon: { fontSize: '2.5rem', marginBottom: 16 },
  stepTitle: { fontFamily: "'Playfair Display', serif", fontSize: '1.2rem', color: '#1a4a2e', marginBottom: 8 },
  stepDesc: { color: '#4a6b4a', fontSize: '0.9rem', lineHeight: 1.6 },
  catGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
    gap: 16,
  },
  catCard: {
    background: 'white',
    borderRadius: 16,
    padding: '28px 16px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
    textDecoration: 'none',
    boxShadow: '0 2px 12px rgba(26,74,46,0.08)',
    transition: 'all 0.2s',
    cursor: 'pointer',
  },
  catIcon: { fontSize: '2.5rem' },
  catLabel: { fontWeight: 600, color: '#1a4a2e', fontSize: '0.95rem' },
  cta: {
    background: 'linear-gradient(135deg, #1a4a2e 0%, #2d7a4f 100%)',
    padding: '80px 0',
  },
};

export default Home;
