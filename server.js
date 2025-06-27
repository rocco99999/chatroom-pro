const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const multer = require('multer');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const users = [
  { username: 'user1', password: '1234' },
  { username: 'user2', password: 'abcd' }
];

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/public', express.static(path.join(__dirname, 'public')));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'public/uploads'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });
app.post('/upload', upload.single('image'), (req, res) => {
  res.json({ imageUrl: '/public/uploads/' + req.file.filename });
});

app.get('/', (req, res) => res.redirect('/public/login.html'));

io.on('connection', (socket) => {
  socket.on('chat message', (data) => {
    io.emit('chat message', data);
  });
});

server.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
