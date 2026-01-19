<!-- views/Productions/WorkOrderMgt.vue (작업지시서 관리) -->
<!-- 1. 생산계획 불러오기 (prdp_tbl, prdp_d_tbl)-->
<!-- 
  생산 계획을 지정해 작업 지시서를 생성할 수 있으며, 
  생산 계획이 없어도 작업 지시서를 생성할 수 있습니다.
  생산 계획이 선택된다면 생산 계획에 해당하는 제품만 선택이 가능하고,
  생산 라인도 선택된 제품이 사용 가능한 라인만 조회됩니다.
  작업 지시서 불러오기 버튼으로 등록된 작업 지시서를 수정할 수 있습니다 
  -->
  
  <script>

  </script>
  <template>
  <div class="card">
    <!-- 검색  -->
    <div class="flex flex-wrap items-end gap-2 mb-3">
      <div class="flex flex-col gap-1">
        <label class="text-sm">작업지시번호</label>
        <input type="text" v-model="from" class="p-inputtext p-component" />
      </div>

      <div class="flex flex-col gap-1">
        <label class="text-sm">생산계획번호</label>
        <input type="text"" v-model="to" class="p-inputtext p-component" />
      </div>

      <div class="flex flex-col gap-1">
        <label class="text-sm">계획일자</label>
        <input type="date" v-model="to" class="p-inputtext p-component" />
      </div>
    </div>
  </div>
</template>