import { getAllOrders } from './orders.model';

const ordersResolvers = {
  Query: {
    orders: () => {
      return getAllOrders();
    },
  },
};

export { ordersResolvers };
