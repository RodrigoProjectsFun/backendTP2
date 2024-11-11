// resolvers/tag.js

import Tag from '../models/tag.model.js';
import Association from '../models/association.model.js';

const tagResolvers = {
  Query: {
    tags: async () => await Tag.find(),
    tag: async (_, { id }) => await Tag.findById(id),
    getTagByUIDresult: async (_, { uidResult }) => await Tag.findOne({ UIDresult: uidResult }),
  },
  Mutation: {
    createTag: async (_, { UIDresult, tagId }) => {
      const tagData = { UIDresult };
      if (tagId) tagData.tagId = tagId;

      const tag = new Tag(tagData);
      return await tag.save();
    },
    updateTag: async (_, { id, UIDresult, tagId }) => {
      const updateData = {};
      if (UIDresult !== undefined) updateData.UIDresult = UIDresult;
      if (tagId !== undefined) updateData.tagId = tagId;

      const updatedTag = await Tag.findByIdAndUpdate(id, updateData, { new: true });
      if (!updatedTag) {
        throw new Error('Tag not found.');
      }
      return updatedTag;
    },
    deleteTag: async (_, { id }) => {
      const tag = await Tag.findById(id);
      if (!tag) {
        throw new Error('Tag not found.');
      }

      // Delete the associated Association if exists
      await Association.findOneAndDelete({ tag: id });

      await Tag.findByIdAndDelete(id);
      return true; // Changed to return Boolean
    },
  },
  Tag: {
    association: async (parent) => {
      return await Association.findOne({ tag: parent.id }).populate('product');
    },
  },
};

export default tagResolvers;
