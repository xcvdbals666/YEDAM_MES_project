// src/router/material2.js

const materialRoutes2 = [
  {
    path: '/matRequest',
    name: 'materialRequest',
    component: () => import('@/views/material/MprPurchaseRequest.vue')
  },
  {
    path: '/matList',
    name: 'materialList',
    component: () => import('@/views/material/MprCheckRequest.vue')
  }
];

export default materialRoutes2;
