const axios = require('axios');


const apiDataFecher = (authToken) => axios.create({
    baseURL: 'http://localhost:3000/api',
    //timeout: 1000,
    ...(authToken && {headers: {'Authorization': authToken}}),
});


module.exports = {
    apiDataFecher,
}