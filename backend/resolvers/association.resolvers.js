// resolvers/association.js

import Association from '../models/association.model.js';
import Product from '../models/product.model.js';
import Tag from '../models/tag.model.js';

const associationResolvers = {
  Query: {
    associations: async () => await Association.find().populate('product').populate('tag'),
    association: async (_, { id }) => await Association.findById(id).populate('product').populate('tag'),
  },
  Mutation: {
    createOrUpdateAssociation: async (_, { productId, UIDresult }) => {
      try {
        console.log(`Creating or updating association with productId: ${productId}, UIDresult: ${UIDresult}`);

        // Validate input
        if (!productId || !UIDresult) {
          throw new Error('Product ID and UIDresult are required.');
        }

        // Find the product
        const product = await Product.findById(productId);
        if (!product) {
          throw new Error('Product not found.');
        }
        console.log(`Product Found: ${product.name} (ID: ${product.id})`);

        // Find or create the tag
        let tag = await Tag.findOne({ UIDresult });
        if (!tag) {
          console.log(`Tag Not Found: Creating new tag with UIDresult ${UIDresult}`);
          tag = new Tag({ UIDresult });
          await tag.save();
          console.log(`Tag Created: ${tag.UIDresult} (ID: ${tag.id})`);
        } else {
          console.log(`Tag Found: ${tag.UIDresult} (ID: ${tag.id})`);
        }

        // Find existing association
        let association = await Association.findOne({ tag: tag.id });

        if (association) {
          console.log(`Updating existing association: ID ${association.id}`);
          association.product = product._id;
          await association.save();
        } else {
          console.log(`Creating new association for Tag ID ${tag.id}`);
          association = new Association({
            product: product._id,
            tag: tag._id,
          });
          await association.save();
          console.log(`Association Created: ID ${association.id}`);
        }

        // Populate the association fields for the response
        await association.populate(['product', 'tag']); // Single populate call with array

        console.log(`Association Returned: ID ${association.id}`);
        return association;
      } catch (error) {
        console.error('Error in createOrUpdateAssociation:', error);
        throw new Error(error.message);
      }},
    updateAssociation: async (_, { id, productId, UIDresult }) => {
      try {
        console.log(`Resolver Invoked: Updating association ID: ${id} with productId: ${productId}, UIDresult: ${UIDresult}`);

        const updateData = {};
        if (productId) {
          const product = await Product.findById(productId);
          if (!product) {
            console.error(`Product Not Found: ID ${productId}`);
            throw new Error('Product not found.');
          }
          updateData.product = product._id;
        }
        if (UIDresult) {
          let tag = await Tag.findOne({ UIDresult });
          if (!tag) {
            console.log(`Tag Not Found: Creating new tag with UIDresult ${UIDresult}`);
            tag = new Tag({ UIDresult });
            await tag.save();
            console.log(`Tag Created: ${tag.UIDresult} (ID: ${tag.id})`);
          }
          updateData.tag = tag._id;

          // Check if the Tag already has an Association (other than this one)
          const existingAssociation = await Association.findOne({ tag: tag.id, _id: { $ne: id } });
          if (existingAssociation) {
            console.error(`Association Exists: Tag ${tag.id} already associated with Product ${existingAssociation.product}`);
            throw new Error('This tag is already associated with another product.');
          }
        }

        const association = await Association.findByIdAndUpdate(id, updateData, { new: true }).populate('product').populate('tag');
        if (!association) {
          console.error(`Association Not Found: ID ${id}`);
          throw new Error('Association not found.');
        }
        console.log(`Association Updated Successfully: ${association.id}`);
        return association;
      } catch (error) {
        console.error('Resolver Error:', error);
        throw new Error(error.message);
      }
    },
    deleteAssociation: async (_, { id }) => {
      try {
        console.log(`Resolver Invoked: Deleting association ID: ${id}`);

        const association = await Association.findById(id);
        if (!association) {
          console.error(`Association Not Found: ID ${id}`);
          throw new Error('Association not found.');
        }

        await Association.findByIdAndDelete(id);
        console.log(`Association Deleted Successfully: ID ${id}`);
        return true; // Changed to return Boolean
      } catch (error) {
        console.error('Error deleting association:', error);
        throw new Error('Failed to delete association.');
      }
    },
  },
  Association: {
    product: async (parent) => await Product.findById(parent.product),
    tag: async (parent) => await Tag.findById(parent.tag),
  },
};

export default associationResolvers;
