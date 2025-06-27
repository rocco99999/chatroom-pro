const socket = io();
const username = localStorage.getItem('username');
if (!username) location.href = 'login.html';

const form = document.getElementById('chat-form');
const input = document.getElementById('msg');
const chatBox = document.getElementById('chat-box');
const imgInput = document.getElementById('imgInput');

form.addEventListener('submit', function(e) {
  e.preventDefault();
  if (input.value) {
    socket.emit('chat message', { user: username, msg: input.value });
    input.value = '';
  }
});
imgInput.addEventListener('change', async function() {
  const file = imgInput.files[0];
  if (!file) return;
  const formData = new FormData();
  formData.append('image', file);
  const res = await fetch('/upload', { method: 'POST', body: formData });
  const data = await res.json();
  socket.emit('chat message', { user: username, img: data.imageUrl });
});
socket.on('chat message', function(data) {
  const div = document.createElement('div');
  div.classList.add('message');
  div.innerHTML = '<strong>' + data.user + '</strong>: ';
  if (data.msg) div.innerHTML += data.msg;
  if (data.img) {
    const img = document.createElement('img');
    img.src = data.img;
    img.onclick = () => showPreview(data.img);
    div.appendChild(img);
  }
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
});

function showPreview(src) {
  document.getElementById('overlay').style.display = 'flex';
  document.getElementById('previewImg').src = src;
}
function closePreview() {
  document.getElementById('overlay').style.display = 'none';
}
