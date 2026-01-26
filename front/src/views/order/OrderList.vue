<script setup>
import { ref, watch, onBeforeMount } from 'vue';
import { useOrderStore } from '@/stores/order1';
import { FilterMatchMode, FilterService } from '@primevue/core/api';
const order = useOrderStore();

//주문정보
const orderInfo = ref({
  ord_code: '',
  ord_name: '',
  ord_date: new Date().toISOString().split('T')[0],
  ord_stat: null,
  stat_note: null,
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
  ord_stat: { value: null, matchMode: FilterMatchMode.EQUALS },
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
const statOptions = ref([]);
onBeforeMount(async () => {
  await order.getOrderList();
  await order.getStatOptions();
  statOptions.value = order.stats;
  statOptions.value.unshift({ com_value: null, note: '전체' });
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
  filters.value.ord_stat.value = null;
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
const totalCount = ref(0);
const onFilter = (event) => {
  totalCount.value = event.filteredValue.length;
};
watch(
  () => order.orders,
  (newVal) => {
    if (newVal) {
      totalCount.value = newVal.length;
    }
  }
);
</script>

<template>
  <Dialog v-model:visible="ordVisible" header="주문 상세 정보" :style="{ width: '60vw', maxWidth: '1000px' }" modal :draggable="false" @after-hide="closeModal">
    <div class="flex flex-col gap-6">
      <div>
        <h3 class="text-lg font-bold mb-3 text-gray-700">주문 정보</h3>
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
            <InputText :value="`${orderInfo.client_name} (${orderInfo.client_code})`" readonly="true" />
          </div>

          <div class="flex flex-col gap-1">
            <label class="text-sm font-bold text-gray-500">주문일자</label>
            <InputText v-model="orderInfo.ord_date" type="date" readonly="true" />
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-sm font-bold text-gray-500">작성자</label>
            <InputText readonly="true" :value="`${orderInfo.mname} (${orderInfo.mcode})`" />
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-sm font-bold text-gray-500">주문상태</label>
            <InputText v-model="orderInfo.stat_note" readonly="true" />
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
          <h3 class="text-lg font-bold text-gray-700">주문 상세</h3>
          <span class="text-sm text-gray-500">
            총 합계: <span class="text-xl font-bold text-blue-600">{{ totalPrice.toLocaleString() }} </span>원
          </span>
        </div>

        <DataTable :value="orderDetail" showGridlines stripedRows scrollable scrollHeight="300px" tableStyle="min-width: 50rem" class="text-sm">
          <Column header="상품정보" style="min-width: 200px">
            <template #body="slotProps">
              <div class="flex flex-col">
                <span class="font-bold">{{ slotProps.data.prod_name }}</span>
                <span class="text-xs text-gray-500"> 제품 유형 : {{ slotProps.data.com_note }} / 제품 코드: {{ slotProps.data.prod_code }} </span>
              </div>
            </template>
          </Column>

          <Column header="규격" style="width: 60px">
            <template #body="slotProps">
              <div class="text-center">{{ slotProps.data.spec_note }} ea</div>
            </template>
          </Column>

          <Column field="delivery_date" header="납기예정일" style="width: 100px" class="text-center"></Column>

          <Column field="ord_priority" header="우선순위" style="width: 60px" class="text-center">
            <template #body="slotProps">
              <div class="text-center">
                <Tag :value="slotProps.data.ord_priority" :severity="getPrioritySeverity(slotProps.data.ord_priority)" />
              </div>
            </template>
          </Column>

          <Column field="ord_amount" header="수량" style="width: 80px" class="text-right">
            <template #body="slotProps"> {{ slotProps.data.ord_amount.toLocaleString() }} ({{ slotProps.data.unit_note }}) </template>
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
      <Button label="닫기" severity="secondary" variant="outlined" class="min-w-[65px]" @click="closeModal" />
    </template>
  </Dialog>
  <Fluid>
    <div class="card">
      <div class="font-semibold text-xl flex justify-between items-center mb-4">
        <div>검색 조건</div>
        <div class="button-group">
          <Button label="초기화" severity="contrast" variant="outlined" class="w-full sm:w-auto" @click="resetBtn" />
        </div>
      </div>
      <table class="w-full border-separate border-spacing-y-4">
        <colgroup>
          <col style="width: 100px" />
          <col />
          <col style="width: 140px" />
          <col />
        </colgroup>
        <tbody>
          <tr>
            <th>주문코드</th>
            <td>
              <IconField>
                <InputIcon class="pi pi-search" />
                <InputText id="search_code" v-model="filters['ord_code'].value" placeholder="주문코드" class="w-full" />
              </IconField>
            </td>

            <th>주문명</th>
            <td>
              <IconField>
                <InputIcon class="pi pi-search" />
                <InputText id="search_name" v-model="filters['ord_name'].value" placeholder="주문명" class="w-full" />
              </IconField>
            </td>

            <th>주문일자 (기간)</th>
            <td colspan="3">
              <div class="flex items-center gap-2">
                <DatePicker v-model="startDate" showIcon dateFormat="yy-mm-dd" placeholder="시작일" class="w-full" />
                <span class="text-gray-500">~</span>
                <DatePicker v-model="endDate" showIcon dateFormat="yy-mm-dd" placeholder="종료일" class="w-full" />
              </div>
            </td>
          </tr>
          <tr>
            <th>거래처</th>
            <td>
              <IconField>
                <InputIcon class="pi pi-search" />
                <InputText id="search_client" v-model="filters['client_name'].value" placeholder="거래처" class="w-full" />
              </IconField>
            </td>

            <th>주문상태</th>
            <td><Select id="search_stat" v-model="filters['ord_stat'].value" placeholder="주문상태 선택" class="w-full" :options="statOptions" option-label="note" option-value="com_value" /></td>
          </tr>
        </tbody>
      </table>
      <!-- <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-end">
        <div class="flex flex-col gap-2">
          <label for="search_code" class="font-bold">주문코드</label>
          <IconField>
            <InputIcon class="pi pi-search" />
            <InputText id="search_code" v-model="filters['ord_code'].value" placeholder="주문코드" class="w-full" />
          </IconField>
        </div>

        <div class="flex flex-col gap-2">
          <label for="search_name" class="font-bold">주문명</label>
          <IconField>
            <InputIcon class="pi pi-search" />
            <InputText id="search_name" v-model="filters['ord_name'].value" placeholder="주문명" class="w-full" />
          </IconField>
        </div>

        <div class="flex flex-col gap-2">
          <label for="search_client" class="font-bold">거래처</label>
          <IconField>
            <InputIcon class="pi pi-search" />
            <InputText id="search_client" v-model="filters['client_name'].value" placeholder="거래처" class="w-full" />
          </IconField>
        </div>

        <div class="flex flex-col gap-2">
          <label for="search_stat" class="font-bold">주문상태</label>
          <Select id="search_stat" v-model="filters['ord_stat'].value" placeholder="주문상태 선택" class="w-full" :options="statOptions" option-label="note" option-value="com_value" />
        </div>

        <div class="flex flex-col gap-2 md:col-span-2 xl:col-span-2">
          <label class="font-bold text-sm">주문일자 (기간)</label>
          <div class="flex items-center gap-2">
            <DatePicker v-model="startDate" showIcon dateFormat="yy-mm-dd" placeholder="시작일" class="w-full" />
            <span class="text-gray-500">~</span>
            <DatePicker v-model="endDate" showIcon dateFormat="yy-mm-dd" placeholder="종료일" class="w-full" />
          </div>
        </div>
      </div> -->
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
            showGridlines
            @row-dblclick="getOrderDetails"
            @filter="onFilter"
          >
            <Column field="ord_code" sortable>
              <template #header>
                <div class="w-full text-center font-bold">주문코드</div>
              </template>
            </Column>
            <Column field="ord_name" sortable>
              <template #header>
                <div class="w-full text-center font-bold">주문명</div>
              </template>
            </Column>
            <Column field="client_name" sortable>
              <template #header>
                <div class="w-full text-center font-bold">거래처명</div>
              </template>
            </Column>
            <Column field="stat_note" sortable>
              <template #header>
                <div class="w-full text-center font-bold">상태</div>
              </template>
            </Column>
            <Column field="ord_date" sortable>
              <template #header>
                <div class="w-full text-center font-bold">주문일자</div>
              </template>
            </Column>
            <Column field="mcode" sortable>
              <template #header>
                <div class="w-full text-center font-bold">작성자</div>
              </template>
              <template #body="slotProps">
                {{ `${slotProps.data.mname} (${slotProps.data.mcode})` }}
              </template>
            </Column>
            <Column field="count">
              <template #header>
                <div class="w-full text-center font-bold">상세건수</div>
              </template>
              <template #body="slotProps">
                <div class="w-full text-center">
                  {{ `${slotProps.data.count} 건` }}
                </div>
              </template>
            </Column>

            <Column field="ord_stat" hidden></Column>
          </DataTable>
          <div class="flex justify-end mt-4">
            <h5>
              총 <span class="text-orange-700 font-bold text-4xl">{{ totalCount }}</span
              >건
            </h5>
          </div>
        </div>
      </div>
    </div>
  </Fluid>
</template>
