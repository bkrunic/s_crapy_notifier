const express = require('express');
const UserRoute = require('../models/userModel');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/register', async (req, res) => {
    // Create a new user
    try {
        const user = new UserRoute(req.body);
        await user.save();
        const token = await user.generateAuthToken();
        res.status(201).send({user, token})
    } catch (error) {
        res.status(400).send(error)
    }
});

router.post('/users/login', async (req, res) => {
    //Login a registered user
    try {
        const {email, password} = req.body;
        const user = await UserRoute.findByCredentials(email, password);
        if (!user) {
            return res.status(401).send({error: 'Login failed! Check authentication credentials'})
        }
        const token = await user.generateAuthToken();
        res.send({user, token})
    } catch (error) {
        res.status(400).send(error)
    }

});

router.get('/users/me', auth, async (req, res) => {
    // View logged in user profile
    res.send(req.user)
});


router.get('/users/me/logout', auth, async (req, res) => {
    // Log user out of the application
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token != req.token
        });
        await req.user.save();
        res.send()
    } catch (error) {
        res.status(500).send(error)
    }
});

router.get('/users/me/logoutall', auth, async (req, res) => {
    // Log user out of all devices
    try {
        req.user.tokens.splice(0, req.user.tokens.length);
        await req.user.save();
        res.send()
    } catch (error) {
        res.status(500).send(error)
    }
});

module.exports = router;
