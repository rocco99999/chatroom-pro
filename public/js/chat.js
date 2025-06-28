const socket = io();
const username = sessionStorage.getItem("username") || "匿名";
const form = document.getElementById("form");
const input = document.getElementById("m");
const imageInput = document.getElementById("imageInput");
const chat = document.getElementById("chat");

socket.on("chat message", (msg) => {
  appendMessage(msg);
});

socket.on("chat history", (history) => {
  history.forEach(msg => appendMessage(msg));
});

form.addEventListener("submit", function(e) {
  e.preventDefault();
  if (input.value.trim()) {
    const msg = { id: Date.now(), user: username, text: input.value, time: new Date().toISOString() };
    socket.emit("chat message", msg);
    input.value = "";
  }
});

imageInput.addEventListener("change", () => {
  const file = imageInput.files[0];
  if (!file) return;
  const formData = new FormData();
  formData.append("image", file);
  fetch("/upload", { method: "POST", body: formData })
    .then(res => res.json())
    .then(data => {
      const msg = { id: Date.now(), user: username, image: data.imageUrl, time: new Date().toISOString() };
      socket.emit("chat message", msg);
    });
});

function formatTime(isoTime) {
  const d = new Date(isoTime);
  return d.toLocaleString("zh-TW", { hour12: false });
}

function appendMessage(msg) {
  const div = document.createElement("div");
  div.className = "message";
  div.dataset.id = msg.id;

  div.innerHTML = "<strong>" + msg.user + "</strong> (" + formatTime(msg.time) + "): ";
  if (msg.text) {
    div.innerHTML += msg.text;
  }
  if (msg.image) {
    const img = document.createElement("img");
    img.src = msg.image;
    img.style.maxWidth = "150px";
    img.style.cursor = "pointer";
    img.onclick = () => {
      const popup = window.open("", "_blank");
      popup.document.write("<img src='" + msg.image + "' style='width:100%'>");
    };
    div.appendChild(document.createElement("br"));
    div.appendChild(img);
  }

  if (msg.user === username) {
    const btn = document.createElement("button");
    btn.textContent = "🗑️";
    btn.style.marginLeft = "10px";
    btn.onclick = () => {
      socket.emit("delete message", msg.id);
      div.remove();
    };
    div.appendChild(btn);
  }

  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}
