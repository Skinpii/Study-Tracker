import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  tags: { type: [String], default: [] },
  subject: { type: String },
}, { timestamps: true });

noteSchema.virtual('id').get(function () {
  return this._id.toHexString();
});
noteSchema.set('toJSON', { virtuals: true });

export default mongoose.model('Note', noteSchema); 