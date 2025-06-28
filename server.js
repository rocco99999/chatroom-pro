const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// ✅ 帳號密碼設定（可自行修改）
const users = [
  { username: 'rocco0401', password: '02129012' },
  { username: 'ywn80584771', password: 'abcd' }
];

// ✅ 上傳圖片資料夾
const uploadsDir = path.join(__dirname, 'public/uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// ✅ 聊天記錄 JSON 檔案
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

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/public', express.static(path.join(__dirname, 'public')));

// ✅ 設定圖片上傳
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

// ✅ 登入頁面
app.get('/', (req, res) => {
  res.redirect('/public/login.html');
});

// ✅ Socket.io 聊天連線處理
io.on('connection', (socket) => {
  // 發送歷史訊息
  socket.emit('chat history', loadMessages());

  // 新訊息
  socket.on('chat message', (data) => {
    saveMessage(data);
    io.emit('chat message', data);
  });
});

// ✅ 最重要的 Render 綁定 PORT！
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
