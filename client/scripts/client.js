let ping = 100000;
let pingStart = 0;

const getClickCoordinates = (element, ev) => {
    const { top, left } = element.getBoundingClientRect();
    const { clientX, clientY } = ev;

    return {
        x: clientX - left,
        y: clientY - top
    };
};

const getGame = (canvas) => {

    const ctx = canvas.getContext('2d');

    const drawRect = (x, y, color) => {
        ctx.fillStyle = color;
        ctx.fillRect(x-10 ,y-10 ,20,20)
    }

    const drawTime = (time) => {
        ctx.font = "40px Arial";
        ctx.fillStyle = "#000000";
        ctx.fillText(time, 18, 200);
    }

    const drawPing = () => {
        ctx.font = "18px Arial";
        ctx.fillStyle = "#000000";
        ctx.fillText(ping + 'ms', 18, 18);
    }

    const clear = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    return {drawRect, clear, drawTime, drawPing};

}

function pingServer (sock){
    setTimeout(function (){
        pingStart = Date.now();
        sock.emit('ping',Date.now());
        pingServer(sock);
    },100)
}

(() => {
    console.log('Started');

    //Get Function suite
    const canvas = document.querySelector('canvas');
    const {drawRect, clear, drawTime, drawPing} = getGame(canvas);

    //Estab con
    const sock = io();
    sock.on('con', console.log);


    const onClick = (e) => {
        const { x, y } = getClickCoordinates(canvas, e);
        sock.emit('turn', {x, y});
    };

    sock.on('tick', ({time,fin,x,y})=>{
        clear();
        drawPing();
        if (!fin){
            drawTime(time);
        }else{
            drawRect(x,y,'red');
        }
    })
    sock.on('fin', (text) => {
        clear();
        drawPing();
        drawTime(text);
    })

    sock.on('ping', ()=>{
        ping = Date.now() - pingStart;
    });

    canvas.addEventListener('click', onClick);

    pingServer(sock);
})();