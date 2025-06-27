import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  completed: { type: Boolean, default: false },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  dueDate: { type: Date },
  category: { type: String },
}, { timestamps: true });

taskSchema.virtual('id').get(function () {
  return this._id.toHexString();
});
taskSchema.set('toJSON', { virtuals: true });

export default mongoose.model('Task', taskSchema); 