import Register from "./Register.jsx";
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
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
    <Link to="/games" onClick={() => setMobileMenuOpen(false)}>Games</Link>
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
          <li><Link to="/how-it-works" style={{ color: '#a0aec0' }}>How It Works</Link></li>
          <li><Link to="/faq" style={{ color: '#a0aec0' }}>FAQ</Link></li>
        </ul>
      </div>
    </div>
    <div style={{ textAlign: 'center', borderTop: '1px solid #1b263b', paddingTop: '20px', fontSize: '13px' }}>
      © 2026 CoinMitra India. All rights reserved. Designed for Android & Web.
    </div>
  </footer>
);


const HowItWorks = () => (
  <div style={{maxWidth:'900px',margin:'40px auto',padding:'25px',color:'#e0e1dd'}}>
    <h1 style={{color:'#f5b942',marginBottom:'12px'}}>How CoinMitra Works</h1>
    <p style={{lineHeight:'1.8',marginBottom:'25px'}}>CoinMitra is a demo rewards platform. Explore activities, learn and collect demo coins.</p>
    {[
      ['1. Create an Account','Register or log in to explore CoinMitra.'],
      ['2. Play Daily Quiz','Answer quiz questions and learn something new.'],
      ['3. Explore Activities','Discover available tasks and educational content.'],
      ['4. Check Your Wallet','View your demo coin balance and activity history.']
    ].map(([title,desc]) => (
      <div key={title} style={{background:'#1b263b',padding:'20px',borderRadius:'12px',marginBottom:'15px'}}>
        <h3 style={{color:'#f5b942',marginBottom:'8px'}}>{title}</h3>
        <p style={{lineHeight:'1.6'}}>{desc}</p>
      </div>
    ))}
    <p style={{fontSize:'13px',color:'#f5b942',marginTop:'20px'}}>Important: Demo Coins are illustrative only. They are not real money and have no guaranteed cash value.</p>
  </div>
);

const FAQ = () => (
  <div style={{maxWidth:'900px',margin:'40px auto',padding:'25px',color:'#e0e1dd'}}>
    <h1 style={{color:'#f5b942',marginBottom:'12px'}}>Frequently Asked Questions</h1>
    <p style={{lineHeight:'1.7',marginBottom:'25px'}}>Find answers to common questions about CoinMitra.</p>
    {[
      ['What is CoinMitra?','CoinMitra is a demo rewards platform where users can explore quizzes, activities and educational content.'],
      ['Are Demo Coins real money?','No. Demo Coins are illustrative points only. They cannot currently be exchanged for cash, goods or services.'],
      ['How can I earn Demo Coins?','You can explore available quizzes, daily check-in and other activities displayed on the website.'],
      ['Do I need to pay to join?','You can register and explore the available demo features without making a payment. Never pay anyone promising guaranteed rewards.'],
      ['Can I withdraw my Demo Coins?','No. Demo Coins do not currently have cash withdrawal or redemption value.'],
      ['How can I contact support?','Email us at supportcoinmitra@gmail.com for website-related questions. Never share your password or OTP.']
    ].map(([q,a]) => (
      <details key={q} style={{background:'#1b263b',padding:'18px',borderRadius:'10px',marginBottom:'12px'}}>
        <summary style={{cursor:'pointer',color:'#f5b942',fontWeight:'bold'}}>{q}</summary>
        <p style={{lineHeight:'1.7',marginTop:'12px'}}>{a}</p>
      </details>
    ))}
  </div>
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
          { icon: <Gamepad2 size={32} color="#f39c12" />, title: "Games", desc: "Enjoy Spin & Win, Coin Catcher and Mystery Box." },
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
      const token = await currentUser.getIdToken();
      const response = await fetch('/.netlify/functions/daily-checkin', {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + token }
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Check-in failed.');
      }

      setCheckedIn(true);
      alert('Daily Check-in successful! +2 Points added.');
    } catch (error) {
      if (error.message && error.message.includes('Already claimed')) {
        setCheckedIn(true);
      }
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
          { title: 'Games', desc: 'Play Spin & Win, Coin Catcher and Mystery Box', link: '/games', icon: <Gamepad2 color="#f39c12" /> },
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

const Games = () => {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [gameActive, setGameActive] = useState(false);
  const [finished, setFinished] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [score, setScore] = useState(0);
  const [basketPosition, setBasketPosition] = useState(50);
  const [coins, setCoins] = useState([]);

  const playGame = async (game) => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      setMessage('Please login to play games.');
      return;
    }

    setBusy(true);
    setMessage('Checking your play...');
    try {
      const token = await currentUser.getIdToken();
      const response = await fetch(
        API_BASE_URL + '/.netlify/functions/games',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token
          },
          body: JSON.stringify({ game })
        }
      );
      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || 'Daily play limit reached. Try tomorrow!');
      } else {
        setMessage(data.points > 0
          ? 'You won ' + data.points + ' Demo Points! Wallet will update automatically.'
          : 'No points this time. Try again tomorrow!');
      }
    } catch (error) {
      console.error('Game reward error:', error);
      setMessage('Could not connect. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const startCatcher = () => {
    if (busy || gameActive) return;
    if (!auth.currentUser) {
      setMessage('Please login to play games.');
      return;
    }
    setMessage('');
    setScore(0);
    setTimeLeft(30);
    setBasketPosition(50);
    setCoins([]);
    setFinished(false);
    setSubmitted(false);
    setGameActive(true);
  };

  const moveBasket = (direction) => {
    setBasketPosition((position) =>
      Math.max(8, Math.min(92, position + direction * 10))
    );
  };

  useEffect(() => {
    if (!gameActive) return;

    const interval = setInterval(() => {
      setCoins((previous) => {
        const next = previous.map((coin) => ({
          ...coin,
          y: coin.y + 11
        }));

        const caught = next.filter(
          (coin) =>
            coin.y >= 78 &&
            coin.y <= 96 &&
            Math.abs(coin.x - basketPosition) < 13
        ).length;

        if (caught > 0) setScore((value) => value + caught);

        const remaining = next.filter((coin) => coin.y < 100);
        remaining.push({
          id: Date.now() + Math.random(),
          x: 8 + Math.random() * 84,
          y: 0
        });
        return remaining;
      });
    }, 350);

    return () => clearInterval(interval);
  }, [gameActive, basketPosition]);

  useEffect(() => {
    if (!gameActive) return;
    if (timeLeft <= 0) {
      setGameActive(false);
      setFinished(true);
      return;
    }
    const timer = setTimeout(() => {
      setTimeLeft((value) => value - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [gameActive, timeLeft]);

  useEffect(() => {
    if (finished && !submitted) {
      setSubmitted(true);
      playGame('catcher');
    }
  }, [finished, submitted]);

  const cardStyle = {
    background: '#1b263b',
    border: '1px solid #33415c',
    borderRadius: '16px',
    padding: '22px',
    textAlign: 'center',
    color: '#fff'
  };

  const buttonStyle = {
    background: '#f39c12',
    color: '#111827',
    border: 'none',
    borderRadius: '10px',
    padding: '12px 20px',
    fontWeight: 'bold',
    cursor: 'pointer',
    width: '100%',
    marginTop: '14px'
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '35px 20px', color: '#fff' }}>
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <h1 style={{ color: '#f5b942' }}>CoinMitra Games</h1>
        <p>Play, enjoy and collect limited Demo Points!</p>
        <small style={{ color: '#aab7cf' }}>Daily limits apply. Demo Points have no cash value.</small>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '18px' }}>
        <div style={cardStyle}>
          <div style={{ fontSize: '42px' }}>🎡</div>
          <h2>Spin & Win</h2>
          <p>Try your luck with one spin every day.</p>
          <button style={buttonStyle} disabled={busy} onClick={() => playGame('spin')}>
            {busy ? 'Please wait...' : 'SPIN NOW'}
          </button>
        </div>

        <div style={cardStyle}>
          <div style={{ fontSize: '42px' }}>🪙</div>
          <h2>Coin Catcher</h2>
          <p>Catch falling coins with your basket in 30 seconds!</p>

          <div style={{
            position: 'relative',
            height: '230px',
            overflow: 'hidden',
            borderRadius: '12px',
            border: '1px solid #52627d',
            background: 'linear-gradient(180deg, #102b4e, #071426)',
            marginTop: '14px'
          }}>
            <div style={{
              position: 'absolute',
              top: '8px',
              left: '0',
              right: '0',
              display: 'flex',
              justifyContent: 'space-around',
              color: '#f5b942',
              fontWeight: 'bold',
              zIndex: 2
            }}>
              <span>Score: {score}</span>
              <span>Time: {timeLeft}s</span>
            </div>

            {coins.map((coin) => (
              <div key={coin.id} style={{
                position: 'absolute',
                left: coin.x + '%',
                top: coin.y + '%',
                transform: 'translateX(-50%)',
                fontSize: '25px'
              }}>🪙</div>
            ))}

            <div style={{
              position: 'absolute',
              left: basketPosition + '%',
              bottom: '8px',
              transform: 'translateX(-50%)',
              fontSize: '35px',
              transition: 'left 0.12s ease'
            }}>🧺</div>

            {!gameActive && (
              <div style={{
                position: 'absolute',
                inset: '0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                background: 'rgba(5,12,25,0.72)',
                gap: '8px'
              }}>
                <strong>{finished ? 'Time Up!' : 'Ready to Catch?'}</strong>
                <span style={{ fontSize: '13px' }}>
                  {finished ? 'Coins caught: ' + score : 'Move your basket to catch coins'}
                </span>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
            <button style={{ ...buttonStyle, marginTop: 0 }} disabled={!gameActive} onClick={() => moveBasket(-1)}>⬅ LEFT</button>
            <button style={{ ...buttonStyle, marginTop: 0 }} disabled={!gameActive} onClick={() => moveBasket(1)}>RIGHT ➡</button>
          </div>

          <button style={buttonStyle} disabled={busy || gameActive} onClick={startCatcher}>
            {gameActive ? 'GAME RUNNING...' : finished ? 'PLAY AGAIN' : 'START 30-SECOND GAME'}
          </button>
          <small style={{ color: '#aab7cf' }}>Maximum 3 rewarded plays per day</small>
        </div>

        <div style={cardStyle}>
          <div style={{ fontSize: '42px' }}>🎁</div>
          <h2>Mystery Box</h2>
          <p>Open one mystery box every day. What is inside?</p>
          <button style={buttonStyle} disabled={busy} onClick={() => playGame('mystery')}>
            {busy ? 'Please wait...' : 'OPEN BOX'}
          </button>
        </div>
      </div>

      {message && (
        <div style={{
          marginTop: '24px',
          padding: '16px',
          borderRadius: '12px',
          background: '#0d1b2a',
          border: '1px solid #f39c12',
          textAlign: 'center'
        }}>
          {message}
        </div>
      )}
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


const NotFound = () => (
  <div style={{minHeight:'55vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center',padding:'30px',color:'#e0e1dd'}}>
    <h1 style={{fontSize:'76px',color:'#f5b942'}}>404</h1>
    <h2 style={{marginBottom:'12px'}}>Page Not Found</h2>
    <p style={{marginBottom:'25px'}}>Sorry, the page you are looking for does not exist.</p>
    <Link to="/" style={{background:'#f5b942',color:'#0b132b',padding:'12px 24px',borderRadius:'8px',fontWeight:'bold'}}>Go to Home</Link>
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
  const location = useLocation();

  useEffect(() => {
    const pageSEO = {
      '/': ['CoinMitra - Earn, Learn, Play & Explore', 'Explore quizzes, educational activities and demo rewards on CoinMitra.'],
      '/dashboard': ['Dashboard - CoinMitra', 'View your CoinMitra demo account dashboard and activity.'],
      '/games': ['Games - CoinMitra', 'Play Spin & Win, Coin Catcher and Mystery Box on CoinMitra.'],
      '/quiz': ['Games - CoinMitra', 'Play games on CoinMitra.'],
      '/tasks': ['Activities - CoinMitra', 'Explore available activities on CoinMitra.'],
      '/wallet': ['Demo Coin Wallet - CoinMitra', 'View your demo coin balance and wallet information.'],
      '/rewards': ['Demo Rewards - CoinMitra', 'Explore illustrative demo rewards on CoinMitra.'],
      '/watch-earn': ['Educational Videos - CoinMitra', 'Explore educational video content on CoinMitra.'],
      '/about': ['About Us - CoinMitra', 'Learn about CoinMitra and our demo learning platform.'],
      '/contact': ['Contact Us - CoinMitra', 'Contact CoinMitra support for questions and assistance.'],
      '/privacy': ['Privacy Policy - CoinMitra', 'Read the CoinMitra privacy policy.'],
      '/terms': ['Terms & Conditions - CoinMitra', 'Read the CoinMitra terms and conditions.'],
      '/faq': ['FAQ - CoinMitra', 'Find answers to frequently asked questions about CoinMitra.'],
      '/how-it-works': ['How It Works - CoinMitra', 'Learn how to explore and use CoinMitra.'],
      '/login': ['Login - CoinMitra', 'Log in to your CoinMitra account.'],
      '/register': ['Register - CoinMitra', 'Create your CoinMitra account.'],
      '/admin': ['Admin - CoinMitra', 'CoinMitra administration page.']
    };

    const [title, description] = pageSEO[location.pathname] || pageSEO['/'];
    document.title = title;

    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'description';
      document.head.appendChild(meta);
    }
    meta.content = description;

    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.href = 'https://sparkly-douhua-95dab4.netlify.app' + location.pathname;

    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.content = title;

    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) ogDescription.content = description;

    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) ogUrl.content = 'https://sparkly-douhua-95dab4.netlify.app' + location.pathname;
  }, [location.pathname]);

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
            <Route path="/games" element={<Games />} />
            <Route path="/quiz" element={<Games />} />
            <Route path="/tasks" element={<Tasks setCoinBalance={setCoinBalance} />} />
            <Route path="/wallet" element={<Wallet coinBalance={coinBalance} />} />
            <Route path="/rewards" element={<RewardRequests coinBalance={coinBalance} setCoinBalance={setCoinBalance} />} />
            <Route path="/watch-earn" element={<WatchEarn />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsConditions />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </React.Fragment>
  );
}

export default App;
