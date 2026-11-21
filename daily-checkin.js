const { admin, db } = require('../firebase-admin');

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed.' }) };
    }

    const header = event.headers.authorization || event.headers.Authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : '';
    if (!token) return { statusCode: 401, body: JSON.stringify({ error: 'Login required.' }) };

    const decoded = await admin.auth().verifyIdToken(token);
    const today = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit'
    }).format(new Date());

    const uid = decoded.uid;
    const userRef = db.collection('users').doc(uid);
    const claimRef = db.collection('dailyClaims').doc(uid + '_' + today);
    const dailyRef = db.collection('gameDailyTotals').doc(uid + '_' + today);

    const result = await db.runTransaction(async (tx) => {
      const claim = await tx.get(claimRef);
      const daily = await tx.get(dailyRef);
      const user = await tx.get(userRef);

      if (claim.exists) return { alreadyClaimed: true };

      const total = daily.exists ? (Number(daily.data().points) || 0) : 0;
      const oldGamePoints = daily.exists
        ? (Number(daily.data().gamePoints ?? daily.data().points) || 0) : 0;

      if (total + 2 > 12) return { limitReached: true };

      const balance = user.exists ? (Number(user.data().coinBalance) || 0) : 0;

      if (user.exists) {
        tx.update(userRef, { coinBalance: balance + 2 });
      } else {
        tx.set(userRef, {
          name: decoded.name || '',
          email: decoded.email || '',
          coinBalance: balance + 2,
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
      }

      tx.create(claimRef, {
        userId: uid,
        points: 2,
        date: today,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

      tx.set(dailyRef, {
        userId: uid,
        date: today,
        points: total + 2,
        gamePoints: oldGamePoints,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });

      return { success: true, newBalance: balance + 2 };
    });

    if (result.alreadyClaimed) {
      return { statusCode: 409, body: JSON.stringify({ error: 'Already claimed today.' }) };
    }
    if (result.limitReached) {
      return { statusCode: 429, body: JSON.stringify({ error: 'Today’s 12 Demo Points limit has been reached.' }) };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true, points: 2, newBalance: result.newBalance })
    };
  } catch (error) {
    console.error('Daily check-in error:', error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Daily check-in failed.' })
    };
  }
};
