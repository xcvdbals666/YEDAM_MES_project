// src / router / production1.js
import WorkOrderList from '../views/productions/WorkOrderList.vue';
import WorkOrderMgt from '../views/productions/WorkOrderMgt.vue';
import WorkInProcessList from '../views/productions/WorkInProcessList.vue';
import WorkInProcessDetail from '../views/productions/WorkInProcessDetail.vue';
import WorkInProcessBulletin from '../views/productions/WorkInProcessBulletin.vue';

const ProductionRoutes1 = [
  {
    path: '/workorderList',
    name: 'WorkOrderList',
    component: WorkOrderList
  },
  {
    path: '/workorderMgt',
    name: 'WorkOrderMgt',
    component: WorkOrderMgt
  },
  {
    path: '/workInProcessList',
    name: 'WorkInProcessList',
    component: WorkInProcessList
  },
  {
    path: '/workInProcessDetail/:wko_code',
    name: 'WorkInProcessDetail',
    component: WorkInProcessDetail,
    props: true //params를 props로 받게
  },
  {
    path: '/workInProcessBulletin/:wko_code',
    name: 'WorkInProcessBulletin',
    component: WorkInProcessBulletin,
    props: true //params를 props로 받게
  }
];

export default ProductionRoutes1;
