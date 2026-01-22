// src / router / Productions.js

const ProductionRoutes2 = [
  {
    path: '/production/plan',
    name: 'productionPlan',
    component: () => import('@/views/productions/ProductionPlan.vue')
  },
  {
    path: '/production/planList',
    name: 'productionPlanList',
    component: () => import('@/views/productions/ProductionPlanList.vue')
  },
  {
    path: '/production/result',
    name: 'productionResult',
    component: () => import('@/views/productions/ProductionResult.vue')
  },
  {
    path: '/production/mrp',
    name: 'productionMRP',
    component: () => import('@/views/productions/MRP.vue')
  },
  {
    path: '/production/mrpList',
    name: 'productionMRPList',
    component: () => import('@/views/productions/MRPList.vue')
  }
];

export default ProductionRoutes2;
