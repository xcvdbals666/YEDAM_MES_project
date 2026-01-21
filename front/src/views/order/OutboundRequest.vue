<script setup></script>
<template>
  <Fluid class="card">
    <!-- 헤더 -->
    <div class="mb-3 flex align-items-center">
      <span class="text-2xl font-semibold">출고 요청</span>
    </div>
    <div class="button-group">
      <Button label="초기화" severity="contrast" @click="resetSearch" />
      <Button label="조회" severity="warn" @click="handleSearch" />
    </div>
    <!-- 출고요청 조회 테이블 -->
    <table class="w-full">
      <colgroup>
        <col style="width: 100px" />
        <col />
        <col style="width: 140px" />
        <col />
      </colgroup>
      <tbody>
        <tr>
          <th>출고코드</th>
          <td><InputText class="w-full" readonly placeholder="출고번호 선택" /></td>

          <th>주문코드</th>
          <td><InputText class="w-full" readonly placeholder="제품 선택" /></td>
        </tr>
        <tr>
          <th>출고요청일</th>
          <td><InputText class="w-full" readonly placeholder="출고번호 선택" /></td>

          <th>주문일자</th>
          <td><InputText class="w-full" readonly placeholder="제품 선택" /></td>
        </tr>
        <tr>
          <th>거래처</th>
          <td><InputText class="w-full" readonly placeholder="거래처 선택" /></td>

          <th>출고 요청 담당자</th>
          <td><InputText class="w-full" readonly placeholder="담당자 선택" /></td>
        </tr>
      </tbody>
    </table>
  </Fluid>
</template>
<style scoped>
th,
td {
  padding: 8px 0;
  vertical-align: middle;
}
</style>
