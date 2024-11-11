// models/tag.model.js

import mongoose from 'mongoose';

const TagSchema = new mongoose.Schema(
  {
    UIDresult: {
      type: String,
      required: true,
      unique: true, // Ensures each UIDresult is unique
    },
    tagId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
    },
    // associations are handled via Association model
  },
  { timestamps: true }
);

const Tag = mongoose.model('Tag', TagSchema);

export default Tag;
