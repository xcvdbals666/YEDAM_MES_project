// src/utils/excel.js
// XLSX 라이브러리 import
import * as XLSX from 'xlsx';

// 함수 정의 및 파라미터
export const downloadExcel = (data, headers, mapFunction, fileName) => {
  // 데이터 없을 때 처리
  if (!data || data.length === 0) {
    alert('다운로드할 데이터가 없습니다.');
    return;
  }

  // map으로 데이터 변환
  const mappedData = data.map(mapFunction);
  // 헤더와 데이터 합치기
  const excelData = [headers, ...mappedData];

  // 워크시트 생성
  const ws = XLSX.utils.aoa_to_sheet(excelData);

  // 컬럼 너비 자동 조정
  const colWidths = headers.map((_, i) => {
    const maxLength = Math.max(...excelData.map((row) => String(row[i] || '').length));
    return { wch: Math.min(maxLength + 2, 50) };
  });
  ws['!cols'] = colWidths;

  // 워크북 생성
  const wb = XLSX.utils.book_new();
  // 워크북에 시트 추가
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

  // 오늘 날짜 구하기
  const today = new Date().toISOString().slice(0, 10);
  // 파일 다운로드
  XLSX.writeFile(wb, `${fileName}_${today}.xlsx`);
};
