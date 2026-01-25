const qualityRouter = [
  {
    path: '/qiorder',
    name: 'QiOrder',
    component: () => import('@/views/quality/QiOrder.vue')
  },
  {
    path: '/qiresult',
    name: 'QiResult',
    component: () => import('../views/quality/QiRuesult.vue')
  },
  {
    path: '/qcrinfo',
    name: 'QcrInfo',
    component: () => import('../views/quality/QcrInfo.vue')
  },
  {
    path: '/selectqcr',
    name: 'SelectQcr',
    component: () => import('../views/quality/SelectQcr.vue')
  }
];

export default qualityRouter;
