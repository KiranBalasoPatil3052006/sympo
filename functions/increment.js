const admin = require('firebase-admin');

const serviceAccount = JSON.parse(process.env.FIREBASE_CREDENTIALS);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://sympo-94600-default-rtdb.firebaseio.com/' // Updated to your project ID
  });
}

const db = admin.firestore();

exports.handler = async (event) => {
  const { type, dept } = event.queryStringParameters;

  try {
    if (type === 'visit') {
      const docRef = db.doc('stats/visits');
      await db.runTransaction(async (transaction) => {
        const doc = await transaction.get(docRef);
        const newCount = (doc.exists ? doc.data().count : 0) + 1;
        transaction.set(docRef, { count: newCount });
      });
    } else if (type === 'deptClick' && dept) {
      const docRef = db.doc(`stats/depts/${dept}`);
      await db.runTransaction(async (transaction) => {
        const doc = await transaction.get(docRef);
        const data = doc.exists ? doc.data() : { clicks: 0, registrations: 0 };
        data.clicks += 1;
        transaction.set(docRef, data);
      });
    } else if (type === 'regClick' && dept) {
      const docRef = db.doc(`stats/depts/${dept}`);
      await db.runTransaction(async (transaction) => {
        const doc = await transaction.get(docRef);
        const data = doc.exists ? doc.data() : { clicks: 0, registrations: 0 };
        data.registrations += 1;
        transaction.set(docRef, data);
      });
    } else {
      return { statusCode: 400, body: JSON.stringify({ error: 'Invalid type or missing dept' }) };
    }

    return { statusCode: 200, body: JSON.stringify({ message: 'Success' }) };
  } catch (error) {
    console.error('Error:', error);
    return { statusCode: 500, body: JSON.stringify({ error: 'Server error' }) };
  }
};
