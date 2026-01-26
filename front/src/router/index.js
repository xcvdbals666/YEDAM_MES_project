import Main from '@/views/Main.vue';
import { createRouter, createWebHistory } from 'vue-router';
import qualityRoutes1 from './quality1.js'; // 품질
import qualityRoutes2 from './quality2.js'; // 품질
import productionRoutes1 from './productions1.js';
import productionRoutes2 from './productions2.js';
import materialRoutes1 from './material1.js';
import materialRoutes2 from './material2.js'; // 자재
import orderRoutes1 from './order1.js'; //주문
import orderRoutes2 from './order2.js';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'main',
      component: () => import('@/views/order/OrderList.vue')
    },
    ...productionRoutes1,
    ...productionRoutes2,
    ...qualityRoutes1,
    ...qualityRoutes2,
    ...materialRoutes1,
    ...materialRoutes2,
    ...orderRoutes1,
    ...orderRoutes2
  ]
});

export default router;
