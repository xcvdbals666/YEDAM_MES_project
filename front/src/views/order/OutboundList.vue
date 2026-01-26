<!-- /src/viewsds/order/OutboundList.vue -->
<script setup>
import { onMounted, ref, watch, computed } from 'vue';
import { useOrderStore2 } from '@/stores/order2';
import SelectManagerModal from '@/components/order/SelectManagerModal.vue';
import SelectOutModal from '@/components/order/SelectOutModal.vue';
import SelectProductModal from '@/components/order/SelectProductModal.vue';
import SelectVendorModal from '@/components/order/SelectVendorModal.vue';
import { downloadExcel } from '@/utils/excel';

const orderStore = useOrderStore2();

// 전체 조회
onMounted(async () => {
  await orderStore.fetchOutbound(); // 파라미터 없으면 전체 조회
  console.log('store :', orderStore.outboundList);
});

// 검색 조건 (API 전송용 + 화면 표시용)
const searchParams = ref({
  outCode: '', // 출고번호
  prodCode: '', // 제품코드
  prodName: '', // 제품명 (입력 필드 표시용)
  outQtyStart: '', // 수량 시작
  outQtyEnd: '', // 수량 끝
  empCode: '', // 사원코드
  empName: '', // 사원명 (입력 필드 표시용)
  dateStart: null, // 날짜 시작
  dateEnd: null, // 날짜 끝
  vendorCode: '', // 거래처코드
  vendorName: '' // 거래처명 (입력 필드 표시용)
});

// 에러 메시지 상태
const errors = ref({
  outQty: '',
  date: ''
});

// 출고요청 코드별로 그룹화 (computed)
const groupedOutboundList = computed(() => {
  const grouped = {};

  orderStore.outboundList.forEach((item) => {
    // 새로운 출고요청 그룹 생성
    if (!grouped[item.out_req_code]) {
      grouped[item.out_req_code] = {
        out_req_code: item.out_req_code,
        out_req_date: item.out_req_date,
        ord_amount: 0,
        emp_name: item.emp_name,
        client_name: item.client_name,
        out_req_stat: item.out_req_stat,
        products: [],
        outbnd_qtt: 0, // 실출고 수량 합계
        un_qtt: 0 // 미출고 수량 합계
      };
    }

    // 제품 추가
    grouped[item.out_req_code].products.push(item.prod_name);

    // 수량 합산
    grouped[item.out_req_code].ord_amount += item.ord_amount || 0;
    grouped[item.out_req_code].outbnd_qtt += item.outbnd_qtt || 0;
  });

  // 제품명 표시 형식 변환
  return Object.values(grouped).map((group) => ({
    ...group,
    un_qtt: group.ord_amount - group.outbnd_qtt, // 주문수량 - 실출고수량
    prod_display: group.products.length > 1 ? `${group.products[0]} 외 ${group.products.length - 1}건` : group.products[0]
  }));
});

// 수량 실시간 검증
watch(
  () => [searchParams.value.outQtyStart, searchParams.value.outQtyEnd],
  () => {
    if (searchParams.value.outQtyStart && searchParams.value.outQtyEnd) {
      const start = Number(searchParams.value.outQtyStart);
      const end = Number(searchParams.value.outQtyEnd);

      if (start > end) {
        errors.value.outQty = '최소 수량이 최대 수량보다 클 수 없습니다.';
      } else {
        errors.value.outQty = '';
      }
    } else {
      errors.value.outQty = '';
    }
  }
);

// 날짜 실시간 검증
watch(
  () => [searchParams.value.dateStart, searchParams.value.dateEnd],
  () => {
    if (searchParams.value.dateStart && searchParams.value.dateEnd) {
      const startDate = new Date(searchParams.value.dateStart);
      const endDate = new Date(searchParams.value.dateEnd);

      if (startDate > endDate) {
        errors.value.date = '시작일이 종료일보다 이후일 수 없습니다.';
      } else {
        errors.value.date = '';
      }
    } else {
      errors.value.date = '';
    }
  }
);

// 모달 visible 상태들
const showOutModal = ref(false);
const showProductModal = ref(false);
const showEmpModal = ref(false);
const showVendorModal = ref(false);

// 모달 열기 함수들
const openOutModal = () => {
  showOutModal.value = true;
};

const openProductModal = () => {
  showProductModal.value = true;
};

const openEmpModal = () => {
  showEmpModal.value = true;
};

const openVendorModal = () => {
  showVendorModal.value = true;
};

// 모달에서 선택 시
const selectOut = (out) => {
  searchParams.value.outCode = out.out_req_code;
};

const selectProduct = (product) => {
  searchParams.value.prodCode = product.prod_code;
  searchParams.value.prodName = product.prod_name;
};

const selectEmployee = (emp) => {
  searchParams.value.empCode = emp.emp_code;
  searchParams.value.empName = emp.emp_name;
};

const selectVendor = (vendor) => {
  searchParams.value.vendorCode = vendor.client_code;
  searchParams.value.vendorName = vendor.client_name;
};

// 초기화
const resetSearch = async () => {
  searchParams.value = {
    outCode: '',
    prodCode: '',
    prodName: '',
    outQtyStart: '',
    outQtyEnd: '',
    empCode: '',
    empName: '',
    dateStart: null,
    dateEnd: null,
    vendorCode: '',
    vendorName: ''
  };
  errors.value = {
    outQty: '',
    date: ''
  };

  // 초기화 후 전체 조회
  try {
    await orderStore.fetchOutbound();
    page.value = 1;
  } catch (error) {
    console.error('전체 조회 실패:', error);
  }
};

// 조회 버튼 클릭 시
const handleSearch = async () => {
  // 에러가 있으면 조회 중단
  if (errors.value.outQty || errors.value.date) {
    return;
  }

  // 검증 통과 후 API 호출
  try {
    await orderStore.fetchOutbound(searchParams.value);
    page.value = 1;
  } catch (error) {
    console.error('검색 실패:', error);
  }
};

// 페이지네이션
const page = ref(1);
const rows = ref(10);

// 페이지 변경
const onPageChange = (e) => {
  page.value = e.page + 1;
  rows.value = e.rows;
  selectedRows.value = [];
};

// checkbox
const selectedRows = ref([]);

// 출고 상태 변환
const statusMap = {
  r1: { label: '출고 대기', severity: 'danger' },
  r2: { label: '부분 출고', severity: 'warn' },
  r3: { label: '출고 완료', severity: 'success' },
  r4: { label: '요청 취소', severity: 'secondary' }
};

// 날짜 포맷
const formatDate = (v) => {
  if (!v) return '-';
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return v;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}.${m}.${day}`;
};

/**
 * 엑셀 다운로드
 * 현재 조회된 출고 목록을 엑셀 파일로 다운로드
 * 파일명: 출고조회_YYYY-MM-DD.xlsx
 */
const handleExcelDownload = () => {
  // 엑셀 파일의 컬럼명 (순서 중요)
  const headers = ['출고번호', '출고제품', '주문수량', '실출고 수량', '미출고 수량', '출고요청일', '출고담당자', '거래처', '상태'];

  // 각 출고 데이터를 엑셀 행으로 변환
  // 주의: headers 배열 순서와 동일하게 매핑해야 함
  const mapFunction = (item) => [item.out_req_code, item.prod_display, item.ord_amount, item.outbnd_qtt, item.un_qtt, formatDate(item.out_req_date), item.emp_name, item.client_name, statusMap[item.out_req_stat]?.label || item.out_req_stat];

  // 엑셀 다운로드 실행
  downloadExcel(selectedRows.value.length > 0 ? selectedRows.value : groupedOutboundList.value, headers, mapFunction, '출고조회');
};
</script>
<template>
  <Fluid class="card">
    <!-- 헤더 -->
    <div class="header-section">
      <div class="text-2xl font-semibold">출고 조회</div>
      <div class="button-group">
        <Button label="초기화" icon="pi pi-undo" severity="secondary" @click="resetSearch" />
        <Button label="조회" icon="pi pi-search" severity="" @click="handleSearch" />
      </div>
    </div>
    <!-- 검색 테이블 -->
    <table class="w-full">
      <colgroup>
        <col style="width: 100px" />
        <col />
        <col style="width: 100px" />
        <col />
        <col style="width: 100px" />
        <col />
        <col style="width: 100px" />
        <col />
      </colgroup>
      <tbody>
        <tr>
          <th>출고번호</th>
          <td><InputText class="w-full" v-model="searchParams.outCode" @click="openOutModal" readonly placeholder="출고번호 선택" /></td>

          <th>출고제품</th>
          <td><InputText class="w-full" v-model="searchParams.prodName" @click="openProductModal" readonly placeholder="제품 선택" /></td>

          <th>출고수량</th>
          <td colspan="3">
            <div class="flex align-items-center gap-2">
              <InputText class="w-full" v-model="searchParams.outQtyStart" type="number" placeholder="최소" :class="{ 'p-invalid': errors.outQty }" />
              <span>~</span>
              <InputText class="w-full" v-model="searchParams.outQtyEnd" type="number" placeholder="최대" :class="{ 'p-invalid': errors.outQty }" />
            </div>
            <small v-if="errors.outQty" class="p-error" style="display: block; margin-top: 4px">{{ errors.outQty }}</small>
          </td>
        </tr>
        <tr>
          <th>출고 담당자</th>
          <td><InputText class="w-full" v-model="searchParams.empName" @click="openEmpModal" readonly placeholder="담당자 선택" /></td>

          <th>거래처</th>
          <td><InputText class="w-full" v-model="searchParams.vendorName" @click="openVendorModal" readonly placeholder="거래처 선택" /></td>

          <th>출고일자</th>
          <td colspan="3">
            <div class="flex align-items-center gap-2">
              <DatePicker class="w-full" :showIcon="true" :showButtonBar="true" v-model="searchParams.dateStart" placeholder="시작일" :class="{ 'p-invalid': errors.date }" />
              <span>~</span>
              <DatePicker class="w-full" :showIcon="true" :showButtonBar="true" v-model="searchParams.dateEnd" placeholder="종료일" :class="{ 'p-invalid': errors.date }" />
            </div>
            <small v-if="errors.date" class="p-error" style="display: block; margin-top: 4px">{{ errors.date }}</small>
          </td>
        </tr>
      </tbody>
    </table>
  </Fluid>

  <!-- 목록 -->
  <Fluid class="flex flex-col flex-1 bg-white px-6 pt-6 pb-6 rounded-xl shadow-sm border border-gray-200">
    <div class="flex justify-between items-center">
      <p class="text-lg font-bold text-gray-800">검색 결과</p>

      <div class="flex gap-2 pb-6">
        <Button label="엑셀 다운로드" raised icon="pi pi-file-excel" @click="handleExcelDownload" />
      </div>
    </div>

    <div class="flex-1 overflow-auto rounded-lg border border-gray-200">
      <DataTable :value="groupedOutboundList" v-model:selection="selectedRows" dataKey="out_req_code" :paginator="true" :rows="rows" :rowHover="true" showGridlines @page="onPageChange" :selectionPageOnly="true" tableLayout="fixed">
        <template #empty>
          <div class="text-center py-6 text-gray-400">데이터 없음</div>
        </template>

        <Column selectionMode="multiple" headerStyle="width:28px" />

        <Column header="출고요청 코드" headerClass="table-header" bodyClass="table-body" style="width: 150px">
          <template #body="{ data }">
            {{ data.out_req_code }}
          </template>
        </Column>

        <Column header="출고 제품" headerClass="table-header" bodyClass="table-body" style="width: 200px">
          <template #body="{ data }">
            {{ data.prod_display }}
          </template>
        </Column>

        <Column header="주문 수량" headerClass="table-header" bodyClass="table-body" style="width: 100px">
          <template #body="{ data }">
            {{ data.ord_amount }}
          </template>
        </Column>

        <Column header="실출고 수량" headerClass="table-header" bodyClass="table-body" style="width: 100px">
          <template #body="{ data }">
            {{ data.outbnd_qtt }}
          </template>
        </Column>

        <Column header="미출고 수량" headerClass="table-header" bodyClass="table-body" style="width: 100px">
          <template #body="{ data }">
            {{ data.un_qtt }}
          </template>
        </Column>

        <Column header="출고 요청일" headerClass="table-header" bodyClass="table-body" style="width: 100px">
          <template #body="{ data }">
            {{ formatDate(data.out_req_date) }}
          </template>
        </Column>

        <Column header="출고 담당자" headerClass="table-header" bodyClass="table-body" style="width: 100px">
          <template #body="{ data }">
            {{ data.emp_name }}
          </template>
        </Column>

        <Column header="거래처" headerClass="table-header" bodyClass="table-body" style="width: 100px">
          <template #body="{ data }">
            {{ data.client_name }}
          </template>
        </Column>

        <Column header="상태" headerClass="table-header" bodyClass="table-body" style="width: 80px">
          <template #body="{ data }">
            <Tag :value="statusMap[data.out_req_stat]?.label || '알수없음'" :severity="statusMap[data.out_req_stat]?.severity || 'info'" rounded />
          </template>
        </Column>
      </DataTable>
    </div>
  </Fluid>
  <SelectOutModal v-model:visible="showOutModal" @select="selectOut" />
  <SelectProductModal v-model:visible="showProductModal" @select="selectProduct" />
  <SelectManagerModal v-model:visible="showEmpModal" @select="selectEmployee" />
  <SelectVendorModal v-model:visible="showVendorModal" @select="selectVendor" />
</template>
<style scoped>
:deep(.p-datatable-thead > tr > th) {
  background-color: #f9fafb;
  font-weight: 600;
  color: #374151;
}

:deep(.p-datatable-tbody > tr:hover) {
  background-color: #f3f4f6;
}

:deep(.table-header .p-datatable-column-header-content) {
  justify-content: center;
}

:deep(.table-body) {
  text-align: center;
  color: #374151;
}

:deep(.status-tag) {
  font-size: 0.8rem;
  padding: 0.35rem 0.75rem;
}

th,
td {
  padding: 8px 0;
  vertical-align: middle;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.button-group {
  display: flex;
  gap: 10px;
}

.button-group :deep(.p-button) {
  width: auto;
  min-width: auto;
  padding: 7px 15px;
}

.p-error {
  color: #e24c4c;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

:deep(.p-invalid) {
  border-color: #e24c4c;
}

:deep(.p-invalid:focus) {
  border-color: #e24c4c;
  box-shadow: 0 0 0 0.2rem rgba(226, 76, 76, 0.25);
}
</style>
