import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.inner}>
        <Link to="/" style={styles.logo}>
          🌾 FarmConnect
        </Link>

        <div style={styles.links}>
          <Link to="/marketplace" style={styles.link}>Marketplace</Link>

          {isAuthenticated ? (
            <>
              {user?.role === 'farmer' ? (
                <>
                  <Link to="/farmer/dashboard" style={styles.link}>My Farm</Link>
                  <Link to="/farmer/add-product" style={{ ...styles.btn, background: '#2d7a4f' }}>+ List Crop</Link>
                </>
              ) : (
                <Link to="/my-orders" style={styles.link}>My Orders</Link>
              )}
              <div style={styles.userMenu}>
                <span style={styles.userName}>Hi, {user?.name?.split(' ')[0]}</span>
                <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" style={styles.link}>Login</Link>
              <Link to="/register" style={{ ...styles.btn, background: '#1a4a2e' }}>Get Started</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

const styles = {
  nav: {
    background: 'white',
    borderBottom: '1px solid #d4e8d4',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    boxShadow: '0 2px 12px rgba(26,74,46,0.08)',
  },
  inner: {
    maxWidth: 1200,
    margin: '0 auto',
    padding: '0 24px',
    height: 72,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: {
    fontFamily: "'Playfair Display', serif",
    fontSize: '1.5rem',
    fontWeight: 700,
    color: '#1a4a2e',
    textDecoration: 'none',
  },
  links: {
    display: 'flex',
    alignItems: 'center',
    gap: 24,
  },
  link: {
    color: '#4a6b4a',
    textDecoration: 'none',
    fontWeight: 500,
    fontSize: '0.95rem',
    transition: 'color 0.2s',
  },
  btn: {
    color: 'white',
    textDecoration: 'none',
    fontWeight: 600,
    fontSize: '0.9rem',
    padding: '10px 20px',
    borderRadius: 8,
    transition: 'all 0.2s',
  },
  userMenu: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  userName: {
    color: '#2d7a4f',
    fontWeight: 600,
    fontSize: '0.9rem',
  },
  logoutBtn: {
    background: 'transparent',
    border: '1.5px solid #d4e8d4',
    color: '#4a6b4a',
    padding: '8px 16px',
    borderRadius: 8,
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 500,
    fontSize: '0.9rem',
  },
};

export default Navbar;
