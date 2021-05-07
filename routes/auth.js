const {Router} = require('express');
const router = Router();
const User = require('../models/User');

const checkAuth = (req, res, next) => {
    if (req.session.userId) {
        res.redirect('/');
    } else {
        next();
    }
}

router.get('/registration', checkAuth, (req, res) => {
    res.render('registration.ejs');
})

router.get('/login', checkAuth, (req, res) => {
    res.render('login.ejs');
})

router.post('/registration', async function (req, res) {
    try {
        if (!req.body.email || !req.body.password || !req.body.username) {
            return res.status(400).json({message: "Not all data was sent"});
        }

        // const selectSQL = `select count(*) as count from users where email='${req.body.email}' or username='${req.body.username}';`;
        // const selectResult = await db.query(selectSQL);

        // if (selectResult.rows[0].count !== '0') {
        //     return res.status(400).json({message: "Email or username is already used"});
        // }

        if (await User.findOne({where: {email: req.body.email}}) ||
            await User.findOne({where: {username: req.body.username}})) {
            return res.status(400).json({message: "Email or username is already used"});
        }

        // const insertSQL = `insert into users (email, password, username) values ('${req.body.email}','${req.body.password}','${req.body.username}')`
        // await db.query(insertSQL);
        //
        // const insertResult = await db.query(`select * from users where email='${req.body.email}'`)
        //
        // req.session.userId = insertResult.rows[0].id;

        await User.create({email: req.body.email, password: req.body.password,
            username: req.body.username}).then(result => {
            req.session.userId = result.id
        })

        res.status(200).redirect('/');
    } catch (err) {
        console.log(err)
        res.status(400).json({error: err.message});
    }
})

router.post('/login', async function (req, res) {
    try {
        if (!req.body.email || !req.body.password) {
            return res.status(400).json({message: "Not all data was sent"});
        }

        // const selectSQL = `select * from users where email='${req.body.email}';`;
        // const selectResult = await db.query(selectSQL);

        // if (!selectResult.rows[0] || selectResult.rows[0].password !== req.body.password) {
        //     return res.status(400).json({message: "Incorrect input data"});
        // }

        const user = await User.findOne({raw: true, where: {email: req.body.email}});

        if (!user || user.password !== req.body.password) {
            return res.status(400).json({message: "Incorrect input data"});
        }

        req.session.userId = user.id;

        res.status(200).redirect('/');
    } catch (err) {
        res.status(400).json({error: err.message});
    }
})

router.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) return res.status(400).json({error: err, logout: false});

        res.clearCookie("session");
        res.redirect('/')
    })
})


module.exports = router;