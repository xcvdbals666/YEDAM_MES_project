// 전체조회
const selectAll = `SELECT board_id
        , title
        , content
        , author
        , create_date
FROM board
ORDER BY board_id`;

module.exports = {
  selectAll,
};
