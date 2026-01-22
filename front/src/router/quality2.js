const qualityRouter2 = [
  {
    path: '/qiorderlist',
    name: 'QiOrderList',
    component: () => import('../views/quality/QiOrderList.vue')
  },
  {
    path: '/qioresultlist',
    name: 'QiResultList',
    component: () => import('../views/quality/QiResultList.vue')
  }
];

export default qualityRouter2;
