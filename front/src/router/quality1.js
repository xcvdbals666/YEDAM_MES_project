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
  }
];

export default qualityRouter;
