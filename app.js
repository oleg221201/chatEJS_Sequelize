const http = require('http');
const express = require('express');
const session = require('express-session');
const sequelize = require('./db');

const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server);

const port = process.env.PORT || 3000;
var clients = new Map();

const User = require("./models/User");
const MainChat = require("./models/MainChat");
const Chat = require("./models/Chat");
const Message = require("./models/Message");

io.on('connection', socket => {
    console.log('new connection', socket.id)
    socket.on('join', newUserId => {
        if (newUserId) {
            clients.set(socket.id, JSON.parse(newUserId).userId);
            console.log(clients)
        }
    })

    socket.on("logout", (data) => {
        data=JSON.parse(data);
        clients.delete(socket.id);
        clients.forEach((value, key) => {
            if (value == data.id) {
                console.log("here")
                io.to(key).emit("auth_disconnect");
            }
        })
    })

    socket.on("chat: join", async data => {
        data = JSON.parse(data);
        clients.set(socket.id, data.userId);
        // const res = await db.query(`select member1Id, member2Id from chats where id=${data.chatId};`);
        const res = await Chat.findByPk(data.chatId, {raw: true});
        console.log("join", res)
        if (res.member1id == data.userId || res.member2id == data.userId) {
            socket.join(`chat_${data.chatId}`);
        }
    })

    socket.on("chat: message", async data => {
        data = JSON.parse(data);
        // const sql = `insert into messages (chatId, senderId, text) values (${data.chatId}, ${data.userId}, '${data.message}');`;
        // await db.query(sql);

        await Message.create({chatid: data.chatId, senderid: data.userId, text: data.message});

        // const resUsername = await db.query(`select username from users where id=${data.userId}`);
        // const senderUsername = resUsername.rows[0].username;

        const resUsername = await User.findByPk(data.userId, {raw: true})

        io.to(`chat_${data.chatId}`).emit(`chat_${data.chatId}: mailing`, JSON.stringify({
            senderUsername: resUsername.username,
            message: data.message
        }))
    })

    socket.on("mainChat: message", async data => {
        data = JSON.parse(data);

        await MainChat.create({text: data.message, senderid: data.userId})

        const user = await User.findOne({raw: true, where: {id: data.userId}})

        data = {message: data.message, username: user.username}

        io.emit("mainChat: mailing", JSON.stringify(data));
    })

    socket.on("disconnect", (data) => {
        clients.delete(socket.id)
        socket.disconnect();
        socket.removeAllListeners();
        console.log("disconnect", socket.id)
    })
})

app.use(express.json({extended: true}));
app.use(express.urlencoded({extended: true}));
app.set("view engine", "ejs");

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.header("Access-Control-Allow-Headers", "x-access-token, Origin, X-Requested-With, Content-Type, Accept, Authorization");
    next();
});

app.use(session({
    name: "session",
    secret: "very_secret_key",
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 2, //two hours
        sameSite: true
    }
}));

const checkAuth = (req, res, next) => {
    if (!req.session.userId) {
        res.redirect('/auth/registration');
    } else {
        next();
    }
}

app.use('/auth', require('./routes/auth'));
app.use('/', checkAuth, require('./routes/mainRoute'));
app.use('*', (req, res) => {res.send("Page not found 404");});


async function startApp () {
    try {
        await sequelize.sync()
        server.listen(port, () => {
            console.log(`Server has been started on port ${port} ...`)
        })
    } catch (err) {
        console.log(err.message)
        process.exit(1)
    }
}

startApp()