import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';

const CATEGORIES = ['all', 'vegetables', 'fruits', 'grains', 'dairy', 'spices', 'other'];
const CAT_ICONS = { vegetables: '🥬', fruits: '🍎', grains: '🌾', dairy: '🥛', spices: '🌶️', other: '📦', all: '🛒' };

const Marketplace = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const category = searchParams.get('category') || 'all';

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 12 };
      if (category !== 'all') params.category = category;
      if (search) params.search = search;
      const res = await axios.get('/api/products', { params });
      setProducts(res.data.products);
      setTotal(res.data.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, [category, page, search]);

  const handleCategoryChange = (cat) => {
    setPage(1);
    if (cat === 'all') setSearchParams({});
    else setSearchParams({ category: cat });
  };

  return (
    <div className="page">
      <div className="container">
        <h1 className="page-title">Fresh from Farmers</h1>
        <p className="page-subtitle">{total} products available directly from farmers</p>

        {/* Search bar */}
        <div style={styles.searchBar}>
          <span style={{ fontSize: '1.2rem' }}>🔍</span>
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search crops, vegetables, fruits..."
            style={styles.searchInput}
          />
        </div>

        {/* Category pills */}
        <div style={styles.pills}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              style={{
                ...styles.pill,
                ...(category === cat || (cat === 'all' && !searchParams.get('category')) ? styles.pillActive : {})
              }}
            >
              {CAT_ICONS[cat]} {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        {/* Products */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 80 }}>
            <div className="spinner" style={{ margin: '0 auto' }}></div>
            <p style={{ marginTop: 16, color: '#4a6b4a' }}>Loading fresh produce...</p>
          </div>
        ) : products.length === 0 ? (
          <div style={styles.empty}>
            <span style={{ fontSize: '4rem' }}>🌱</span>
            <h3>No products found</h3>
            <p>Try a different category or search term</p>
          </div>
        ) : (
          <div className="product-grid">
            {products.map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {total > 12 && (
          <div style={styles.pagination}>
            <button className="btn btn-secondary btn-sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
              ← Prev
            </button>
            <span style={{ color: '#4a6b4a', fontWeight: 600 }}>Page {page} of {Math.ceil(total / 12)}</span>
            <button className="btn btn-secondary btn-sm" onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(total / 12)}>
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const ProductCard = ({ product }) => (
  <Link to={`/product/${product._id}`} style={{ textDecoration: 'none' }}>
    <div className="card product-card">
      <div className="product-card-img">
        {product.images?.[0]
          ? <img src={`http://localhost:5000/${product.images[0]}`} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <span>{CAT_ICONS[product.category] || '🌿'}</span>
        }
      </div>
      <div className="product-card-body">
        <span className="badge badge-green" style={{ marginBottom: 8 }}>{product.category}</span>
        <h3 className="product-card-title">{product.title}</h3>
        <p className="product-card-farmer">🚜 {product.farmer?.name} · {product.farmer?.location || 'Local Farm'}</p>
        <p style={{ fontSize: '0.85rem', color: '#8aab8a', lineHeight: 1.5 }}>
          {product.description?.slice(0, 80)}{product.description?.length > 80 ? '...' : ''}
        </p>
        <div className="product-card-footer">
          <span className="product-price">₹{product.price}/{product.unit}</span>
          <span style={{ fontSize: '0.85rem', color: '#8aab8a' }}>Qty: {product.quantity}{product.unit}</span>
        </div>
        {product.avgRating > 0 && (
          <div style={{ marginTop: 8 }}>
            <span className="stars">{'★'.repeat(Math.round(product.avgRating))}</span>
            <span style={{ fontSize: '0.8rem', color: '#8aab8a', marginLeft: 4 }}>({product.ratings?.length})</span>
          </div>
        )}
      </div>
    </div>
  </Link>
);

const styles = {
  searchBar: {
    display: 'flex', alignItems: 'center', gap: 12,
    background: 'white', borderRadius: 12, padding: '12px 20px',
    boxShadow: '0 2px 12px rgba(26,74,46,0.08)',
    marginBottom: 24, border: '1.5px solid #d4e8d4',
  },
  searchInput: {
    border: 'none', outline: 'none', flex: 1,
    fontFamily: "'DM Sans', sans-serif", fontSize: '1rem', color: '#1a2e1a',
  },
  pills: { display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 32 },
  pill: {
    padding: '8px 18px', borderRadius: 20, border: '1.5px solid #d4e8d4',
    background: 'white', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
    fontWeight: 500, fontSize: '0.9rem', color: '#4a6b4a', transition: 'all 0.2s',
  },
  pillActive: { background: '#1a4a2e', borderColor: '#1a4a2e', color: 'white' },
  empty: { textAlign: 'center', padding: '80px 0', color: '#4a6b4a' },
  pagination: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24, marginTop: 48 },
};

export default Marketplace;
