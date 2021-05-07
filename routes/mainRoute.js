const {Router} = require('express');
const router = Router();
const User = require("../models/User");
const MainChat = require("../models/MainChat");
const Chat = require("../models/Chat");
const Message = require("../models/Message");
const {Op} = require("sequelize");


router.get('/', async function (req, res) {
    try {
        const userId = req.session.userId;
        if (!userId) return res.status(400).json({message: "UserId param is undefined"});

        const resChats = await Chat.findAll({
            raw: true,
            where: {
                [Op.or]: [
                    {member1id: userId},
                    {member2id: userId}
                ]
            }
        });

        const resUsers = await User.findAll({raw: true, where: {id: {[Op.ne]: userId}}});

        const user = await User.findOne({raw: true, where: {id: userId}});

        res.status(200).render("index",
            {
                id: userId, username: user.username,
                chats: resChats, users: resUsers
            });

    } catch (err) {
        console.log(err.message)
        res.status(400).json({error: err.message});
    }
})

router.get('/mainChat', async function (req, res) {
    try {
        const msgList = new Array();

        const resData = await MainChat.findAll({raw: true});

        for (var i = 0; i < resData.length; i++) {

            const result1 = await User.findOne({raw: true, where: {id: resData[i].senderid}})
            msgList.push({messageId: resData[i].messageid, text: resData[i].text, username: result1.username});
        }

        res.status(200).render('mainChat', {msgList: msgList});
    } catch (err) {
        res.status(400).json({error: err.message});
    }
})

router.get('/chat/:chatId', async function (req, res) {
    try {
        const chatId = req.params.chatId;
        if (!chatId) return res.status(400).json({message: "ChatId param is undefined"});

        const msgList = new Array();

        const resData = await Message.findAll({raw: true, where: {chatid: chatId}})

        for (var i = 0; i < resData.length; i++) {
            const result1 = await User.findByPk(resData[i].senderid, {raw: true})
            msgList.push({messageId: resData[i].id, text: resData[i].text, username: result1.username});
        }

        const resMembers = await Chat.findByPk(chatId, {raw: true});

        res.status(200).render('chat', {
            msgList: msgList,
            member1: resMembers.member1id,
            member2: resMembers.member2id
        });
    } catch (err) {
        console.log(err.message)
        res.status(400).json({error: err.message});
    }
})

router.post('/chat', async function (req, res) {
    try {
        const member1 = req.body.member1;
        const member2 = req.body.member2;
        if (member1 == null || member2 == null) {
            return res.status(400).json({message: "not all body data received"});
        }

        const resCheck = await Chat.findAll({
            raw: true,
            where: {
                [Op.and]: {
                    [Op.or]: {
                        member1id: member1,
                        member2id: member1
                    },
                    [Op.or]: {
                        member1id: member2,
                        member2id: member2
                    }
                }
            }
        })

        if (resCheck.length > 0) {
            return res.status(200).json({message: "This chat already exists. Please refresh the page."});
        }

        await Chat.create({member1id: member1, member2id: member2}).then(async resCreate => {
            await Message.create({chatid: resCreate.id, senderid: member1, text: 'create chat'})
            res.status(200).json({chatId: resCreate.id})
        })
    } catch (err) {
        console.log(err)
        res.status(400).json({error: err.message});
    }
})


module.exports = router;