window.addEventListener('load', function(){
    console.log("LOADED MAIN PAGE");

    const canvas = document.getElementById('mainCanvas');
    const ctxt = canvas.getContext('2d');
    canvas.width=window.innerWidth;
    canvas.height=window.innerHeight;
    //default draw settings
    ctxt.lineWidth = 2;
    ctxt.fillStyle = 'white';
    ctxt.strokeStyle = 'white';

    //OOP!
    //would be better to put in modules or different scripts if have a server
    class Player {

        constructor(game){
            this.game = game;
        }

    }

    //the square player can't move but can rotate
    //if circle hits a corner, circle will take damage
    class SquarePlayer extends Player {

        constructor(game){
            super(game);
            //initial location in center of game window
            this.collisionX = this.game.width * 0.5;
            this.collisionY = this.game.height * 0.5;
            //initial size
            this.sideLength = 100;
            this.color = 'blue';
            this.angle=0;
        }

        //draw shape
        draw(context){
            context.save();
            context.translate(this.collisionX+this.sideLength/2,this.collisionY+this.sideLength/2);
            context.rotate(this.angle * Math.PI/360);
            context.strokeRect(-this.sideLength/2,-this.sideLength/2,this.sideLength,this.sideLength);
            context.restore();
            }

        update(){
            //test
            if(this.game.squareState.rotating){
                if(this.game.squareState.clockwise){
                    this.angle++;
                }
                else {
                    this.angle--;
                }
            }
            
            //check for collisions
        }
    }

    //if circle hits flat side of square, square will take damage
    //circle can move
    class CirclePlayer extends Player {

        constructor(game){
            super(game);
            //randomize location (one of four 'corners')
            this.locations = [
                [this.game.width * 0.33,this.game.height * 0.33],
                [this.game.width * 0.33,this.game.height * 0.66],
                [this.game.width * 0.33,this.game.height * 0.66],
                [this.game.width * 0.66,this.game.height * 0.66]
            ];
            this.collisionX = this.locations[0][0];
            this.collisionY = this.locations[0][1];
            this.collisionRadius = 30;
            this.speedX = 0;
            this.speedY = 0;
        }

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
            //horizontal boundaries
            if(this.collisionX < + this.collisionRadius){
                this.collisionX = this.collisionRadius;
            }
            else if (this.collisionX > this.game.width - this.collisionRadius){
                this.collisionX = this.game.width-this.collisionRadius;
            }
            //vertical boundaries
            if(this.collisionY<this.collisionRadius){
                this.collisionY = this.collisionRadius;
            }
            else if(this.collisionY>this.game.height-this.collisionRadius){
                this.collisionY = this.game.height-this.collisionRadius;
            }

            /*check for player collision
            this.game.obstacles.forEach(obstacle=>{
                //[(distance < sumOfRadii),distance, sumOfRadii,dx,dy]
                //destructuring assignemnt
                //javascript - shorthand for assigning variables from an array
                let [collision,distance,sumOfRadii,dx,dy] = this.game.checkCollision(this,obstacle);
                if(collision){
                    const unit_x = dx/distance; //will always be 0 - 1 or neg
                    const unit_y = dy/distance; //will always be 0 - 1 or neg
                    this.collisionX = obstacle.collisionX + (sumOfRadii+1) * unit_x;
                    this.collisionY = obstacle.collisionY + (sumOfRadii+1) * unit_y;
                }
            });
            */
        }

        
    }

    class Game {
        constructor(canvas){
        this.canvas = canvas;
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.squarePlayer = new SquarePlayer(this); //pass itself to new player
        this.circlePlayer = new CirclePlayer(this); //pass itself to new player

        //refresh rate and game time
        this.fps = 64;
        this.timer = 0;
        this.interval = 1000/this.fps; //ms needed to achieve fps

        //mouse object - controls circle player
        this.mouse = {
            x:this.width *0.5,
            y:this.height*0.5,
            pressed: false
        }

        //key object (made up to handle key state) - controls square player
        this.squareState = {
            rotating:false,
            clockwise: true
        }

        //event listeners
        //events for circle player
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
           if(this.mouse.pressed){
            this.mouse.x = e.offsetX;
            this.mouse.y = e.offsetY;
           }
        });

        //events for square player
        //window for keys
        window.addEventListener('keydown',e=>{
            console.log("KEY PRESSED");
            switch(e.key){
            case 'A':
            case 'a':
                console.log('pressed a!');
                this.squareState.rotating=true;
                this.squareState.clockwise=false;
                break;
            case 'D':
            case 'd':
                console.log('pressed d!');
                this.squareState.rotating=true;
                this.squareState.clockwise=true;
                break;
            default:
                break;
            }
        });

        window.addEventListener('keyup',e=>{
            this.squareState.rotating=false;
        });

        }

        render(context, deltaTime){
            if(this.timer > this.interval){
                ctxt.clearRect(0,0,canvas.width, canvas.height); 
                //animate next frame
                this.squarePlayer.draw(context);
                this.squarePlayer.update(context);
                this.circlePlayer.draw(context);
                this.circlePlayer.update(context);
            
                this.timer =0;
            }
            this.timer+=deltaTime;
            
        }

        checkCollision(a, b){
            const dx = a.collisionX - b.collisionX;
            const dy = a.collisionY - b.collisionY;
            const distance = Math.hypot(dy, dx);
            const sumOfRadii = a.collisionRadius + b.collisionRadius;
            return [(distance < sumOfRadii),distance, sumOfRadii,dx,dy];
        }

        init(){
            //set player locations
            //draw players
        }
    }

    const game = new Game(canvas);
    game.init();
   
    let lastTime =0; //timestamp from previous loop
    function animate(timeStamp){
        const deltaTime = timeStamp - lastTime;
        lastTime = timeStamp;
        //console.log(deltaTime); //16 is average (16.6 or so)
        game.render(ctxt, deltaTime);
        //automaticlaly adjusts to screen refresh rate (60fps)
        //newer rigs can go much faster
        //use delta time to even it out (like in unity)
        requestAnimationFrame(animate);
    }

    animate(0); //prevents NaN on first call
});