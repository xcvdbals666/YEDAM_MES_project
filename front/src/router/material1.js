// src / router / material1.js
import MpoList from '@/views/material/MpoList.vue';
import MpoTable from '@/views/material/MpoTable.vue';
import InboundRegister from '@/views/material/InboundRegister.vue';

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
  },
  {
    path: '/inboundregister',
    name: 'InboundRegister',
    component: InboundRegister
  }
];
export default Material1Routes1;
