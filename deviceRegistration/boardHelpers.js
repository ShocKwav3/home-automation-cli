const logHelpers = require('../helpers/logHelpers');


const sanitizeBoardName = (boardName) => boardName.substring(16, boardName.length);
const sanitizeBoardId = (boardId) => boardId.replace('[', '').replace(']', '');
const formatBoardData = (boardData) => boardData.map(board => ({
    boardName: board[0],
    boardId: board[1],
    connectionStatus: board[4],
    isRegistered: false,
}));
const prepareBoardListToShow = (boardDataExisting, boardListFromCliFormatted) => boardListFromCliFormatted.map(board => {
    let boardToShow = board;

    if(boardDataExisting[board.boardId]){
        boardToShow.isRegistered = true;
    }

    return boardToShow;
});

module.exports = {
    sanitizeBoardName,
    sanitizeBoardId,
    formatBoardData,
    prepareBoardListToShow,
}
