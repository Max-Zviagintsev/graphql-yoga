import {
  getAllProducts,
  getProductsByPrice,
  getProductById,
  addNewProduct,
  addNewProductReview,
} from './products.model';

const productsResolvers = {
  Query: {
    products: () => {
      return getAllProducts();
    },
    productsByPrice: (_, args) => {
      return getProductsByPrice(args.min, args.max);
    },
    product: (_, args) => {
      return getProductById(args.id);
    },
  },
  Mutation: {
    addNewProduct: (_, args) => {
      return addNewProduct(args.id, args.description, args.price);
    },
    addNewProductReview: (_, args) => {
      return addNewProductReview(args.id, args.rating, args.comment);
    },
  },
};

export { productsResolvers };
