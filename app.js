const express = require('express');
const app = express();
const path = require("path");
const http = require("http");
const socketio = require("socket.io");

const server = http.createServer(app);
const io = socketio(server);

app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");

io.on("connection", function(socket) {
    socket.on("send-location", ({ latitude, longitude }) => {
    // Send location to all connected clients
    io.emit("recieve-location", {
        id: socket.id,
        latitude,
        longitude
    });
        socket.io("disconnet",function(){
            io.emit("user-disconnected",socket.id)
        })

});
    console.log("A user connected:", socket.id);

    socket.on('disconnect', () => {
        console.log('A user disconnected:', socket.id);
    });
});

app.get("/", function(req, res) {
    res.render("index");
});

server.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});