<script setup>
import BestSellingWidget from '@/components/dashboard/BestSellingWidget.vue';
import NotificationsWidget from '@/components/dashboard/NotificationsWidget.vue';
import RecentSalesWidget from '@/components/dashboard/RecentSalesWidget.vue';
import RevenueStreamWidget from '@/components/dashboard/RevenueStreamWidget.vue';
import StatsWidget from '@/components/dashboard/StatsWidget.vue';
import axios from 'axios';

// 노드 통신 테스트
// 생산
axios.get('/produce/produce').then((res) => {
    console.log('produce', res);
});

// 자재
axios.get('/material/material').then((res) => {
    console.log('material', res);
});

// 품질
axios.get('/quality/quality').then((res) => {
    console.log('quality', res);
});

// 주문
axios.get('/order/order').then((res) => {
    console.log('order', res);
});
</script>

<template>
    <div class="grid grid-cols-12 gap-8">
        <StatsWidget />

        <div class="col-span-12 xl:col-span-6">
            <RecentSalesWidget />
            <BestSellingWidget />
        </div>
        <div class="col-span-12 xl:col-span-6">
            <RevenueStreamWidget />
            <NotificationsWidget />
        </div>
    </div>
</template>
