const { admin, db } = require('../firebase-admin');

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: JSON.stringify({ message: 'Method not allowed.' }) };
    }

    const header = event.headers.authorization || event.headers.Authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : '';

    if (!token) {
      return { statusCode: 401, body: JSON.stringify({ message: 'Please login first.' }) };
    }

    const decoded = await admin.auth().verifyIdToken(token);
    const body = JSON.parse(event.body || '{}');
    const game = body.game;

    const rules = {
      spin: { max: 1, rewards: [0, 1, 2, 3, 5] },
      catcher: { max: 3, rewards: [1, 1, 2, 2, 3] },
      mystery: { max: 1, rewards: [0, 2, 3, 5] },
      hunt: { max: 1, rewards: [0, 1, 2, 3] },
      difference: { max: 1, rewards: [0, 1, 2, 3] },
      speed: { max: 1, rewards: [0, 1, 2, 3] }
    };

    if (!rules[game]) {
      return { statusCode: 400, body: JSON.stringify({ message: 'Invalid game.' }) };
    }

    const today = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(new Date());

    const rule = rules[game];
    const drawnPoints = rule.rewards[Math.floor(Math.random() * rule.rewards.length)];

    const userRef = db.collection('users').doc(decoded.uid);
    const claimRef = db.collection('gameClaims').doc(decoded.uid + '_' + today + '_' + game);
    const dailyRef = db.collection('gameDailyTotals').doc(decoded.uid + '_' + today);

    const result = await db.runTransaction(async (tx) => {
      const claimSnap = await tx.get(claimRef);
      const dailySnap = await tx.get(dailyRef);
      const userSnap = await tx.get(userRef);

      const previous = claimSnap.exists ? claimSnap.data() : {};
      const plays = Number(previous.plays) || 0;
      const dailyPoints = dailySnap.exists ? (Number(dailySnap.data().points) || 0) : 0;
      const gamePoints = dailySnap.exists
        ? (Number(dailySnap.data().gamePoints ?? dailySnap.data().points) || 0) : 0;

      if (plays >= rule.max) {
        return { limited: true, message: 'Daily play limit reached for this game.' };
      }

      if (gamePoints >= 10 || dailyPoints >= 12) {
        return { limited: true, message: 'Daily game or total Demo Points limit reached.' };
      }

      const awarded = Math.min(drawnPoints, 10 - gamePoints, 12 - dailyPoints);
      const balance = userSnap.exists ? (Number(userSnap.data().coinBalance) || 0) : 0;

      if (userSnap.exists) {
        tx.update(userRef, { coinBalance: balance + awarded });
      } else {
        tx.set(userRef, {
          name: decoded.name || '',
          email: decoded.email || '',
          coinBalance: awarded,
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
      }

      tx.set(claimRef, {
        userId: decoded.uid,
        game,
        date: today,
        plays: plays + 1,
        points: (Number(previous.points) || 0) + awarded,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      tx.set(dailyRef, {
        userId: decoded.uid,
        date: today,
        points: dailyPoints + awarded,
        gamePoints: gamePoints + awarded,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });

      return { limited: false, points: awarded, total: dailyPoints + awarded, gameTotal: gamePoints + awarded };
    });

    if (result.limited) {
      return {
        statusCode: 429,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ success: false, message: result.message })
      };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        game,
        points: result.points,
        dailyPoints: result.total,
        dailyGamePoints: result.gameTotal,
        dailyGameLimit: 10,
        dailyTotalLimit: 12
      })
    };
  } catch (error) {
    console.error('Games function error:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Unable to process game reward right now.' })
    };
  }
};
