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

    const userRef = db.collection('users').doc(decoded.uid);
    const claimRef = db.collection('dailyClaims').doc(decoded.uid + '_' + today);

    const result = await db.runTransaction(async (tx) => {
      const claim = await tx.get(claimRef);
      if (claim.exists) return { alreadyClaimed: true };

      const userDoc = await tx.get(userRef);
      const current = userDoc.exists ? (Number(userDoc.data().coinBalance) || 0) : 0;

      if (userDoc.exists) {
        tx.update(userRef, { coinBalance: current + 2 });
      } else {
        tx.set(userRef, {
          name: decoded.name || '',
          email: decoded.email || '',
          coinBalance: current + 2,
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
      }

      tx.create(claimRef, {
        userId: decoded.uid,
        points: 2,
        date: today,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

      return { alreadyClaimed: false, newBalance: current + 2 };
    });

    if (result.alreadyClaimed) {
      return { statusCode: 409, body: JSON.stringify({ error: 'Already claimed today.' }) };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true, points: 2, newBalance: result.newBalance })
    };
  } catch (error) {
    console.error('Daily check-in error:', error.message);
    return { statusCode: 500, body: JSON.stringify({ error: 'Daily check-in failed.' }) };
  }
};
