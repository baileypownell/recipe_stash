
const { Router } = require('express')
const client = require('../db')
const router = Router()

const upload = require('./services/file-upload')

const singleUpload = upload.single('image')

router.post('/', (req, res) => {
    singleUpload(req, res, function(err) {
        if (err) {
            return res.status(422).send({error: true, message: err})
        }
        return res.json({'imageUrl': req.file.location})
    })
})

module.exports = router;