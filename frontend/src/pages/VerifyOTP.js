import React, { useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const VerifyOTP = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { userId, otp: devOtp } = location.state || {};
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const inputs = useRef([]);

  if (!userId) { navigate('/register'); return null; }

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) inputs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpStr = otp.join('');
    if (otpStr.length < 6) { toast.error('Please enter the complete 6-digit OTP'); return; }
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/verify-otp', { userId, otp: otpStr });
      login(res.data.token, res.data.user);
      toast.success('Account verified! Welcome to FarmConnect 🎉');
      navigate(res.data.user.role === 'farmer' ? '/farmer/dashboard' : '/marketplace');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      const res = await axios.post('/api/auth/resend-otp', { userId });
      toast.success('New OTP sent!');
    } catch {
      toast.error('Failed to resend OTP');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ textAlign: 'center' }}>
        <span style={{ fontSize: '4rem' }}>📱</span>
        <h1 className="auth-title" style={{ marginTop: 16 }}>Verify Your Account</h1>
        <p className="auth-subtitle">Enter the 6-digit OTP sent to your email/phone</p>

        {devOtp && (
          <div style={{ background: '#fff8e1', border: '1px solid #f59e0b', borderRadius: 8, padding: 12, marginBottom: 24, fontSize: '0.85rem', color: '#b45309' }}>
            <strong>Dev Mode OTP:</strong> {devOtp}
          </div>
        )}

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 32 }}>
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={el => inputs.current[i] = el}
              value={digit}
              onChange={e => handleChange(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)}
              maxLength={1}
              style={{
                width: 52, height: 60, textAlign: 'center',
                fontSize: '1.5rem', fontWeight: 700,
                border: `2px solid ${digit ? '#2d7a4f' : '#d4e8d4'}`,
                borderRadius: 10, outline: 'none',
                background: digit ? '#e8f5ec' : 'white',
                transition: 'all 0.2s', fontFamily: "'DM Sans', sans-serif",
              }}
            />
          ))}
        </div>

        <button className="btn btn-primary btn-full" onClick={handleVerify} disabled={loading}>
          {loading ? '⏳ Verifying...' : '✅ Verify Account'}
        </button>

        <p style={{ marginTop: 20, color: '#4a6b4a', fontSize: '0.9rem' }}>
          Didn't receive OTP?{' '}
          <button onClick={handleResend} style={{ background: 'none', border: 'none', color: '#2d7a4f', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' }}>
            Resend OTP
          </button>
        </p>
      </div>
    </div>
  );
};

export default VerifyOTP;
