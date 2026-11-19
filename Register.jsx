import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, db } from './firebase.js';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const inputStyle = {
    width: '100%',
    boxSizing: 'border-box',
    padding: '14px 16px',
    background: '#0d1b2a',
    border: '1px solid #415a77',
    borderRadius: '10px',
    color: '#ffffff',
    fontSize: '15px',
    outline: 'none'
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(result.user, { displayName: name });
      await setDoc(doc(db, 'users', result.user.uid), {
        name: name,
        email: email,
        coinBalance: 0,
        createdAt: serverTimestamp()
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '30px 16px',
      boxSizing: 'border-box'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '430px',
        background: '#1b263b',
        border: '1px solid #27374d',
        borderRadius: '20px',
        padding: '32px 24px',
        boxSizing: 'border-box',
        boxShadow: '0 15px 40px rgba(0,0,0,0.25)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ fontSize: '38px', marginBottom: '10px' }}>🪙</div>
          <h2 style={{ color: '#ffffff', margin: '0 0 10px' }}>Join CoinMitra</h2>
          <p style={{ color: '#a0aec0', margin: 0, fontSize: '14px' }}>
            Create your account and get started
          </p>
        </div>

        <form onSubmit={handleRegister} style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          <div>
            <label style={{ display: 'block', color: '#cbd5e1', marginBottom: '9px' }}>Full Name</label>
            <input style={inputStyle} placeholder="Enter your full name" value={name} onChange={e => setName(e.target.value)} required />
          </div>

          <div>
            <label style={{ display: 'block', color: '#cbd5e1', marginBottom: '9px' }}>Email Address</label>
            <input style={inputStyle} type="email" placeholder="Enter your email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>

          <div>
            <label style={{ display: 'block', color: '#cbd5e1', marginBottom: '9px' }}>Password</label>
            <input style={inputStyle} type="password" minLength="6" placeholder="Minimum 6 characters" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>

          {error && <p style={{ color: '#ff7777', margin: 0, fontSize: '13px' }}>{error}</p>}

          <button type="submit" disabled={loading} style={{
            width: '100%',
            padding: '15px',
            background: '#f39c12',
            color: '#0d1b2a',
            borderRadius: '10px',
            fontWeight: '700',
            fontSize: '16px',
            marginTop: '4px'
          }}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p style={{ color: '#a0aec0', textAlign: 'center', marginTop: '24px', fontSize: '14px' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#f39c12', fontWeight: 'bold' }}>Login</Link>
        </p>
      </div>
    </div>
  );
}
