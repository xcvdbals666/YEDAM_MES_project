// src/router/material2.js

const materialRoutes2 = [
  {
    path: '/mprRequest',
    name: 'mprRequest',
    component: () => import('@/views/material/MprPurchaseRequest.vue')
  },
  {
    path: '/mprList',
    name: 'mprRequestList',
    component: () => import('@/views/material/MprRequestList.vue')
  },
  {
    path: '/mprList/:mprCode',
    name: 'mprRequestDetail',
    component: () => import('@/views/material/MprRequestDetail.vue'),
    props: true
  }
];

export default materialRoutes2;
