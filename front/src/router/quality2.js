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
  },
  {
    path: '/qiresultdetail/:qir_code',
    name: 'QiResultDetail',
    component: () => import('../views/quality/QiResultDetail.vue')
  },
  
];

export default qualityRouter2;
