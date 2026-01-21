const Order2 = [
  {
    path: '/outbound',
    name: 'outbound',
    component: () => import('@/views/order/OutboundList.vue')
  },
  {
    path: '/outbound/request',
    name: 'outboundRequest',
    component: () => import('@/views/order/OutboundRequest.vue')
  }
];

export default Order2;
