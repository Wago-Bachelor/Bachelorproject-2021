const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const { fork } = require("child_process");

const PORT = 5500;

http.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});

app.use(express.static(__dirname + "/"));

app.get("/index", function (req, res) {
  res.render(__dirname + "index.html");
});

io.on("connection", (socket) => {
  const n = fork(`./opc.js`);
  n.on("message", (m) => {
    io.emit("hei", m);
  });

  socket.on("float", (msg) => {
    dataToWrite = {
      dataType: "Float",
      value: msg[1],
    };

    n.send([msg[0], dataToWrite]);
  });
  socket.on("disconnect", function () {
    console.log("Got disconnect!");
  });
});
