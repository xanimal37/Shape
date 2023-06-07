window.addEventListener('load', function(){
    console.log("LOADED MAIN PAGE");

    const canvas = document.getElementById('mainCanvas');
    const ctxt = canvas.getContext('2d');
    canvas.width=800;
    canvas.height=600;
    ctxt.lineWidth = 2;
    ctxt.fillStyle = 'white';
    ctxt.strokeStyle = 'red';

    //OOP!
    //would be better to put in modules or different scripts if have a server
    class Player {

        constructor(game){
            this.game = game;
            this.collisionX = this.game.width * 0.5;
            this.collisionY = this.game.height * 0.5;
            this.collisionRadius = 30;
            this.speedX = 0;
            this.speedY = 0;
        }

        //methods
        draw(context){
            context.beginPath();
            context.arc(this.collisionX,this.collisionY,this.collisionRadius,0,Math.PI * 2);
            context.save();
            context.globalAlpha = 0.75;
            context.fill();
            context.restore();
            context.stroke();
            context.beginPath();
            context.moveTo(this.collisionX, this.collisionY);
            context.lineTo(this.game.mouse.x, this.game.mouse.y);
            context.stroke();
        }

        update(){
            this.speedX=this.game.mouse.x - this.collisionX;
            this.speedY=this.game.mouse.y - this.collisionY;
            this.collisionX +=this.speedX/20;
            this.collisionY +=this.speedY/20;
        }

    }

    class Obstacle {
        constructor(game){
            this.game= game;
            //randomize position
            this.collisionX = Math.random() * this.game.width;
            this.collisionY = Math.random() * this.game.height;
            this.collisionRadius = 60;
        }

        draw(context){
            context.beginPath();
            context.arc(this.collisionX,this.collisionY,this.collisionRadius,0,Math.PI * 2);
            context.fill();
        }
    }

    class Game {
        constructor(canvas){
        this.canvas = canvas;
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.player = new Player(this); //pass itself to new player

        //obstacle initialization
        this.numberOfObstacles = 5;
        this.obstacles = [];

        //mouse object
        this.mouse = {
            x:this.width *0.5,
            y:this.height*0.5,
            pressed: false
        }

        //event listeners
        canvas.addEventListener('mousedown',e=>{
            this.mouse.x = e.offsetX;
            this.mouse.y = e.offsetY;
            this.mouse.pressed=true;
        });

        canvas.addEventListener('mouseup',e=>{
            this.mouse.x = e.offsetX;
            this.mouse.y = e.offsetY;
            this.mouse.pressed=false;
        });

        canvas.addEventListener('mousemove',e=>{ //or use this but arrow is automatic ES6
            this.mouse.x = e.offsetX;
            this.mouse.y = e.offsetY;
        });
        }

        render(context){
            this.player.draw(context);
            this.player.update();
            this.obstacles.forEach(obstacle=>{
                obstacle.draw(context);
            });
        }

        init(){
            for(let i=0;i<this.numberOfObstacles;i++){
                this.obstacles.push(new Obstacle(this));
            }
        }

        

    }

    const game = new Game(canvas);
    game.init();
   
    function animate(){
        ctxt.clearRect(0,0,canvas.width, canvas.height);
        game.render(ctxt);
        requestAnimationFrame(animate);
    }

    animate();
});