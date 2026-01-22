<script setup>
import { ref, watch, onBeforeMount, computed } from 'vue';
import { useOrderStore } from '@/stores/order1';
import BaseDialog from '@/components/order/BaseDialog.vue';
import { FilterMatchMode, FilterService } from '@primevue/core/api';
const order = useOrderStore();
//제품배열
const details = ref([]);
//주문정보
const orderInfo = ref({
  ord_code: '',
  ord_name: '',
  ord_date: new Date().toISOString().split('T')[0],
  ord_stat: null,
  client_code: null,
  mcode: '',
  note: ''
});
// 새로운 필터조건 생성.
FilterService.register('dateRange', (value, filter) => {
  // 필터 조건이 없으면 무조건 통과
  if (!filter || (!filter[0] && !filter[1])) return true;
  if (!value) return false;

  const rowDate = new Date(value).setHours(0, 0, 0, 0); // 시간 떼고 날짜만 비교
  const start = filter[0] ? new Date(filter[0]).setHours(0, 0, 0, 0) : null;
  const end = filter[1] ? new Date(filter[1]).setHours(0, 0, 0, 0) : null;

  // 시작일~종료일 사이인지 체크
  if (start && end) return rowDate >= start && rowDate <= end;
  if (start) return rowDate >= start; // 시작일만 있으면 그 이후
  if (end) return rowDate <= end; // 종료일만 있으면 그 이전
  return true;
});

// 검색용 필터
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  ord_name: { value: null, matchMode: FilterMatchMode.CONTAINS },
  client_name: { value: null, matchMode: FilterMatchMode.CONTAINS },
  ord_code: { value: null, matchMode: FilterMatchMode.CONTAINS },
  ord_date: { value: [null, null], matchMode: 'dateRange' }
});
// 검색조건의 시작일 종료일 변수
const startDate = ref(null);
const endDate = ref(null);

// 날짜가 변경될 때마다 filters에 배열 형태로 넣어주기
watch([startDate, endDate], ([newStart, newEnd]) => {
  filters.value.ord_date.value = [newStart, newEnd];
});
// rowClass 함수: 데이터 상태에 따라 클래스 문자열 반환
const rowClass = (data) => {
  // 빈 행(isEmpty: true)이면 클릭 방지 클래스 적용
  return data.isEmpty ? 'empty-row pointer-events-none bg-transparent' : '';
};

// 주문모달 보여주기
const ordVisible = ref(false);
// 선택된 주문을 담을 변수
const selectedOrder = ref(null);

onBeforeMount(async () => {
  await order.getOrderList();
});
const orderDetail = ref([]);
// 기존 getOrderDetails 함수를 이걸로 교체하세요.
const getOrderDetails = async (event) => {
  // 1. 반응형 참조(Proxy)를 완전히 끊고 순수 데이터만 복사
  const rawData = JSON.parse(JSON.stringify(event.data));
  orderInfo.value = rawData;

  // 2. API 호출
  await order.getOrderDetail(orderInfo.value.ord_code);
  orderDetail.value = order.details;
  for (let val of orderDetail.value) {
    totalPrice.value = totalPrice.value + val.total_price;
  }
  // 3. 데이터 준비 끝난 후 모달 열기
  ordVisible.value = true;
};
const resetBtn = () => {
  filters.value.global.value = null;
  filters.value.ord_name.value = null;
  filters.value.client_name.value = null;
  filters.value.ord_code.value = null;
  filters.value.ord_date.value = [null, null];
  startDate.value = null;
  endDate.value = null;
};

const formatCurrency = (value) => {
  return Number(value).toLocaleString() + '원';
};
// [누락된 함수 추가] 우선순위에 따라 배지 색상을 반환하는 함수
const getPrioritySeverity = (priority) => {
  switch (priority) {
    case '상':
      return 'danger'; // 빨강
    case '중':
      return 'warn'; // 주황
    case '하':
      return 'info'; // 파랑
    default:
      return null; // 그 외
  }
};
const isRowSelectable = (data) => {
  return true; // 모든 행 선택 가능
};
const totalPrice = ref(0);
const closeModal = () => {
  totalPrice.value = 0;
  ordVisible.value = false;
};
</script>

<template>
  <Dialog v-model:visible="ordVisible" header="주문 상세 정보" :style="{ width: '70vw', maxWidth: '1000px' }" modal :draggable="false">
    <div class="flex flex-col gap-6">
      <div>
        <h3 class="text-lg font-bold mb-3 text-gray-700">📋 기본 정보</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="flex flex-col gap-1">
            <label class="text-sm font-bold text-gray-500">주문코드</label>
            <InputText v-model="orderInfo.ord_code" readonly="true" />
          </div>

          <div class="flex flex-col gap-1">
            <label class="text-sm font-bold text-gray-500">주문명</label>
            <InputText v-model="orderInfo.ord_name" readonly="true" />
          </div>

          <div class="flex flex-col gap-1">
            <label class="text-sm font-bold text-gray-500">거래처</label>
            <InputText v-model="orderInfo.client_name" readonly="true" />
          </div>

          <div class="flex flex-col gap-1">
            <label class="text-sm font-bold text-gray-500">주문일자</label>
            <InputText v-model="orderInfo.ord_date" type="date" readonly="true" />
          </div>

          <div class="flex flex-col gap-1 md:col-span-2">
            <label class="text-sm font-bold text-gray-500">비고</label>
            <Textarea v-model="orderInfo.note" rows="2" autoResize readonly="true" />
          </div>
        </div>
      </div>

      <hr class="border-gray-300" />

      <div>
        <div class="flex justify-between items-end mb-3">
          <h3 class="text-lg font-bold text-gray-700">📦 주문 품목</h3>
          <span class="text-sm text-gray-500">
            총 합계: <span class="text-xl font-bold text-blue-600">{{ totalPrice.toLocaleString() }} </span>원
          </span>
        </div>

        <DataTable :value="orderDetail" showGridlines stripedRows scrollable scrollHeight="300px" tableStyle="min-width: 50rem" class="text-sm">
          <Column header="상품정보" style="min-width: 200px">
            <template #body="slotProps">
              <div class="flex flex-col">
                <span class="font-bold">{{ slotProps.data.prod_name }}</span>
                <span class="text-xs text-gray-500"> {{ slotProps.data.com_note }} | {{ slotProps.data.prod_code }} </span>
              </div>
            </template>
          </Column>

          <Column header="규격/단위" style="width: 120px">
            <template #body="slotProps">
              <div>{{ slotProps.data.spec_note }}</div>
              <div class="text-xs text-gray-400">({{ slotProps.data.unit_note }})</div>
            </template>
          </Column>

          <Column field="delivery_date" header="납기예정일" style="width: 100px" class="text-center"></Column>

          <Column field="ord_priority" header="우선순위" style="width: 80px" class="text-center">
            <template #body="slotProps">
              <Tag :value="slotProps.data.ord_priority" :severity="getPrioritySeverity(slotProps.data.ord_priority)" />
            </template>
          </Column>

          <Column field="ord_amount" header="수량" style="width: 80px" class="text-right">
            <template #body="slotProps">
              {{ slotProps.data.ord_amount.toLocaleString() }}
            </template>
          </Column>

          <Column field="prod_price" header="단가" style="width: 100px" class="text-right">
            <template #body="slotProps">
              {{ formatCurrency(slotProps.data.prod_price) }}
            </template>
          </Column>

          <Column field="total_price" header="합계금액" style="width: 120px" class="text-right font-bold text-blue-600">
            <template #body="slotProps">
              {{ formatCurrency(slotProps.data.total_price) }}
            </template>
          </Column>
        </DataTable>
      </div>
    </div>
    <template #footer>
      <Button label="확인" severity="info" variant="outlined" class="min-w-[65px]" @click="closeModal" />
    </template>
  </Dialog>
  <Fluid>
    <div class="card mb-4">
      <div class="font-semibold text-xl mb-4">검색 조건</div>

      <div class="flex flex-wrap gap-4 items-end">
        <div class="flex flex-col gap-2">
          <label for="search" class="font-bold">주문코드</label>
          <IconField>
            <InputIcon class="pi pi-search" />
            <InputText id="search" v-model="filters['ord_code'].value" placeholder="주문코드" class="w-[300px]" />
          </IconField>
        </div>
        <div class="flex flex-col gap-2">
          <label for="search" class="font-bold">주문명</label>
          <IconField>
            <InputIcon class="pi pi-search" />
            <InputText id="search" v-model="filters['ord_name'].value" placeholder="주문명" class="w-[300px]" />
          </IconField>
        </div>
        <div class="flex flex-col gap-2">
          <label for="search" class="font-bold">거래처</label>
          <IconField>
            <InputIcon class="pi pi-search" />
            <InputText id="search" v-model="filters['client_name'].value" placeholder="거래처" class="w-[300px]" />
          </IconField>
        </div>
        <div class="flex flex-col gap-2">
          <label class="font-bold text-sm">주문일자 (기간)</label>
          <div class="flex items-center gap-2">
            <DatePicker v-model="startDate" showIcon dateFormat="yy-mm-dd" placeholder="시작일" class="w-[140px]" />
            <span>~</span>
            <DatePicker v-model="endDate" showIcon dateFormat="yy-mm-dd" placeholder="종료일" class="w-[140px]" />
          </div>
        </div>
        <div class="ml-auto flex gap-2">
          <Button label="초기화" severity="contrast" variant="outlined" @click="resetBtn" />
        </div>
      </div>
    </div>

    <div class="flex mt-8">
      <div class="card flex flex-col gap-4 w-full">
        <div>
          <DataTable
            :isDataSelectable="isRowSelectable"
            v-model:filters="filters"
            :globalFilterFields="['ord_code', 'ord_name', 'client_name']"
            dataKey="ord_code"
            v-model:selection="selectedOrder"
            :value="order.orders"
            tableStyle="min-width: 60rem"
            paginator="true"
            :rows="10"
            selection-mode="single"
            :rowClass="rowClass"
            :metaKeySelection="false"
            @row-dblclick="getOrderDetails"
          >
            <Column field="ord_code" header="주문코드"></Column>
            <Column field="ord_name" header="주문명"></Column>
            <Column field="client_name" header="거래처명"></Column>
            <Column field="mcode" header="작성자">
              <template #body="slotProps">
                {{ `${slotProps.data.mname} (${slotProps.data.mcode})` }}
              </template>
            </Column>
            <Column field="ord_date" header="주문일자" />
          </DataTable>
          <div class="flex justify-end mt-4">
            <h5>
              총 <span class="text-orange-700 font-bold text-4xl">{{ order.orders.length }}</span
              >건
            </h5>
          </div>
        </div>
      </div>
    </div>
  </Fluid>
</template>
