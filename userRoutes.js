const express = require('express')
const {registerUser,loginUser, allUser} = require('../controllers/userController')
const { protect } = require('../middlewares/authMiddleware')
const router = express.Router()


router.post('/',registerUser,(req,res)=>{})

router.post('/login',loginUser,(req,res)=>{})

router.get('/',protect,allUser)

module.exports = router;