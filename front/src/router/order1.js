const OrderRoutes1 = [
  {
    path: '/ordManager',
    name: 'OrderManager',
    component: () => import('../views/order/OrderManager.vue')
  },
  {
    path: '/ordList',
    name: 'OrderList',
    component: () => import('../views/order/OrderList.vue')
  }
];

export default OrderRoutes1;
