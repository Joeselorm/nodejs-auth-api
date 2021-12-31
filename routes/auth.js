const router = require('express').Router();
const User = require('../model/User');
const { registerValidation, loginValidation } = require('../validation');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


router.post('/register', async(req, res) => {
    // Validate data before submission to database
    const { error } = registerValidation(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    // Check for user duplication in the database
    const emailExist = await User.findOne({email: req.body.email});
    if(emailExist) return res.status(400).send('Email already exists');

    // Password hashing/encryption
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    // Create a new user
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword
    });

    // Submission to database
    try {
        const savedUser = await user.save();
        res.send({user: user._id});
    } catch (err) {
        res.status(400).send(err);
    }
});

// Login
router.post('/login', async (req, res) => {
    // Validate data before submission to database
    const { error } = loginValidation(req.body);
    if(error) return res.status(400).send(error.details[0].message);
    
    // Check if email exist in the database
    const user = await User.findOne({email: req.body.email});
    if(!user) return res.status(400).send('Email not found!');

    // Check if password is correct
    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if(!validPassword) return res.status(400).send('Invalid password');

    // Create and assign token with jwt
    const token = jwt.sign({_id: user._id}, process.env.TOKEN_SECRET, {expiresIn: '1h'});
    res.header('auth-token', token).send(token);

    // res.send('Success! Logged in')

});

// Logout
router.post('/logout', async (req, res) => {
    // Create and assign token with jwt
    const token = jwt.sign({_id: ''}, process.env.TOKEN_SECRET, {expiresIn: '1s'});
    res.header('auth-token', '').send('logged out');
});

module.exports = router;
