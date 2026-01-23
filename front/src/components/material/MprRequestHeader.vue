<script setup>
import { computed } from 'vue';

const props = defineProps({
  modelValue: Object,
  selectedMrpValue: Object,
  mrpFilteredValue: Array,
  isSaved: Boolean,
  isEditable: Boolean,
  canSelectMrp: Boolean
});
const emit = defineEmits(['update:modelValue', 'update:selectedMrpValue', 'selectEmployee', 'save', 'reset', 'delete', 'open-mpr', 'search-mrp']);

const data = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});
</script>

<template>
  <div class="mpr-card">
    <!-- 헤더 -->
    <div class="flex justify-between items-center pb-4 border-b">
      <h4 class="m-0 font-semibold">자재 구매 요청</h4>

      <div class="flex items-center gap-2 whitespace-nowrap">
        <Button label="삭제" severity="danger" @click="emit('delete')" :disabled="!isEditMode || !isEditable" />
        <Button label="초기화" severity="contrast" @click="emit('reset')" />
        <Button label="저장" severity="info" @click="emit('save')" :disabled="isSaved || !isEditable" />
        <Button label="MPR 불러오기" @click="emit('open-mpr')" />
      </div>
    </div>

    <!-- 본문 -->
    <table class="w-full mt-4">
      <colgroup>
        <col class="w-[120px]" />
        <col />
        <col class="w-[120px]" />
        <col />
      </colgroup>

      <tbody>
        <tr>
          <th>요청번호</th>
          <td>
            <InputText v-model="data.mprCode" readonly />
          </td>

          <th>작성자</th>
          <td>
            <div class="flex gap-2">
              <InputText v-model="data.writer" placeholder="작성자 선택" :disabled="!isEditable" readonly @click="emit('selectEmployee')" class="flex-1" />
            </div>
          </td>
        </tr>

        <tr>
          <th>요청부서</th>
          <td>
            <InputText v-model="data.department" :disabled="!isEditable" readonly />
          </td>

          <th>납기일자</th>
          <td>
            <DatePicker v-model="data.deadline" dateFormat="yy-mm-dd" :showIcon="true" :showButtonBar="true" :disabled="!isEditable" placeholder="납기일자 선택" class="w-full" />
          </td>
        </tr>

        <tr>
          <th>등록일자</th>
          <td>
            <InputText v-model="data.reqDate" readonly />
          </td>

          <th>MRP 계획번호</th>
          <td>
            <AutoComplete
              :modelValue="selectedMrpValue"
              :suggestions="mrpFilteredValue"
              :disabled="!canSelectMrp"
              optionLabel="mrp_code"
              placeholder="MRP 선택"
              dropdown
              completeOnFocus
              @complete="emit('search-mrp', $event)"
              @update:modelValue="emit('update:selectedMrpValue', $event)"
            />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
/* 카드 전체 */
.mpr-card {
  background: #ffffff;
  border: 1px solid var(--surface-border, #e5e7eb);
  border-radius: 10px;
  padding: 20px;
}

/* 테이블 */
th,
td {
  padding: 8px 10px;
  text-align: left;
  vertical-align: middle;
}

th {
  font-weight: 600;
  white-space: nowrap;
  color: #374151;
}

td {
  padding-right: 20px;
}

/* 입력 컴포넌트 높이 통일 */
:deep(.p-inputtext),
:deep(.p-autocomplete),
:deep(.p-datepicker input) {
  width: 100%;
}
</style>
