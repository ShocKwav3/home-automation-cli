const _ = require('lodash');

const messages = require('./messages');
const cliOperations = require('./cliOperations');
const boardHelpers = require('./boardHelpers');
const { apiOperationInstnce } = require('./apiOperations');


messages.sayWelcome();
messages.sayLoginMessage();

startLoginProcess();

const spinner = cliOperations.runSpinner();
const boardProgressBar = cliOperations.getProgressBar('Boards');

async function startLoginProcess () {
    try {
        const credentials = await cliOperations.getLoginCredentials();
        const userDetails = await apiOperationInstnce().post('/v1/users/login', {user_email: credentials.useremail, password: credentials.password});

        resolveAllBoards(userDetails.data.data);
    } catch (error) {
        const userChoice = await cliOperations.loginTryAgain();

        if (userChoice.retryLogin) {
            startLoginProcess();
        } else {
            console.log('Exiting...');
            process.exit(1);
        }
    }
}

async function resolveAllBoards(userDetail) {
    spinner.message('Fetching registered boards from server');
    spinner.start();

    const boardListFromServer = await apiOperationInstnce(userDetail.token).get('/v1/boards');

    spinner.stop();

    showBoardsList(userDetail, boardListFromServer.data.data);
}

async function showBoardsList (userDetail, boardListFromServer) {
    spinner.message('Getting boards: connected and disconnected for both registered and unregistered');
    spinner.start();

    const boardListFromCli = await cliOperations.getCliData('particle list | grep -i photon');
    const boardListFromCliParsed = cliOperations.parseCliData(boardListFromCli.stdout, boardDataSanitizers);
    const boardListFromCliFormatted = boardHelpers.formatBoardData(boardListFromCliParsed);
    const boardList = boardHelpers.prepareBoardList(boardListFromServer, boardListFromCliFormatted);
    spinner.stop();

    const boardListTable = cliOperations.initializeTable(boardHelpers.boardsTableHeader);
    _.forEach(boardList, (board) => {
        boardListTable.push([
            board.boardName,
            board.boardId,
            board.connectionStatus,
            board.isRegistered,
        ]);
    });
    console.log(boardListTable.toString());

    showOptionsPicker(userDetail, boardList);
}

async function showOptionsPicker(userDetail, boardList) {
    const choice = await cliOperations.optionsPicker();

    switch(choice.option) {
        case 'Register boards':
            registerBoard(userDetail, boardList);
            break;
        case 'Unregister boards':
            unregisterBoards(userDetail, boardList);
            break;
        case 'Update token':
            updateBoardTokens(userDetail, boardList);
            break;
        case 'Exit':
            process.exit(2);
            break;
    }
}

async function registerBoard(userDetail, boardList) {
    const unregisteredBoards = boardList.filter(board => !board.isRegistered)
    const userPickedBoards = await cliOperations.boardSelection(unregisteredBoards);
    const boardsToRegister = boardList.filter(board => userPickedBoards.selectedboards.includes(board.boardName));
    const userToken = await cliOperations.userTokenInput();

    boardProgressBar.start(boardsToRegister.length, 0, {operation: 'Registration'});
    _.forEach(boardsToRegister, async board => {
        await apiOperationInstnce(userDetail.token).post('/v1/boards', {
            user_id: userDetail.id,
            board_id: board.boardId,
            board_name: board.boardName,
            board_user_token: userToken.boardUserToken,
            added_timestamp: new Date().toISOString(),
        });
        boardProgressBar.increment(1);
    });
}

async function unregisterBoards(userDetail, boardList) {
    const registeredBoard = boardList.filter(board => board.isRegistered);
    const userPickedBoards = await cliOperations.boardSelection(registeredBoard);
    const boardsToUnregiser = boardList.filter(board => userPickedBoards.selectedboards.includes(board.boardName));

    boardProgressBar.start(boardsToUnregiser.length, 0, {operation: 'Unregistration'});
    _.forEach(boardsToUnregiser, async board => {
        await apiOperationInstnce(userDetail.token).delete(`/v1/boards/${board.id}`);
        boardProgressBar.increment(1);
    });
}

async function updateBoardTokens(userDetail, boardList) {
    const registeredBoard = boardList.filter(board => board.isRegistered);
    const userPickedBoards = await cliOperations.boardSelection(registeredBoard);
    const userToken = await cliOperations.userTokenInput();
    const boardsToUpdateToken = boardList.filter(board => userPickedBoards.selectedboards.includes(board.boardName));

    boardProgressBar.start(boardsToUpdateToken.length, 0, {operation: 'Token update'});
    _.forEach(boardsToUpdateToken, async board => {
        await apiOperationInstnce(userDetail.token).put(`/v1/boards/${board.id}`, {
            board_user_token: userToken.boardUserToken,
        });
        boardProgressBar.increment(1);
    });
}

const boardDataSanitizers = {
    0: boardHelpers.sanitizeBoardName,
    1: boardHelpers.sanitizeBoardId,
}
