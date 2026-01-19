REST API

1. URI : 자원 / METHOD : 기능

- 게시글 전체조회 boardList : GET | boards : GET
- 게시글 단건조회 boardInfo : GET | boards/bno : GET
- 게시글 등록 boardInsert : POST | boards : POST
- 게시글 수정 boardUpdate : POST | boards/bno : PUT
- 게시글 삭제 baordDelete : GET | boards/bno : DELETE

2. AJAX : 비동기 방식으로 데이터를 주고받는 통신
   => 화면(View)를 제공하지 않음.

3. JSON : 데이터 포맷
   3-1) { 'key' : 'value', 'key' : 'value', 'key' : 'value', ... }
   3-2) [{ 'key' : 'value'}, { 'key' : 'value'}, ...]

# 게시판 REST Server

: 3계층 구조(3-tier Architecture) + MVC2
Presentation Layer : 사용자와 상호작용 ( Router + View )
Business Layer : 순수 기능(서비스)
Persistence Layer : Mapper(DB)
