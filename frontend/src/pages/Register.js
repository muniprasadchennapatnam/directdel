import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '', confirmPassword: '',
    role: 'user', location: ''
  });
  const [errors, setErrors] = useState({});

  const validatePassword = (pwd) => {
    if (pwd.length < 8) return 'At least 8 characters';
    if (!/[A-Z]/.test(pwd)) return 'Need one uppercase letter';
    if (!/[a-z]/.test(pwd)) return 'Need one lowercase letter';
    if (!/\d/.test(pwd)) return 'Need one number';
    if (!/[@$!%*?&]/.test(pwd)) return 'Need one special character (@$!%*?&)';
    return null;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.email) errs.email = 'Email is required';
    if (!form.phone) errs.phone = 'Phone is required';
    const pwdErr = validatePassword(form.password);
    if (pwdErr) errs.password = pwdErr;
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      const res = await axios.post('/api/auth/register', form);
      toast.success('OTP sent! Please verify your account.');
      navigate('/verify-otp', { state: { userId: res.data.userId, otp: res.data.otp } });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = () => {
    const pwd = form.password;
    if (!pwd) return null;
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/\d/.test(pwd)) score++;
    if (/[@$!%*?&]/.test(pwd)) score++;
    const labels = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
    const colors = ['', '#ef4444', '#f59e0b', '#eab308', '#22c55e', '#16a34a'];
    return { label: labels[score], color: colors[score], score };
  };

  const strength = getPasswordStrength();

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <span style={{ fontSize: '3rem' }}>🌾</span>
          <h1 className="auth-title" style={{ marginTop: 8 }}>Join FarmConnect</h1>
          <p className="auth-subtitle">Create your account to get started</p>
        </div>

        {/* Role Selector */}
        <div style={styles.roleSelector}>
          {['user', 'farmer'].map(role => (
            <button
              key={role}
              type="button"
              onClick={() => setForm(p => ({ ...p, role }))}
              style={{
                ...styles.roleBtn,
                ...(form.role === role ? styles.roleBtnActive : {})
              }}
            >
              {role === 'farmer' ? '🚜 I\'m a Farmer' : '🛒 I\'m a Buyer'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input name="name" value={form.name} onChange={handleChange}
              className="form-control" placeholder="Enter your full name" />
            {errors.name && <p style={styles.error}>{errors.name}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input type="email" name="email" value={form.email} onChange={handleChange}
              className="form-control" placeholder="your@email.com" />
            {errors.email && <p style={styles.error}>{errors.email}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input name="phone" value={form.phone} onChange={handleChange}
              className="form-control" placeholder="+91 98765 43210" />
            {errors.phone && <p style={styles.error}>{errors.phone}</p>}
          </div>

          {form.role === 'farmer' && (
            <div className="form-group">
              <label className="form-label">Farm Location</label>
              <input name="location" value={form.location} onChange={handleChange}
                className="form-control" placeholder="Village, District, State" />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Password</label>
            <input type="password" name="password" value={form.password} onChange={handleChange}
              className="form-control" placeholder="Min 8 chars, upper, lower, number, symbol" />
            {form.password && strength && (
              <div style={{ marginTop: 6 }}>
                <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                  {[1,2,3,4,5].map(i => (
                    <div key={i} style={{
                      height: 4, flex: 1, borderRadius: 4,
                      background: i <= strength.score ? strength.color : '#e5e7eb',
                      transition: 'background 0.3s'
                    }} />
                  ))}
                </div>
                <p style={{ fontSize: '0.8rem', color: strength.color }}>{strength.label}</p>
              </div>
            )}
            {errors.password && <p style={styles.error}>{errors.password}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange}
              className="form-control" placeholder="Re-enter your password" />
            {errors.confirmPassword && <p style={styles.error}>{errors.confirmPassword}</p>}
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? '⏳ Sending OTP...' : '🚀 Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 24, color: '#4a6b4a', fontSize: '0.9rem' }}>
          Already have an account? <Link to="/login" style={{ color: '#2d7a4f', fontWeight: 600 }}>Login</Link>
        </p>
      </div>
    </div>
  );
};

const styles = {
  roleSelector: { display: 'flex', gap: 12, marginBottom: 28 },
  roleBtn: {
    flex: 1, padding: '12px', borderRadius: 10, border: '2px solid #d4e8d4',
    background: 'white', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
    fontWeight: 600, fontSize: '0.9rem', color: '#4a6b4a', transition: 'all 0.2s',
  },
  roleBtnActive: {
    background: '#e8f5ec', borderColor: '#2d7a4f', color: '#1a4a2e',
  },
  error: { color: '#ef4444', fontSize: '0.8rem', marginTop: 4 },
};

export default Register;
