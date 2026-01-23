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
  },
  {
    path: '/outbound/management',
    name: 'outboundManagement',
    component: () => import('@/views/order/OutboundManagement.vue')
  }
];

export default Order2;
