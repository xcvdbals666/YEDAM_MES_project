<script setup></script>
<template>
  <div class="card">
    <div>생산계획</div>
    <table>
      <colgroup>
        <col class="w-30 text-left" />
        <col class="w-115" />
        <col class="w-30 text-left" />
        <col class="w-115" />
      </colgroup>
      <tbody>
        <tr>
          <th>생산계획코드</th>
          <td><InputText placeholder="생산계획코드" class="w-full" readonly></InputText></td>
          <th>계획명</th>
          <td><InputText class="w-full"></InputText></td>
        </tr>
        <tr>
          <th>계획일자</th>
          <td><DatePicker :showIcon="true" :showButtonBar="true" v-model="calendarValue" readonly></DatePicker></td>
          <th>작성자</th>
          <td><InputText class="w-full" readonly></InputText></td>
        </tr>
        <tr>
          <th>계획시작일</th>
          <td><DatePicker :showIcon="true" :showButtonBar="true" v-model="calendarValue" placeholder="날짜 선택" class="w-full"></DatePicker></td>
          <th>계획종료일</th>
          <td><DatePicker :showIcon="true" :showButtonBar="true" v-model="calendarValue" placeholder="날짜 선택" class="w-full"></DatePicker></td>
        </tr>
        <tr>
          <th>주문코드</th>
          <td><InputText placeholder="검색" class="w-full"></InputText></td>
          <th>납기일자</th>
          <td><DatePicker :showIcon="true" :showButtonBar="true" v-model="calendarValue" placeholder="날짜 선택" class="w-full"></DatePicker></td>
        </tr>
        <tr>
          <th>비고</th>
          <td><InputText placeholder="특이사항 입력" class="w-full"></InputText></td>
          <th></th>
          <td></td>
        </tr>
      </tbody>
    </table>
  </div>
  <div class="card">
    <div>제품</div>
  </div>
</template>
