const PORT = 3000;

const express = require('express');
const morgan = require('morgan');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

server.listen(PORT, err => {
  console.log(err || `Express listening at http://localhost:${PORT}`);
});

app.use(morgan('dev'));
app.use(express.static('public'));


////////////////////////

let numConnected = 0;
const messageHistory = [];
let activeUsers = [];

//inital connection setup
io.on('connection', function(socket) {
  console.log('socket client connected!', ++numConnected);



  //send message History, only once
  socket.emit('messageHistory', messageHistory);
  //send current active users, only once
  socket.emit('activeUsers', activeUsers)

  //listening to userJoining event, emit newUserJoined event to others
  //and push new user to the activeUsers array
  socket.on('userJoining', username => {

    let newUser = {username, id: socket.id};
    activeUsers.push(newUser);
    socket.broadcast.emit('newUserJoined', username);
    io.emit('newActiveUser', newUser)

  });

//listening to createMessage event, then send the message to all
//and push new message to messagehistory array
  socket.on('createMessage', message => {
    messageHistory.push(message);
    io.emit('message', message);
  });

//listening to disconnect event
  socket.on('disconnect', () => {
    activeUsers = activeUsers.filter((user) => {return user.id !== socket.id});
    io.emit('lostActiveUser', socket.id)
    console.log('socket client disconnected.', --numConnected)
  })
});
