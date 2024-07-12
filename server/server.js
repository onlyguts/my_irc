const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors')

const app = express();

const ChatSave = []
const Users = []
let Room = [{ owner: 'admin', channel: 'main' }]
const RoomsUsers = []

app.use(cors({
  origin: '*'
}));

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
  }
});

io.on('connection', (socket) => {

  console.log('New user connected');
  io.emit('sendArray', ChatSave);
  io.emit('sendUser', Users);
  io.emit('sendChannel', Room);

  socket.on('sendMessage', (message) => {
    io.emit('message', message);
    // console.log(message)
    ChatSave.push(message)
    io.emit('sendArray', ChatSave);
  });




  socket.on('deleteRoomUsers', (users) => {
    let user = RoomsUsers.find(RoomsUsers => RoomsUsers.username === users.username && RoomsUsers.channel === users.channel); 
    
    if (user) { 
      let pos = RoomsUsers.indexOf(users.username);
      RoomsUsers.splice(pos, 1);
    } 
    io.emit('sendRoomsUsers', RoomsUsers);
    io.emit('sendRoomLeave', users);
   
  });



  socket.on('saveUsers', (users) => {
    Users.push(users)
    io.emit('sendUser', Users);
    //  console.log(Users)
    // console.log(users);
  });

  socket.on('addChannel', (channel) => {
    Room.push(channel)
    // console.log(channel)
    io.emit('sendChannel', Room);
    // console.log(Room)
  });

  socket.on('deleteChannel', async (channel) => {
    let pos = Room.indexOf(channel.channel);
    console.log("channel Initial ", Room);    console.log("channel Initial ", Room)
    Room = Room.filter(elem=>elem.channel !== channel.channel);
    console.log("channel final ", Room)
    io.emit('sendChannel', Room);
  });

  socket.on('sendUsersRooms', async (users) => {

    let user = RoomsUsers.find(RoomsUsers => RoomsUsers.id === users.id && RoomsUsers.channel === users.channel); 
    if (!user) { 
      io.emit('sendMessageRoom', users);
      RoomsUsers.push(users);
      // console.log(RoomsUsers)
    } 
    
    io.emit('sendRoomsUsers', RoomsUsers);
  });

  socket.on('changeUsersName', async (users) => {
    RoomsUsers.forEach(elem => {
      console.log("elem initial",elem)
      if (elem.username === users.lastname) {
        elem.username = users.username
        
      }
      console.log("elem final ",elem)
    });
  
    io.emit('sendRoomsUsers', RoomsUsers);
    io.emit('sendUser', Users);
  
  });
  socket.on('changeUsers', async (users) => {
    // console.log(Users)
    // console.log(users.username)
    let pos = Users.indexOf(users.username);
    // console.log(pos)
    Users.splice(pos, 1);
    Users.push(users)

    let user = RoomsUsers.find(RoomsUsers => RoomsUsers.username === users.username && RoomsUsers.channel === users.channel); 
    if (!user) { 
      io.emit('sendMessageRoom', users);
      RoomsUsers.push(users);
    } else {
      console.log(`${users.username} déjà dans ${users.channel} zbi`);
    }
    // console.log(RoomsUsers)
    // console.log(RoomsUsers)
    io.emit('sendRoomsUsers', RoomsUsers);
    io.emit('sendUser', Users);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });

});


const PORT = process.env.PORT || 4500;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});