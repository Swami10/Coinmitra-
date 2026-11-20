const { admin, db } = require('../firebase-admin');

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== 'GET') {
      return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed.' }) };
    }

    const header = event.headers.authorization || event.headers.Authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : '';
    if (!token) return { statusCode: 401, body: JSON.stringify({ error: 'Login required.' }) };

    const decoded = await admin.auth().verifyIdToken(token);
    const today = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit'
    }).format(new Date());

    const claim = await db.collection('dailyClaims').doc(decoded.uid + '_' + today).get();

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ checkedIn: claim.exists })
    };
  } catch (error) {
    console.error('Check-in status error:', error.message);
    return { statusCode: 500, body: JSON.stringify({ error: 'Could not check status.' }) };
  }
};
