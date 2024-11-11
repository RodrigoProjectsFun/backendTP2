// models/userclient.model.js
import mongoose from 'mongoose';

const UserClientSchema = new mongoose.Schema({
  firebaseId: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  displayName: { type: String },
  dni: { type: String },
  firstName: { type: String },
  lastName: { type: String },
  faceData: { type: [Number] }, // Assuming faceData is an array of numbers
});

const UserClient = mongoose.model('UserClient', UserClientSchema);

export default UserClient;
