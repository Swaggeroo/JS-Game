const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const randomColor = require('randomcolor');

const app = express();

app.use(express.static(`${__dirname}/../client`));

const server = http.createServer(app);
const io = socketio(server);

let connections = 0;
let time = 3;
let fin = false;
let pos = {x: -1, y:-1};
let clicked = false;

io.on('connection', (sock) => {
    const color = randomColor();
    connections++;

    sock.emit('con','Connected');
    sock.emit('tick', {time,fin,x: pos.x,y: pos.y});

    sock.on('welcome', (text) => io.emit('welcome',text));
    sock.on('turn', ({x,y}) => {
        if (!clicked){
            if (x > pos.x-10 && x < pos.x+10 && y > pos.y-10 && y < pos.y+10){
                clicked = true;
                fin = false;
                io.emit('fin','You lost');
                sock.emit('fin','You won');
                time = 3;
                setTimeout(function (){
                    gameLoop();
                },2500);
            }
        }
    });

    sock.on('ping',()=>sock.emit('ping',Date.now()));

    sock.on('disconnecting', () => {
        connections--;
    });
})


server.on('error', (err) => {
    console.log(err);
})

server.listen(8080, () => {
    console.log('server is ready');
})

function gameLoop(){
    setTimeout(function(){
        if (time > 0){
            fin = false;
            clicked = false;
            let x = pos.x;
            let y = pos.y;
            io.emit('tick',{time,fin,x,y});
            time--;
            gameLoop();
        }else{
            fin = true;
            pos.x = Math.floor(Math.random() * 460)+10;
            pos.y = Math.floor(Math.random() * 300)+10;
            let x = pos.x;
            let y = pos.y;
            io.emit('tick', {time,fin,x,y})
        }
    }, Math.floor(Math.random() * 5000));

}

gameLoop();