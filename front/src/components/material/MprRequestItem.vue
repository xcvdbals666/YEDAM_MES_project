<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
    modelValue: Array
});
const emit = defineEmits(['update:modelValue']);

const rows = ref(props.modelValue || []);

watch(rows, (v) => emit('update:modelValue', v), { deep: true });

const addRow = () => {
    rows.value.push({
        materialCode: '',
        materialName: '',
        qty: null,
        unit: '',
        supplier: '',
        remark: ''
    });
};

const removeRow = (index) => {
    rows.value.splice(index, 1);
};
</script>

<template>
    <div class="card mt-4">
        <div class="flex justify-between align-items-center mb-3">
            <h4 class="m-0">요청 자재</h4>

            <div class="flex gap-2">
                <Button label="자재추가" />
                <Button label="자재삭제" severity="danger" />
            </div>
        </div>

        <DataTable :value="rows">
            <Column header="자재코드">
                <template #body="{ data }">
                    <InputText v-model="data.materialCode" />
                </template>
            </Column>

            <Column header="자재명">
                <template #body="{ data }">
                    <InputText v-model="data.materialName" />
                </template>
            </Column>

            <Column header="요청수량">
                <template #body="{ data }">
                    <InputNumber v-model="data.qty" />
                </template>
            </Column>

            <Column header="단위">
                <template #body="{ data }">
                    <InputText v-model="data.unit" />
                </template>
            </Column>

            <Column header="공급업체">
                <template #body="{ data }">
                    <InputText v-model="data.supplier" />
                </template>
            </Column>

            <Column header="비고">
                <template #body="{ data }">
                    <InputText v-model="data.remark" />
                </template>
            </Column>
        </DataTable>
    </div>
</template>
