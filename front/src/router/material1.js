// src / router / material1.js
import MpoList from '@/views/material/MpoList.vue';
import MpoTable from '@/views/material/MpoTable.vue';

const Material1Routes1 = [
  {
    path: '/mpotable',
    name: 'MpoTable',
    component: MpoTable
  },
  {
    path: '/mpolist',
    name: 'MpoList',
    component: MpoList
  }
];
export default Material1Routes1;
