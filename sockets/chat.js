const crypto = require('crypto');
const chatModel = require('../models/chatModel');

const users = {};

const createData = () => {
  const dataAtual = new Date();
  const dia = dataAtual.getDate();
  const mes = (dataAtual.getMonth() + 1);
  const ano = dataAtual.getFullYear();
  const horas = dataAtual.getHours();
  const minutos = dataAtual.getMinutes();
  const data = `${dia}-${mes}-${ano} ${horas}:${minutos}`;
  return data;
};

const initialMessage = (socket, io) => {
  socket.on('initialMessage', async () => {
    const newNickname = crypto.randomBytes(20).toString('hex').substr(0, 16);
    const getAllMessage = await chatModel.getMessage();
    users[socket.id] = newNickname;
    socket.emit('getAllMessage', getAllMessage);
    io.emit('updateOnline', { users, newNickname });
  });
};

const saveName = (socket, io) => {
  socket.on('saveName', (nickname) => {
    users[socket.id] = nickname;
    io.emit('updateOnline', { users, newNickname: nickname });
  });
};

const saveMessage = (socket, io) => {
  socket.on('message', ({ chatMessage, nickname }) => {
    chatModel.saveMessage({ message: chatMessage, nickname, timestamp: createData() });
    const message = `${createData()} - ${nickname}: ${chatMessage}`;
    io.emit('message', message);
  });
};

const desconnect = (socket, io) => {
  socket.on('disconnect', () => {
    delete users[socket.id];
    io.emit('updateOnline', { users });
  });
};

module.exports = (io) => io.on('connection', (socket) => {
  initialMessage(socket, io);
  saveMessage(socket, io);
  saveName(socket, io);
  desconnect(socket, io);
});
