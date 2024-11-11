import { mergeTypeDefs } from "@graphql-tools/merge";

import rootTypeDefs from './root.js';
import userTypeDef from "./user.typeDef.js";
import tagTypeDef from "./tags.typeDef.js";
import categoryTypeDefs from "./category.typeDef.js";
import productTypeDefs from "./product.typeDef.js";
import associationTypeDefs from "./association.typeDef.js";
import orderTypeDefs from "./order.js";
import userClientTypeDefs from "./userclient.js";
import RecommendedProduct from "./recommendedproduct.js"
const mergedTypeDefs = mergeTypeDefs([rootTypeDefs, userTypeDef , tagTypeDef,rootTypeDefs, categoryTypeDefs, productTypeDefs,associationTypeDefs,orderTypeDefs,userClientTypeDefs, RecommendedProduct]);

export default mergedTypeDefs;
