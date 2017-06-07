
const socket = io();
let username;
let activeUsersClient = [];

//the form take user name, this only appeare once, before user name submited
//new message form will not show
$('.usernameForm').submit(event => {
  event.preventDefault();

  //take the val from the textfield and store to the usermane
  username = $('.newUsername').val();

  //emit userJoining event with the user name
  socket.emit('userJoining', username);

  //show welcome notice in the chat window only to user himself
  let $li = $('<li>').addClass('serverMessage').text(`Welcome ${username} to chat!`);
  $('#messageList').append($li);

  //show user name on the user welcome line
  $('.username').text(username);
  //hide username form
  $('.usernameForm').hide(); // sets display:none;
  //show new message from
  $('.newMessageForm').show();
  //show user welcome line
  $('.userWelcome').show();
});//username form submit ended

//new message form, inital hided
$('.newMessageForm').submit(event => {
  event.preventDefault();

  //store the message from text field and empty it
  let messageText = $('.newMessage').val();
  $('.newMessage').val('');

  //build new message object with the user name
  let message = {
    username,
    text: messageText
  }

  //emit new message
  socket.emit('createMessage', message);
});//new message form ended

//listen to message event, display message onto the board
socket.on('message', message => {
  let $li = createMessageLi(message);
  $('#messageList').append($li);
});

//listen to messageHistory event, display all messages onto board
socket.on('messageHistory', messageHistory => {
  let $lis = messageHistory.map(createMessageLi);
  $('#messageList').append($lis);
});

//listen to activeUsers event, change activeuser line
socket.on('activeUsers', activeUsers => {
  activeUsersClient = activeUsers;
  $('.activeUsers').text(createActiveUsersString(activeUsersClient));
})

//listen to newUserJoined event, display welcome message onto board
socket.on('newUserJoined', username => {
  let $li = $('<li>').addClass('serverMessage').text(`${username} has joined chat.`);
  $('#messageList').append($li);
});

socket.on('newActiveUser', newUser => {
  activeUsersClient.push(newUser);
  $('.activeUsers').text(createActiveUsersString(activeUsersClient));
})

socket.on('lostActiveUser', id => {
  activeUsersClient = activeUsersClient.filter((user) => user.id !== id);
  $('.activeUsers').text(createActiveUsersString(activeUsersClient));
})

//helper function to convert message object into $li
function createMessageLi(message) {
  return $('<li>').text(`${message.username} - ${message.text}`);
}

function createActiveUsersString(activeUsers) {
  return activeUsers.map((user)=> user.username).join(', ');
}
