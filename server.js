const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const uploadsDir = path.join(__dirname, 'public/uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const chatLogPath = path.join(__dirname, 'chat-log.json');
if (!fs.existsSync(chatLogPath)) {
  fs.writeFileSync(chatLogPath, JSON.stringify([]));
}

function saveMessage(msg) {
  const logs = JSON.parse(fs.readFileSync(chatLogPath));
  logs.push(msg);
  fs.writeFileSync(chatLogPath, JSON.stringify(logs, null, 2));
}

function loadMessages() {
  return JSON.parse(fs.readFileSync(chatLogPath));
}

function deleteMessage(id) {
  let logs = JSON.parse(fs.readFileSync(chatLogPath));
  logs = logs.filter(msg => msg.id !== id);
  fs.writeFileSync(chatLogPath, JSON.stringify(logs, null, 2));
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/public', express.static(path.join(__dirname, 'public')));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });
app.post('/upload', upload.single('image'), (req, res) => {
  res.json({ imageUrl: '/public/uploads/' + req.file.filename });
});

app.get('/', (req, res) => {
  res.redirect('/public/login.html');
});

io.on('connection', (socket) => {
  socket.emit('chat history', loadMessages());

  socket.on('chat message', (data) => {
    saveMessage(data);
    io.emit('chat message', data);
  });

  socket.on('delete message', (id) => {
    deleteMessage(id);
    io.emit('delete message', id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
