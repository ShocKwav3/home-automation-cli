var table = require('cli-table3');
const { promisify } = require('util');
const execute = promisify(require('child_process').exec);
const spinner = require('clui').Spinner;
const inquirer = require('inquirer');


const getCliData = (command) => execute(command);

const parseCliData = (stdout, sanitzers = {}) => stdout.split('\n').filter(item => item.length!=0).map(item => {
    return item.split(' ').map((item, index) => {
        return sanitzers[index] ? sanitzers[index](item) : item
    })
});

const runSpinner = (message) => new spinner(message,  ['◜','◠','◝','◞','◡','◟']);

const initializeTable = (header) => {
    return new table({
        head: header,
        chars: {
            'top': '═' , 'top-mid': '╤' , 'top-left': '╔' , 'top-right': '╗',
            'bottom': '═' , 'bottom-mid': '╧' , 'bottom-left': '╚' , 'bottom-right': '╝',
            'left': '║' , 'left-mid': '╟' , 'mid': '─' , 'mid-mid': '┼',
            'right': '║' , 'right-mid': '╢' ,
            'middle': '│',
        }
    });
}

const getLoginCredentials = () => {
    return inquirer.prompt([
        {
            name: 'useremail',
            type: 'input',
            message: 'Enter your e-mail address: ',
            validate: function( value ) {
                if (value.length) {
                    return true;
                } else {
                    return 'Please enter your e-mail address';
                }
            }
        },
        {
            name: 'password',
            type: 'password',
            message: 'Enter your password: ',
            validate: function(value) {
                if (value.length) {
                    return true;
                } else {
                    return 'Please enter your password';
                }
            }
        }
    ]);
}

module.exports = {
    getCliData,
    parseCliData,
    runSpinner,
    initializeTable,
    getLoginCredentials,
}
