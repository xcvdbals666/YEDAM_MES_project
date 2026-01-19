// Table : board

// 전체조회
const selectAll = `
SELECT board_id
        , title
        , content
        , author
        , create_date
FROM board
ORDER BY board_id`;

// 단건조회
const selectById = `
SELECT board_id
        , title
        , content
        , author
        , create_date
FROM board
WHERE board_id = ?`;

// 단건 등록
const insertInfo = `
INSERT INTO board (title, content, author)
VALUES ( ?, ?, ?)`;

// 단건 수정
const updateInfo = `
UPDATE board
   SET title = ?
      , content = ?
      , author = ?
WHERE board_id = ?
`;

// 단건 삭제
const delInfo = `
DELETE FROM board
WHERE board_id = ?
`;
module.exports = {
  selectAll,
  selectById,
  insertInfo,
  updateInfo,
  delInfo,
};
