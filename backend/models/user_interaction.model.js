import mongoose from 'mongoose';

const userInteractionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: false
  },
  qdrantId: {
    type: String,
    required: false
  },
  interactionType: {
    type: String,
    enum: ['LIKE', 'SAVE', 'COMMENT', 'SEARCH', 'VIEW', 'UNLIKE' , 'UNSAVE'],
    required: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

userInteractionSchema.index({ userId: 1, timestamp: 1 });

const UserInteraction = mongoose.model('UserInteraction', userInteractionSchema);

export default UserInteraction;