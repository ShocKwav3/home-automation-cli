const _ = require('lodash');
const fileSystem = require('fs');

const messages = require('./messages');
const cliOperations = require('./cliOperations');
const boardHelpers = require('./boardHelpers');
const { apiDataFecher } = require('./apiDataFetcher');


messages.sayWelcome();
messages.sayLoginMessage();

cliOperations.getLoginCredentials()
             .then(credentials => {
                console.log(JSON.stringify(credentials))

                apiDataFecher()
                    .post('/v1/users/login', {user_email: credentials.useremail, password: credentials.password})
                    .then(response => {
                       console.log(response)
                    })
             });

const continueAfterLogin = () => {
    let boardDataExisting = {};
    const boardDataExistingFilePath = './deviceRegistration/boardData.json';

    if(!fileSystem.existsSync(boardDataExistingFilePath)){
        console.log(`Local data file does not exists. (Creating...)`);
        fileSystem.writeFileSync(boardDataExistingFilePath, JSON.stringify(boardDataExisting))
        console.log(`Created`);
    } else {
        boardDataExisting = JSON.parse(fileSystem.readFileSync(boardDataExistingFilePath));
        console.log('Local data file found and loaded!')
    }

    const boardFetcherSpinner = cliOperations.runSpinner('Getting boards: connected and disconnected for both registered and unregistered');
    boardFetcherSpinner.start();

    (async function() {
        const boardListFromCli = await cliOperations.getCliData('particle list | grep -i photon');
        const boardListFromCliParsed = cliOperations.parseCliData(boardListFromCli.stdout, boardDataSanitizers);
        const boardListFromCliFormatted = boardHelpers.formatBoardData(boardListFromCliParsed);
        const boardListToShow = boardHelpers.prepareBoardListToShow(boardDataExisting, boardListFromCliFormatted);
        //console.log('CIAO', JSON.stringify(userTokenFromCliParse));
        boardFetcherSpinner.stop();

        const boardListTable = cliOperations.initializeTable(['Board name', 'Board id', 'Connection status', 'Registration status']);
        _.forEach(boardListToShow, (board) => {
            boardListTable.push([
                board.boardName,
                board.boardId,
                board.connectionStatus,
                board.isRegistered,
            ]);
        });
        console.log(boardListTable.toString());
    }());
}

const boardDataSanitizers = {
    0: boardHelpers.sanitizeBoardName,
    1: boardHelpers.sanitizeBoardId,
}


//readline.question('We will go thr', )
