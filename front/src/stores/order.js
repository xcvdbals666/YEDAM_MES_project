import { defineStore } from 'pinia';
import axios from 'axios';

const url = '/order';

export const useOrderStore = defineStore('order', {
    // state
    state: () => ({
        outboundList: []
    }),
    actions: {
        // 출고 조회
        async fetchOutbound() {
            try {
                const res = await axios.get(`${url}/outbounds`);
                // console.log('api 응답: ', res.data);

                this.outboundList = res.data;
                // console.log('Pinia state: ', this.outboundList);
            } catch (err) {
                console.error(err);
                throw err;
            }
        }
    },
    persist: true
});
