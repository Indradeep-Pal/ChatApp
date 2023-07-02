const express = require('express')
const { protect } = require('../middlewares/authMiddleware');
const { accessChat,fetchChat, createGroupChat, renameGroupChat, addToGroup, removeFromGroup } = require('../controllers/chatController');

const router = express.Router()


router.post('/',protect,accessChat)
router.get('/', protect, fetchChat)
router.post('/group', protect, createGroupChat)
router.put('/rename', protect, renameGroupChat)
router.put('/groupremove',protect,removeFromGroup)
router.put('/groupadd',protect,addToGroup)

module.exports=router;
