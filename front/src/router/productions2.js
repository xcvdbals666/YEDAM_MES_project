// src / router / Productions.js

const ProductionRoutes2 = [
  {
    path: '/production/plan',
    name: 'productionPlan',
    component: () => import('@/views/Productions/ProductionPlan.vue')
  },
  {
    path: '/production/planList',
    name: 'productionPlanList',
    component: () => import('@/views/Productions/ProductionPlanList.vue')
  },
  {
    path: '/production/result',
    name: 'productionResult',
    component: () => import('@/views/Productions/ProductionResult.vue')
  }
];

export default ProductionRoutes2;
