<script setup>
import { useOrderStore2 } from '@/stores/order2';
import { ref, watch } from 'vue';

const props = defineProps({
    visible: Boolean,
    productInfo: Object // { prod_code, prod_name, max_amount }
});

const emit = defineEmits(['update:visible', 'confirm']);
const store = useOrderStore2();

const lotList = ref([]); // 로트 목록
const loading = ref(false);

// 모달 열렸을 때 로트 조회
watch(
    () => props.visible,
    async (val) => {
        
    }
)
</script>