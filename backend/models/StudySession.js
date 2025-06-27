import mongoose from 'mongoose';

const studySessionSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  subject: { type: String, required: true },
  duration: { type: Number, required: true },
  type: { type: String, enum: ['study', 'break', 'pomodoro'], required: true },
  date: { type: Date, required: true },
  notes: { type: String },
}, { timestamps: true });

studySessionSchema.virtual('id').get(function () {
  return this._id.toHexString();
});
studySessionSchema.set('toJSON', { virtuals: true });

export default mongoose.model('StudySession', studySessionSchema); 