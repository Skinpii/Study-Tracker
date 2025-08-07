import mongoose from 'mongoose';

const budgetSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  category: { type: String, required: true },
  amount: { type: Number, required: true },
  spent: { type: Number, default: 0 },
  description: { type: String },
  month: { type: Number, required: true },
  year: { type: Number, required: true },
  type: { type: String, enum: ['income', 'expense'], required: true },
}, { timestamps: true });

budgetSchema.virtual('id').get(function () {
  return this._id.toHexString();
});
budgetSchema.set('toJSON', { virtuals: true });

export default mongoose.model('Budget', budgetSchema); 