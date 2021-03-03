const axios = require('axios')

const verifyUserSession = async() => {
    return await axios.get('/auth')
}

export { verifyUserSession }