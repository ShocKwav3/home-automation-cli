const axios = require('axios');


const apiOperationInstnce = (authToken) => axios.create({
    baseURL: 'http://localhost:3000/api',
    //headers: {'Authorization': `Basic ${authToken}`},
    timeout: 5000,
    ...(authToken && {headers: {'Authorization': `Basic ${authToken}`}}),
});


module.exports = {
    apiOperationInstnce,
}