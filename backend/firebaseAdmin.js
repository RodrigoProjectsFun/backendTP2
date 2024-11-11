// firebaseAdmin.js
import admin from 'firebase-admin';
import path from 'path';
import fs from 'fs';

const __dirname = path.resolve();
const serviceAccountPath = path.resolve(__dirname, './tp-smartkart-7dc93-firebase-adminsdk-53o47-ce5088d489.json');
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export default admin;
