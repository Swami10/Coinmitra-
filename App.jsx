import Register from "./Register.jsx";
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { auth, db } from "./firebase.js";
import { doc, onSnapshot, runTransaction, serverTimestamp } from "firebase/firestore";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut, sendPasswordResetEmail } from "firebase/auth";
import { 
  Coins, Award, BookOpen, Gamepad2, CheckSquare, Wallet as WalletIcon, History, 
  ShieldCheck, Users, Info, Phone, FileText, Lock, CheckCircle, Clock, 
  ArrowRight, Menu, X, UserCheck, Sparkles, TrendingUp, Gift
} from 'lucide-react';

const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

// --- COMPONENTS ---

const Navbar = ({ user, coinBalance }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navLinks = (<>
    <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
    <Link to="/quiz" onClick={() => setMobileMenuOpen(false)}>Quiz</Link>
    <Link to="/wallet" onClick={() => setMobileMenuOpen(false)}>Wallet</Link>
    <Link to="/admin" className="admin-link" onClick={() => setMobileMenuOpen(false)}>Admin</Link>
    {user.email ? <button className="logout-link" onClick={() => { setMobileMenuOpen(false); signOut(auth); }}>Logout</button> : <Link to="/login" className="login-link" onClick={() => setMobileMenuOpen(false)}>Login</Link>}
  </>);
  return (
    <nav className="main-navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          <div className="brand-icon"><Coins size={24} color="#0d1b2a" /></div>
          <div><span className="brand-name">Coin<span>Mitra</span></span><div className="brand-tagline">EARN • LEARN • PLAY</div></div>
        </Link>
        <div className="navbar-actions">
          <div className="coin-balance"><Sparkles size={16} color="#f39c12" /><span>{coinBalance.toLocaleString()} Coins</span><span className="demo-tag">DEMO</span></div>
          <div className="desktop-nav">{navLinks}</div>
          <button className="mobile-menu-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle menu">{mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}</button>
        </div>
      </div>
      {mobileMenuOpen && <div className="mobile-nav">{navLinks}</div>}
    </nav>
  );
};
const Footer = () => (
  <footer style={{ background: '#070f1a', borderTop: '1px solid #1b263b', padding: '40px 20px 20px', marginTop: '60px', color: '#a0aec0' }}>
    <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '30px', marginBottom: '30px' }}>
      <div>
        <h3 style={{ color: '#ffffff', marginBottom: '15px' }}>CoinMitra</h3>
        <p style={{ fontSize: '14px', lineHeight: '1.6' }}>India's premier rewards platform empowering users to learn financial literacy, play brain games, and earn demo rewards safely.</p>
        <div style={{ marginTop: '15px', fontSize: '12px', color: '#f39c12', background: '#1b263b', padding: '8px', borderRadius: '6px', display: 'inline-block' }}>
          ⚠️ 1000 Demo Coins = ₹10 Illustrative Value (DEMO MODE)
        </div>
      </div>
      <div>
        <h4 style={{ color: '#ffffff', marginBottom: '15px' }}>Legal & Company</h4>
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' }}>
          <li><Link to="/about" style={{ color: '#a0aec0' }}>About Us</Link></li>
          <li><Link to="/contact" style={{ color: '#a0aec0' }}>Contact Support</Link></li>
          <li><Link to="/privacy" style={{ color: '#a0aec0' }}>Privacy Policy</Link></li>
          <li><Link to="/terms" style={{ color: '#a0aec0' }}>Terms & Conditions</Link></li>
        </ul>
      </div>
    </div>
    <div style={{ textAlign: 'center', borderTop: '1px solid #1b263b', paddingTop: '20px', fontSize: '13px' }}>
      © 2026 CoinMitra India. All rights reserved. Designed for Android & Web.
    </div>
  </footer>
);

// --- PAGES ---


const Home = ({ addCoins }) => {
  const navigate = useNavigate();
  return (
    <div className="coin-home">
      <section className="coin-hero">
        <div className="hero-copy">
          <span className="hero-badge">🏆 India's Rewards Platform</span>
          <h1>Earn • Learn • Play • <span>Reward</span></h1>
          <p>Participate in daily quizzes, complete sponsored tasks, watch educational videos and explore exciting demo rewards.</p>
          <div className="hero-buttons">
            <button onClick={() => navigate('/dashboard')}>Get Started Free <ArrowRight size={19}/></button>
            <button className="quiz-button" onClick={() => navigate('/quiz')}>Play Daily Quiz</button>
          </div>
          <div className="hero-trust">🔒 Safe • Secure • Transparent Demo Platform</div>
        </div>

        <div className="hero-art">
          <div className="art-glow"></div>
          <div className="float-coin coin-one">C</div>
          <div className="float-coin coin-two">C</div>
          <div className="float-coin coin-three">₹</div>
          <div className="reward-gift"><div className="gift-ribbon"></div><div className="gift-bow">✦</div></div>
          <div className="art-wallet"><div className="wallet-symbol">C</div><strong>CoinMitra</strong><small>REWARD WALLET</small><div className="wallet-line"></div><span>Earn • Learn • Play</span></div>
          <div className="art-sparkle sparkle-one">✦</div>
          <div className="art-sparkle sparkle-two">✧</div>
          <div className="art-sparkle sparkle-three">✦</div>
        </div>
      </section>

      <div className="coin-demo-note">⚠️ 1000 Demo Coins = ₹10 Illustrative Value — DEMO MODE ONLY</div>

      <div className="coin-feature-grid">
        {[
          { icon: <CheckSquare size={32} color="#f39c12" />, title: "Daily Check-in", desc: "Claim streak bonuses every 24 hours without duplication." },
          { icon: <Gamepad2 size={32} color="#f39c12" />, title: "Quizzes & Games", desc: "Test your knowledge on general awareness and digital safety." },
          { icon: <BookOpen size={32} color="#f39c12" />, title: "Educational Videos", desc: "Learn financial literacy and explore educational content." },
          { icon: <WalletIcon size={32} color="#f39c12" />, title: "Demo Coin Wallet", desc: "Track your demo coin balance and activity." }
        ].map((item, idx) => (
          <div key={idx} className="coin-feature-card">
            <div className="feature-icon">{item.icon}</div>
            <h3>{item.title}</h3>
            <p>{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const Dashboard = ({ user, coinBalance, setCoinBalance, adPoints }) => {
  const [checkedIn, setCheckedIn] = useState(false);
  const todayKey = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit'
  }).format(new Date());

  useEffect(() => {
    const checkStatus = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) return;
      try {
        const claimRef = doc(db, 'dailyClaims', currentUser.uid);
        const legacyRef = doc(db, 'dailyClaims', currentUser.uid + '_' + todayKey);
        const { getDoc } = await import('firebase/firestore');
        const [snap, legacySnap] = await Promise.all([getDoc(claimRef), getDoc(legacyRef)]);
        if (legacySnap.exists()) {
          setCheckedIn(true);
          return;
        }
        if (snap.exists()) {
          const claimedAt = snap.data().claimedAt?.toDate?.();
          if (claimedAt && Date.now() - claimedAt.getTime() < 24 * 60 * 60 * 1000) {
            setCheckedIn(true);
          }
        }
      } catch (error) {
        console.error('Check-in status error:', error);
      }
    };
    checkStatus();
  }, [user]);

  const handleDailyCheckin = async () => {
    if (checkedIn) return;
    const currentUser = auth.currentUser;
    if (!currentUser) {
      alert('Please login first.');
      return;
    }

    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const claimRef = doc(db, 'dailyClaims', currentUser.uid);
      const legacyRef = doc(db, 'dailyClaims', currentUser.uid + '_' + todayKey);

      await runTransaction(db, async (transaction) => {
        const userSnap = await transaction.get(userRef);
        const claimSnap = await transaction.get(claimRef);
        const legacySnap = await transaction.get(legacyRef);

        if (legacySnap.exists()) throw new Error('You have already claimed today\'s bonus.');
        if (!userSnap.exists()) throw new Error('User account not found.');

        if (claimSnap.exists()) {
          const previous = claimSnap.data().claimedAt?.toDate?.();
          if (previous && Date.now() - previous.getTime() < 24 * 60 * 60 * 1000) {
            throw new Error('You have already claimed your daily bonus.');
          }
        }

        const balance = Number(userSnap.data().coinBalance) || 0;
        transaction.update(userRef, { coinBalance: balance + 2 });
        transaction.set(claimRef, {
          userId: currentUser.uid,
          points: 2,
          claimedAt: serverTimestamp()
        });
      });

      setCheckedIn(true);
      alert('Daily Check-in successful! +2 Points added.');
    } catch (error) {
      alert(error.message || 'Check-in failed. Please try again.');
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h2 style={{ fontSize: '28px', color: '#ffffff' }}>Welcome back, {user.name}! 👋</h2>
          <p style={{ color: '#a0aec0' }}>Here is your activity summary and quick access portal.</p>
        </div>
        <div style={{ background: '#1b263b', border: '1px solid #f39c12', padding: '12px 24px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div>
            <div style={{ fontSize: '12px', color: '#a0aec0' }}>Available Balance</div>
            <div style={{ fontSize: '20px', fontWeight: '800', color: '#f39c12' }}>{coinBalance.toLocaleString()} Coins</div>
          </div>
          <div style={{ color: "#38d9a9", fontWeight: "700", fontSize: "14px" }}>Ad Points: {adPoints.toLocaleString()}</div>
          <Link to="/wallet" style={{ background: '#f39c12', color: '#0d1b2a', padding: '8px 14px', borderRadius: '8px', fontWeight: '700', fontSize: '13px' }}>Redeem</Link>
        </div>
      </div>

      <div style={{ background: 'linear-gradient(135deg, #27374d, #1b263b)', borderRadius: '16px', padding: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', flexWrap: 'wrap', gap: '20px', border: '1px solid #415a77' }}>
        <div>
          <h3 style={{ color: '#ffffff', fontSize: '20px', marginBottom: '8px' }}>Daily Streak Check-in</h3>
          <p style={{ color: '#a0aec0', fontSize: '14px' }}>Claim your daily bonus coins instantly. Avoid duplicate claims.</p>
        </div>
        <button onClick={handleDailyCheckin} style={{ background: checkedIn ? '#415a77' : '#f39c12', color: checkedIn ? '#ffffff' : '#0d1b2a', padding: '12px 24px', borderRadius: '10px', fontWeight: '700', fontSize: '15px' }}>
          {checkedIn ? 'Checked In Today ✅' : 'Claim Daily +2 Points 🪙'}
        </button>
      </div>

      <h3 style={{ color: '#ffffff', marginBottom: '20px' }}>Explore Activities</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        {[
          { title: 'Quiz & Brain Games', desc: 'Answer questions & earn up to 500 coins', link: '/quiz', icon: <Gamepad2 color="#f39c12" /> },
          { title: 'Sponsored Tasks', desc: 'Complete app installs & offers', link: '/tasks', icon: <CheckSquare color="#f39c12" /> },
          { title: 'Educational Videos', desc: 'Watch & learn financial literacy', link: '/videos', icon: <BookOpen color="#f39c12" /> },
          { title: 'Watch & Earn', desc: 'Watch optional rewarded ads and earn eligible Points', link: '/watch-earn', icon: <Gift color="#f39c12" /> },
          { title: 'Reward Requests', desc: 'Convert demo coins to gift cards', link: '/rewards', icon: <Gift color="#f39c12" /> }
        ].map((card, idx) => (
          <Link key={idx} to={card.link} style={{ background: '#1b263b', border: '1px solid #27374d', borderRadius: '16px', padding: '25px', display: 'flex', flexDirection: 'column', gap: '15px', textDecoration: 'none', transition: 'transform 0.2s' }}>
            <div style={{ background: '#0d1b2a', width: '45px', height: '45px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {card.icon}
            </div>
            <div>
              <h4 style={{ color: '#ffffff', fontSize: '18px', marginBottom: '5px' }}>{card.title}</h4>
              <p style={{ color: '#a0aec0', fontSize: '13px' }}>{card.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

const Quiz = ({ setCoinBalance }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  const questions = [
    { q: "What does UPI stand for in Indian digital payments?", options: ["Unified Payment Interface", "Universal Personal Income", "United Payment Institution", "Union Payment India"], correct: 0 },
    { q: "Which of the following is safest when receiving a UPI payment?", options: ["Sharing your UPI PIN", "Entering your UPI PIN", "Scanning a QR code without entering PIN", "Sharing your ATM card number"], correct: 2 },
    { q: "What is the recommended emergency fund savings duration?", options: ["1 week", "1 month", "3 to 6 months of expenses", "10 years"], correct: 2 },
    { q: "Which institution regulates banking and currency in India?", options: ["SEBI", "RBI", "IRDAI", "NABARD"], correct: 1 }
  ];

  const handleAnswer = (optionIndex) => {
    if (optionIndex === questions[currentQuestion].correct) {
      setScore(prev => prev + 1);
    }
    const nextQ = currentQuestion + 1;
    if (nextQ < questions.length) {
      setCurrentQuestion(nextQ);
    } else {
      setQuizFinished(true);
      const earned = (score + (optionIndex === questions[currentQuestion].correct ? 1 : 0)) * 100;
      setCoinBalance(prev => prev + earned);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '20px' }}>
      <div style={{ background: '#1b263b', border: '1px solid #27374d', borderRadius: '20px', padding: '40px' }}>
        <h2 style={{ color: '#ffffff', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Gamepad2 color="#f39c12" /> Daily Knowledge & Safety Quiz
        </h2>
        <p style={{ color: '#a0aec0', marginBottom: '30px' }}>Test your financial literacy and win up to 400 Demo Coins.</p>

        {!quizFinished ? (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#a0aec0', marginBottom: '15px', fontSize: '14px' }}>
              <span>Question {currentQuestion + 1} of {questions.length}</span>
              <span>Score: {score}</span>
            </div>
            <h3 style={{ color: '#ffffff', fontSize: '20px', marginBottom: '25px', lineHeight: '1.5' }}>
              {questions[currentQuestion].q}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {questions[currentQuestion].options.map((opt, idx) => (
                <button key={idx} onClick={() => handleAnswer(idx)} style={{ background: '#27374d', color: '#ffffff', padding: '16px 20px', borderRadius: '12px', textAlign: 'left', fontWeight: '600', fontSize: '15px', border: '1px solid #415a77', transition: 'background 0.2s' }}>
                  {opt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: '48px', marginBottom: '15px' }}>🏆</div>
            <h3 style={{ color: '#ffffff', fontSize: '24px', marginBottom: '10px' }}>Quiz Completed Successfully!</h3>
            <p style={{ color: '#a0aec0', fontSize: '16px', marginBottom: '20px' }}>You scored {score} out of {questions.length} correct.</p>
            <div style={{ background: '#0d1b2a', padding: '15px', borderRadius: '12px', display: 'inline-block', color: '#f39c12', fontWeight: '700', fontSize: '18px', marginBottom: '30px', border: '1px solid #f39c12' }}>
              +{score * 100} Demo Coins Credited to Wallet!
            </div>
            <div>
              <button onClick={() => { setCurrentQuestion(0); setScore(0); setQuizFinished(false); }} style={{ background: '#f39c12', color: '#0d1b2a', padding: '12px 24px', borderRadius: '10px', fontWeight: '700' }}>
                Play Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const Tasks = ({ setCoinBalance }) => {
  const [tasksList, setTasksList] = useState([
    { id: 't1', title: 'Install Partner Shopping App', reward: 500, status: 'Active', category: 'Sponsored', description: 'Download and register with mobile OTP.' },
    { id: 't2', title: 'Complete UPI Security Quiz', reward: 250, status: 'Active', category: 'Quiz', description: 'Answer 5 questions correctly about digital safety.' },
    { id: 't3', title: 'Watch Financial Literacy Video', reward: 150, status: 'Active', category: 'Education', description: 'Watch full 3 minutes video on Mutual Funds basics.' }
  ]);

  const handleCompleteTask = (task) => {
    setCoinBalance(prev => prev + task.reward);
    alert(`Task completed! +${task.reward} Demo Coins added.`);
    setTasksList(prev => prev.filter(t => t.id !== task.id));
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '20px' }}>
      <h2 style={{ color: '#ffffff', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <CheckSquare color="#f39c12" /> Sponsored Tasks & Offers
      </h2>
      <p style={{ color: '#a0aec0', marginBottom: '30px' }}>Complete verified tasks and partner offers to earn instant demo coins.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {tasksList.map(task => (
          <div key={task.id} style={{ background: '#1b263b', border: '1px solid #27374d', borderRadius: '16px', padding: '25px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '20px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ background: '#27374d', color: '#f39c12', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '700' }}>{task.category}</span>
                <span style={{ color: '#f39c12', fontWeight: '800', fontSize: '16px' }}>+{task.reward} Coins</span>
              </div>
              <h3 style={{ color: '#ffffff', fontSize: '18px', marginBottom: '8px' }}>{task.title}</h3>
              <p style={{ color: '#a0aec0', fontSize: '14px', lineHeight: '1.5' }}>{task.description}</p>
            </div>
            <button onClick={() => handleCompleteTask(task)} style={{ background: '#f39c12', color: '#0d1b2a', padding: '12px', borderRadius: '10px', fontWeight: '700', width: '100%' }}>
              Complete Task & Earn
            </button>
          </div>
        ))}
        {tasksList.length === 0 && (
          <div style={{ color: '#a0aec0', gridColumn: '1 / -1', textAlign: 'center', padding: '40px' }}>
            All available tasks completed for today! Check back tomorrow for new offers.
          </div>
        )}
      </div>
    </div>
  );
};

const WatchEarn = () => (
  <div style={{ maxWidth: "900px", margin: "40px auto", padding: "20px" }}>
    <div style={{ background: "#1b263b", border: "1px solid #27374d", borderRadius: "20px", padding: "30px" }}>
      <h2 style={{ color: "#ffffff", marginBottom: "15px" }}>Watch & Earn</h2>
      <p style={{ color: "#a0aec0", lineHeight: "1.7" }}>Watch optional rewarded advertisements and learn about useful products and services.</p>
      <div style={{ background: "#0d1b2a", borderRadius: "12px", padding: "20px", marginTop: "20px" }}>
        <h3 style={{ color: "#f39c12" }}>Rewarded Ads Coming Soon</h3>
        <p style={{ color: "#a0aec0", marginTop: "10px" }}>This feature will become available after official ad integration and verification.</p>
      </div>
      <p style={{ color: "#a0aec0", marginTop: "20px", fontSize: "13px" }}>No advertisement is available yet. No Points are awarded on this page currently.</p>
    </div>
  </div>
);

const Wallet = ({ coinBalance }) => {
  const inrValue = (coinBalance / 1000) * 10;

  return (
    <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '20px' }}>
      <h2 style={{ color: '#ffffff', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <WalletIcon color="#f39c12" /> My Coin Wallet
      </h2>
      <p style={{ color: '#a0aec0', marginBottom: '30px' }}>Monitor your demo coin earnings, valuation, and ledger history.</p>

      <div style={{ background: 'linear-gradient(135deg, #1b263b, #0d1b2a)', border: '1px solid #f39c12', borderRadius: '20px', padding: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <div style={{ fontSize: '14px', color: '#a0aec0', marginBottom: '5px' }}>Current Demo Coin Balance</div>
          <div style={{ fontSize: '36px', fontWeight: '800', color: '#f39c12' }}>{coinBalance.toLocaleString()} Coins</div>
          <div style={{ fontSize: '13px', color: '#a0aec0', marginTop: '5px' }}>Illustrative Reward Value: ₹{inrValue.toFixed(2)} (DEMO)</div>
        </div>
        <Link to="/rewards" style={{ background: '#f39c12', color: '#0d1b2a', padding: '14px 28px', borderRadius: '12px', fontWeight: '700', fontSize: '16px', textDecoration: 'none' }}>
          Request Reward Payout
        </Link>
      </div>

      <h3 style={{ color: '#ffffff', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <History size={20} color="#f39c12" /> Transaction History
      </h3>
      <div style={{ background: '#1b263b', border: '1px solid #27374d', borderRadius: '16px', overflow: 'hidden' }}>
        {[
          { title: 'Daily Quiz Bonus', date: '2026-11-18', amount: '+300 Coins', type: 'Credit' },
          { title: 'Daily Check-in Bonus', date: '2026-11-18', amount: '+100 Coins', type: 'Credit' },
          { title: 'Sponsored Task: UPI Security', date: '2026-11-17', amount: '+250 Coins', type: 'Credit' },
          { title: 'Reward Request (Amazon Gift Voucher)', date: '2026-11-16', amount: '-5,000 Coins', type: 'Debit (Pending)' }
        ].map((tx, idx) => (
          <div key={idx} style={{ padding: '20px', borderBottom: idx < 3 ? '1px solid #27374d' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <div style={{ color: '#ffffff', fontWeight: '600', fontSize: '15px' }}>{tx.title}</div>
              <div style={{ color: '#a0aec0', fontSize: '13px' }}>{tx.date}</div>
            </div>
            <div style={{ fontWeight: '700', color: tx.type === 'Credit' ? '#2ecc71' : '#f39c12' }}>
              {tx.amount}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const RewardRequests = ({ coinBalance, setCoinBalance }) => {
  const [requested, setRequested] = useState(false);

  const handleRequest = (e) => {
    e.preventDefault();
    if (coinBalance < 5000) {
      alert("Minimum 5,000 Demo Coins required for reward request.");
      return;
    }
    setCoinBalance(prev => prev - 5000);
    setRequested(true);
    alert("🎉 Reward request submitted successfully! Pending admin review.");
  };

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '20px' }}>
      <h2 style={{ color: '#ffffff', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Gift color="#f39c12" /> Reward Requests
      </h2>
      <p style={{ color: '#a0aec0', marginBottom: '30px' }}>Convert your demo coins into gift cards or vouchers. Subject to admin approval.</p>

      <div style={{ background: '#1b263b', border: '1px solid #27374d', borderRadius: '20px', padding: '40px' }}>
        <form onSubmit={handleRequest} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', color: '#a0aec0', marginBottom: '8px', fontSize: '14px' }}>Select Reward Type</label>
            <select style={{ width: '100%', padding: '14px', background: '#0d1b2a', border: '1px solid #415a77', borderRadius: '10px', color: '#ffffff', fontSize: '15px' }}>
              <option>Amazon Pay Gift Card (₹50 / 5,000 Coins)</option>
              <option>Flipkart E-Gift Voucher (₹50 / 5,000 Coins)</option>
              <option>UPI Digital Coupon (₹50 / 5,000 Coins) - DEMO</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', color: '#a0aec0', marginBottom: '8px', fontSize: '14px' }}>Registered UPI ID / Mobile Number</label>
            <input type="text" placeholder="e.g. rahul@okaxis" required style={{ width: '100%', padding: '14px', background: '#0d1b2a', border: '1px solid #415a77', borderRadius: '10px', color: '#ffffff', fontSize: '15px' }} />
          </div>
          <div style={{ background: '#0d1b2a', padding: '15px', borderRadius: '10px', fontSize: '13px', color: '#f39c12', border: '1px solid #f39c12' }}>
            ℹ️ Note: 1000 Demo Coins = ₹10 illustrative value. All payouts are processed in DEMO mode only until real revenue systems are approved.
          </div>
          <button type="submit" style={{ background: '#f39c12', color: '#0d1b2a', padding: '14px', borderRadius: '10px', fontWeight: '700', fontSize: '16px' }}>
            Submit Reward Request (5,000 Coins)
          </button>
        </form>
        {requested && (
          <div style={{ marginTop: '20px', background: '#27374d', padding: '15px', borderRadius: '10px', color: '#2ecc71', textAlign: 'center', fontWeight: '600' }}>
            Request submitted! Status: Pending Admin Approval.
          </div>
        )}
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const [tasks, setTasks] = useState([
    { id: 't1', title: 'Install Partner Shopping App', reward: 500, status: 'Active' },
    { id: 't2', title: 'Complete UPI Security Quiz', reward: 250, status: 'Active' },
    { id: 't4', title: 'Product Feedback Survey', reward: 300, status: 'Pending Review' }
  ]);

  const [requests, setRequests] = useState([
    { id: 'req1', user: 'Rahul Sharma', amount: '5,000 Coins (₹50)', status: 'Pending' }
  ]);

  const handleApproveRequest = (id) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'Approved ✅' } : r));
    alert("Reward request approved successfully!");
  };

  const handleToggleTask = (id) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: t.status === 'Active' ? 'Disabled' : 'Active' } : t));
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h2 style={{ color: '#ffffff', fontSize: '26px' }}>👑 Admin Management Dashboard</h2>
          <p style={{ color: '#a0aec0' }}>Manage tasks, review reward payout requests, and oversee platform integrity.</p>
        </div>
        <span style={{ background: '#f39c12', color: '#0d1b2a', padding: '6px 14px', borderRadius: '8px', fontWeight: '700', fontSize: '13px' }}>Administrator Access</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', flexWrap: 'wrap' }}>
        <div style={{ background: '#1b263b', border: '1px solid #27374d', borderRadius: '16px', padding: '25px' }}>
          <h3 style={{ color: '#ffffff', marginBottom: '20px' }}>Task Management</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {tasks.map(t => (
              <div key={t.id} style={{ background: '#0d1b2a', padding: '15px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ color: '#ffffff', fontWeight: '600' }}>{t.title}</div>
                  <div style={{ color: '#f39c12', fontSize: '13px' }}>+{t.reward} Coins • {t.status}</div>
                </div>
                <button onClick={() => handleToggleTask(t.id)} style={{ background: t.status === 'Active' ? '#e74c3c' : '#2ecc71', color: '#ffffff', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '700' }}>
                  {t.status === 'Active' ? 'Disable' : 'Enable'}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: '#1b263b', border: '1px solid #27374d', borderRadius: '16px', padding: '25px' }}>
          <h3 style={{ color: '#ffffff', marginBottom: '20px' }}>Pending Reward Payout Requests</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {requests.map(r => (
              <div key={r.id} style={{ background: '#0d1b2a', padding: '15px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ color: '#ffffff', fontWeight: '600' }}>{r.user}</div>
                  <div style={{ color: '#a0aec0', fontSize: '13px' }}>{r.amount} • <span style={{ color: '#f39c12' }}>{r.status}</span></div>
                </div>
                {r.status === 'Pending' ? (
                  <button onClick={() => handleApproveRequest(r.id)} style={{ background: '#2ecc71', color: '#0d1b2a', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '700' }}>
                    Approve
                  </button>
                ) : (
                  <span style={{ color: '#2ecc71', fontSize: '13px', fontWeight: '700' }}>Processed</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Login failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '450px', margin: '80px auto', padding: '20px' }}>
      <div style={{ background: '#1b263b', borderRadius: '20px', padding: '40px' }}>
        <h2 style={{ color: '#fff', textAlign: 'center' }}>Login to CoinMitra</h2>
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <input type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} required style={{ padding: '14px' }} />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required style={{ padding: '14px' }} />
          <button type="button" onClick={async () => { if (!email) { alert("Please enter your email address first."); return; } try { await sendPasswordResetEmail(auth, email); alert("Password reset link sent to your email."); } catch (err) { alert(err.message); } }} style={{ background: "transparent", color: "#f39c12", padding: "8px", cursor: "pointer" }}>Forgot Password?</button>
          {error && <p style={{ color: '#ff7777' }}>{error}</p>}
          <button type="submit" disabled={loading} style={{ padding: '14px', background: '#f39c12', borderRadius: '10px', fontWeight: 'bold' }}>
            {loading ? 'Please wait...' : 'Login'}
          </button>
        </form>
        <p style={{ color: '#fff', marginTop: '20px', textAlign: 'center' }}>
          New user? <Link to="/register" style={{ color: '#f39c12' }}>Create New Account</Link>
        </p>
      </div>
    </div>
  );
};

const StaticPage = ({ title, content }) => (
  <div style={{ maxWidth: '800px', margin: '40px auto', padding: '20px' }}>
    <div style={{ background: '#1b263b', border: '1px solid #27374d', borderRadius: '20px', padding: '40px' }}>
      <h2 style={{ color: '#ffffff', marginBottom: '20px' }}>{title}</h2>
      <p style={{ color: '#a0aec0', lineHeight: '1.7', fontSize: '15px' }}>{content}</p>
    </div>
  </div>
);


const PrivacyPolicy = () => (
  <div style={{ maxWidth: '900px', margin: '40px auto', padding: '20px', color: '#dbe4f0' }}>
    <div style={{ background: '#1b263b', border: '1px solid #27374d', borderRadius: '16px', padding: '28px', lineHeight: '1.8' }}>
      <h1 style={{ color: '#ffffff' }}>Privacy Policy</h1>
      <p>Last Updated: November 21, 2026</p>

      <p>CoinMitra respects your privacy. This policy explains how information may be collected and used when you visit our website.</p>

      <h3>1. Information We Collect</h3>
      <p>Depending on the features you use, we may collect information you provide, such as your name, email address and account details. Technical information such as browser type, device information, IP address and pages visited may also be collected.</p>

      <h3>2. How We Use Information</h3>
      <p>We may use information to operate the website, manage accounts and demo coin balances, respond to support requests, improve services, maintain security and prevent misuse.</p>

      <h3>3. Cookies</h3>
      <p>Our website and third-party services may use cookies or similar technologies for website functionality, preferences, analytics and advertising. You can manage cookies through your browser settings.</p>

      <h3>4. Google AdSense and Advertising</h3>
      <p>Our website may display advertisements from Google AdSense and other advertising partners. These providers may use cookies or similar technologies to serve and measure advertisements. Ad personalization may depend on your location and consent choices.</p>
      <p>Learn more: <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer" style={{ color: '#60a5fa' }}>Google Advertising Policies</a>.</p>
      <p>Manage ad preferences: <a href="https://myadcenter.google.com/" target="_blank" rel="noopener noreferrer" style={{ color: '#60a5fa' }}>Google My Ad Center</a>.</p>

      <h3>5. Third-Party Services</h3>
      <p>We may use third-party providers for hosting, authentication, security, analytics or advertising. Their handling of information is governed by their own policies.</p>

      <h3>6. Sharing of Information</h3>
      <p>We do not sell personal information. Information may be shared with service providers when necessary to operate the website, comply with law or protect users and our services.</p>

      <h3>7. Data Security and Retention</h3>
      <p>We take reasonable steps to protect information. No online storage or transmission method is completely secure. Information is retained as reasonably necessary for its intended purpose or as required by law.</p>

      <h3>8. Your Choices and Rights</h3>
      <p>Subject to applicable law, you may request access to, correction of or deletion of personal information you provided. Contact us through the Contact Us page for privacy requests.</p>

      <h3>9. Children's Privacy</h3>
      <p>CoinMitra is intended for adults and is not designed for children under 18. If you believe a child has provided personal information, please contact us.</p>

      <h3>10. Changes to This Policy</h3>
      <p>We may update this policy from time to time. Changes will be published on this page with a revised date.</p>

      <h3>11. Contact Us</h3>
      <p>For questions about this policy or your personal information, please use the Contact Us page on CoinMitra.</p>
    </div>
  </div>
);


const TermsConditions = () => (
  <div style={{ maxWidth: '900px', margin: '40px auto', padding: '20px', color: '#dbe4f0' }}>
    <div style={{ background: '#1b263b', border: '1px solid #27374d', borderRadius: '16px', padding: '28px', lineHeight: '1.8' }}>
      <h1 style={{ color: '#ffffff' }}>Terms & Conditions</h1>
      <p>Last Updated: November 21, 2026</p>

      <p>Welcome to CoinMitra. These Terms & Conditions explain the rules for accessing and using our website. By using CoinMitra, you agree to these terms.</p>

      <h3>1. About CoinMitra</h3>
      <p>CoinMitra is an online platform offering educational, recreational and engagement-based activities. Features may include quizzes, daily check-ins and demo reward points.</p>

      <h3>2. Eligibility and User Accounts</h3>
      <p>CoinMitra is intended for users aged 18 years or older. You agree to provide accurate information when creating an account and to keep your login credentials secure. You are responsible for activity carried out through your account.</p>

      <h3>3. Demo Coins and Illustrative Value</h3>
      <p>Coins and balances currently displayed on CoinMitra are demo or illustrative points only. Any displayed conversion, including 1000 Demo Coins = ₹10, is an example for demonstration purposes only.</p>
      <p>Demo Coins are not money, deposits, investments or cryptocurrency. They have no guaranteed monetary value and cannot currently be exchanged for cash, goods or services.</p>

      <h3>4. Rewards and Withdrawals</h3>
      <p>CoinMitra does not currently promise cash payments, withdrawals, prizes or other real-world rewards in exchange for demo coins. Any future reward or redemption program will require a separate official announcement and applicable terms. Do not make financial decisions based on demo balances.</p>

      <h3>5. Acceptable Use</h3>
      <p>You agree not to misuse the website, manipulate quizzes or reward features, use bots or unauthorized tools, interfere with website operations, attempt unauthorized access, or engage in unlawful, fraudulent or abusive activity.</p>

      <h3>6. Fair Use and Account Restrictions</h3>
      <p>Where we reasonably believe that an account is being used in violation of these terms or applicable law, we may investigate and take appropriate action, including restricting or suspending access, subject to applicable law.</p>

      <h3>7. Website Availability and Changes</h3>
      <p>We may update, modify, suspend or discontinue website features, activities, content or demo points. We aim to keep the website available but do not guarantee uninterrupted or error-free access.</p>

      <h3>8. Intellectual Property</h3>
      <p>Website design, branding, text, graphics and original materials are owned by CoinMitra or their respective rights holders. You may not reproduce, distribute or commercially use protected materials without permission, except where permitted by law.</p>

      <h3>9. Third-Party Services and Links</h3>
      <p>The website may contain links to third-party websites or use third-party services. These services are governed by their own terms and privacy policies. CoinMitra is not responsible for independent third-party content or services.</p>

      <h3>10. Disclaimer and Limitation</h3>
      <p>The website and its demo features are provided on an as-available basis. To the extent permitted by law, CoinMitra does not guarantee that every feature will always be available, accurate or suitable for every purpose. Nothing in these terms excludes rights or remedies that cannot legally be excluded.</p>

      <h3>11. Privacy</h3>
      <p>Your use of CoinMitra is also subject to our Privacy Policy, which explains how information may be collected and used.</p>

      <h3>12. Changes to These Terms</h3>
      <p>We may revise these Terms & Conditions from time to time. Updated terms will be published on this page with a revised date. Please review this page periodically.</p>

      <h3>13. Contact Us</h3>
      <p>If you have questions about these terms, please contact us through the Contact Us page on CoinMitra.</p>

      <p style={{ marginTop: '28px', color: '#9ca3af' }}>Thank you for using CoinMitra.</p>
    </div>
  </div>
);


const AboutUs = () => (
  <div style={{ maxWidth: '900px', margin: '40px auto', padding: '20px', color: '#dbe4f0' }}>
    <div style={{ background: '#1b263b', border: '1px solid #27374d', borderRadius: '16px', padding: '28px', lineHeight: '1.8' }}>
      <h1 style={{ color: '#ffffff' }}>About CoinMitra</h1>
      <p>Welcome to CoinMitra, an online platform designed to make learning and everyday engagement more enjoyable.</p>

      <h3>Our Purpose</h3>
      <p>Our aim is to provide a simple and accessible platform where users can explore educational and recreational activities, test their knowledge and participate in interactive experiences.</p>

      <h3>What We Offer</h3>
      <ul>
        <li>Educational quizzes and knowledge activities.</li>
        <li>Daily check-in features.</li>
        <li>Interactive activities and brain challenges.</li>
        <li>Demo coin points to illustrate platform features.</li>
      </ul>

      <h3>Our Commitment</h3>
      <p>We aim to make CoinMitra easy to use, transparent about its features and respectful of user privacy. Demo coins are currently illustrative points and do not represent real money or guaranteed rewards.</p>

      <h3>Our Approach</h3>
      <p>We continue to improve the platform and its features based on usability, clarity and user feedback.</p>

      <p>Thank you for being a part of CoinMitra.</p>
    </div>
  </div>
);

const ContactUs = () => (
  <div style={{ maxWidth: '900px', margin: '40px auto', padding: '20px', color: '#dbe4f0' }}>
    <div style={{ background: '#1b263b', border: '1px solid #27374d', borderRadius: '16px', padding: '28px', lineHeight: '1.8' }}>
      <h1 style={{ color: '#ffffff' }}>Contact Us</h1>
      <p>We value your feedback and are happy to hear from you.</p>

      <h3>Customer Support</h3>
      <p>For questions, feedback, technical issues or privacy-related requests, contact us by email.</p>

      <p><strong>Email:</strong> <a href="mailto:supportcoinmitra@gmail.com" style={{ color: '#60a5fa' }}>supportcoinmitra@gmail.com</a></p>

      <h3>How to Contact Us</h3>
      <p>Please include a brief description of your question or issue in your email. Do not include your password, OTP or sensitive payment information.</p>

      <p>We will review your message and respond when possible.</p>
      <p>Thank you for contacting CoinMitra.</p>
    </div>
  </div>
);

// --- MAIN APP ---

function App() {
  const [user, setUser] = useState({ name: 'Guest', email: '' });
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({ name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Member', email: firebaseUser.email || '', uid: firebaseUser.uid });
      } else {
        setUser({ name: 'Guest', email: '', uid: null });
      }
    });
    return unsubscribe;
  }, []);
  const [coinBalance, setCoinBalance] = useState(0);
  const [adPoints, setAdPoints] = useState(0);

  useEffect(() => {
    if (!user.uid) {
      setCoinBalance(0);
      return;
    }
    const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (snapshot) => {
      if (snapshot.exists()) {
        setCoinBalance(Number(snapshot.data().coinBalance) || 0);
        setAdPoints(Number(snapshot.data().adPoints) || 0);
      } else {
        setCoinBalance(0);
      }
    }, (error) => {
      console.error('Coin balance read error:', error);
    });
    return unsubscribe;
  }, [user.uid]);

  return (
    <React.Fragment>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar user={user} coinBalance={coinBalance} />
        <div style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Home setCoinBalance={setCoinBalance} />} />
            <Route path="/dashboard" element={<Dashboard user={user} coinBalance={coinBalance} adPoints={adPoints} setCoinBalance={setCoinBalance} />} />
            <Route path="/quiz" element={<Quiz setCoinBalance={setCoinBalance} />} />
            <Route path="/tasks" element={<Tasks setCoinBalance={setCoinBalance} />} />
            <Route path="/wallet" element={<Wallet coinBalance={coinBalance} />} />
            <Route path="/rewards" element={<RewardRequests coinBalance={coinBalance} setCoinBalance={setCoinBalance} />} />
            <Route path="/watch-earn" element={<WatchEarn />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsConditions />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </React.Fragment>
  );
}

export default App;
