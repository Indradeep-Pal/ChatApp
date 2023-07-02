const express = require("express");
const dotenv = require("dotenv")
const mongoose = require("mongoose")

const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes');
const messageRoutes=require('./routes/messageRoutes')
const { notFound, ErrorHandler } = require("./middlewares/errorMiddleware");

dotenv.config()

const app = express()

app.use(express.json())


const connect=async()=>{
    try{
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to mongoose');
    }
    catch(err){
        throw(err);
    }
}
mongoose.connection.on('disconnected',()=>{
    console.log("MongoDB disconnected");
})
mongoose.connection.on('connected',()=>{
    console.log("MongoDB connected");
})

app.use('/api/user', userRoutes)

app.use('/api/chat',chatRoutes)

app.use('/api/message',messageRoutes)


app.use(notFound)
app.use(ErrorHandler)


const PORT = process.env.PORT || 5000
const server = app.listen(PORT, ()=>{
    connect();
    console.log("Backend connected");
})

const io= require('socket.io')(server,{
    pingTimeout:6000,
    cors : {
        origin : "http://localhost:3000"
    },
});

io.on("connection",(socket)=>{
    
    socket.on('setup',(userData)=>{
        socket.join(userData._id);
        socket.emit("connected");
    });

    socket.on('join chat',(room)=>{
        socket.join(room);
        
    });

    socket.on('typing',(room)=>{
        socket.in(room).emit('typing');
    })

    socket.on('stop typing', (room) => {
        socket.in(room).emit('stop typing');
    })

    socket.on('new message',(newMessageReceived)=>{
        var chat=newMessageReceived.chat;
        if(!chat.users) return console.log("Chat.users not defined");

        chat.users.forEach(user => {
            if(user._id == newMessageReceived.sender._id) return;
            socket.in(user._id).emit("message received",newMessageReceived);
        });
    })


    socket.off("setup", () => {
        console.log("USER DISCONNECTED");
        socket.leave(userData._id);
    });
    
});


