const magicParser = require('../api_integration/get_api_data.js');
const express = require('express');
const DataRoute = require('../models/dataModel');
const auth = require('../middleware/auth');
const send = require('../broker/send');
const receive = require('../broker/receive');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

router.post('/data', auth, async (req, res) => {
    try {
        const {from, to, stream} = req.body;
        const apiData = await magicParser(from, to, stream);
        for await(const d of apiData) {
            send(d.date + ' ' + d.value);
            const data = new DataRoute({value: d.value, date: d.date});
            await data.save();
        }
        res.status(201).send({apiData})
    } catch (error) {
        res.status(400).send(error)
    }
});
router.post('/data/subscribe', auth, async (req, res) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        const data = jwt.verify(token, process.env.JWT_KEY);
        const user = await User.findOne({_id: data._id, 'tokens.token': token});
        if (!user) {
            throw new Error()
        }
        receive(user.email);
        res.status(201).send('Successfully subscribed')
    } catch (error) {
        res.status(400).send(error)
    }
});
module.exports = router;
