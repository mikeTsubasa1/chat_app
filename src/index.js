const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage } = require('./utils/messages')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')
const {addUser , removeUser, getUser,getUsersInRoom } = require('./utils/users');
const adminUser = 'Admin'

app.use(express.static(publicDirectoryPath))

io.on('connection', (socket) => {
    console.log('New WebSocket connection')

    socket.on('join',({username,room},callback)=>{
        let {error,user} = addUser(socket.id,username,room);
        if(error){
            return callback(error);
        }
        socket.join(user.room);
        socket.emit('message', generateMessage(adminUser,'Welcome!'))
        socket.broadcast.to(user.room).emit('message', generateMessage(adminUser,`A new user ${user.username} has joined the room ${user.room}!`))    
        callback();
        socket.emit('userdata',{room:user.room,users:getUsersInRoom(user.room)});
    })

    

    socket.on('sendMessage', (message, callback) => {
        const filter = new Filter()

        if (filter.isProfane(message)) {
            return callback('Profanity is not allowed!')
        }
        const user = getUser(socket.id);
        io.to(user.room).emit('message', generateMessage(user.username,message))
        callback()
    })

    socket.on('sendLocation', (coords, callback) => {
        const user = getUser(socket.id);
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username,`https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
        callback()
    })

    socket.on('disconnect', () => {
        const user = getUser(socket.id);
        if(user){
            io.to(user.room).emit('message', generateMessage(adminUser,`user ${user.username} has left!`))
            removeUser(socket.id);
            socket.emit('userdata',{room:user.room,users:getUsersInRoom(user.room)});
        }
    })
})

server.listen(port, () => {
    console.log(`Server is up on port ${port}!`)
})