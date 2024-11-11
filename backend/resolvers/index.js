import { mergeResolvers } from "@graphql-tools/merge";

import userResolver from "./user.resolver.js";
import Tagresolvers from "./tag.resolvers.js";
import categoryResolvers from "./category.resolvers.js";
import productResolvers from "./product.resolvers.js";
import associationResolvers from "./association.resolvers.js";
import orderResolvers from "./order.js";
import userResolvers from "./userclient.js";
const mergedResolvers = mergeResolvers([userResolver, Tagresolvers,categoryResolvers, productResolvers , associationResolvers,orderResolvers,userResolvers]);

export default mergedResolvers;