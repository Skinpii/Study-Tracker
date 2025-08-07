import mongoose from 'mongoose';

const reminderSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  date: { type: Date, required: true },
  recurring: { type: Boolean, default: false },
  recurringType: { type: String, enum: ['daily', 'weekly', 'monthly'], required: false },
  completed: { type: Boolean, default: false },
}, { timestamps: true });

reminderSchema.virtual('id').get(function () {
  return this._id.toHexString();
});
reminderSchema.set('toJSON', { virtuals: true });

export default mongoose.model('Reminder', reminderSchema); 