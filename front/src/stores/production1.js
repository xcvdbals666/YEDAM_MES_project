// src/stores/Productions.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

export const useProductionsStore = defineStore('productions', () => {
  const wkoList = ref([])
  const loading = ref(false)

  const fetchWorkOrders = async () => {
    loading.value = true
    try {
      const res = await axios.get('/produce/workorderList')
      wkoList.value = res.data
    } finally {
      loading.value = false
    }
  }

  return { wkoList, loading, fetchWorkOrders }
})

