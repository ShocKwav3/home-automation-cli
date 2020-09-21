const consoleHelpers = require('./consoleHelpers');
const logHelpers = require('../helpers/logHelpers');


const user = process.env.USER;
const sayWelcome = logHelpers.printLog(`
  ---------------------------------------------------------
  |  Moro, ${logHelpers.stylers.values(user)}!
  |
  |  You're running the REPL in
  |     => ${logHelpers.stylers.values(process.cwd())}
  |
  |  Node version: ${logHelpers.stylers.values(process.version)}
  |
  |  Enter ${logHelpers.stylers.values('.exit')} to terminate anytime!
  ----------------------------------------------------------
`);

const sayLoginMessage = logHelpers.printLog(`
Let's get you logged in to the system first...
`);

const sayOptions = logHelpers.printLog(`

  1. Register new board
  2. Update board token

`);


module.exports = {
    user,
    sayWelcome,
    sayOptions,
    sayLoginMessage,
}
