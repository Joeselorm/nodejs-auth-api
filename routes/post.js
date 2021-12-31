const router = require('express').Router();
const verify = require('./verifyToken');

router.get('/', verify, (req, res) => {
    res.send(req.user);
    // user.findByOne({_id: req.user._id});
});

module.exports = router;