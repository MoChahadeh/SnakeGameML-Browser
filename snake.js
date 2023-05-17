
class Vector2D {

    constructor(x, y) {

        this.x = x;
        this.y = y;

    }

    shiftX(dx) {

        return new Vector2D(this.x + dx, this.y);
    }

    shiftY(dy) {
            
            return new Vector2D(this.x, this.y + dy);
    }

    shift(dx, dy) {

        return new Vector2D(this.x + dx, this.y + dy);

    }

    add(v) {
            
        return new Vector2D(this.x + v.x, this.y + v.y);
    
    }

    toString() {

        return `${this.x},${this.y}`;

    }

}

function vectorsArraysAreEqual(arr1, arr2) {

    let result = true;

    arr1.forEach((vector, i) => {
            
        if(vector.toString() !== arr2[i].toString()) result = false;
    
    });

    return result;


}

function randomIntBetween(min, max) {

    return parseInt((Math.random() * (max - min)) + min + 0.5);

}

function pickRandom(arr) {

    return arr[randomIntBetween(0, arr.length-1)];

}

function boolToInt(arr) {

    return arr.map(row => row.map(col => col ? 1 : 0));

}

const directions = ["UP", "RIGHT", "DOWN", "LEFT"];

class Snake {

    constructor(group,index, screenWidth, screenHeight) {

        this.screenHeight = screenHeight;
        this.screenWidth = screenWidth;

        this.group = group;
        this.index = index;
    
        this.pos = new Vector2D(randomIntBetween(1, (this.screenWidth-10)/10)*10, randomIntBetween(1, (this.screenHeight-10)/10)*10);
        this.posHistory = [this.pos];

        this.body = [this.pos, this.pos.shiftX(-10), this.pos.shiftX(-20)];
        this.color = "#32c850";

        this.food = new Vector2D(randomIntBetween(1, (this.screenWidth-10)/10)*10, randomIntBetween(1, (this.screenHeight-10)/10)*10);
    
        this.direction = pickRandom(directions);
        this.directionHistory = new Array(4).fill(this.direction);

        this.dead = false;
        this.eatenFood = false;

        this.movesLeft = INIT_MOVES;
    }

    update() {

        this.eatenFood = false;
        
        if(this.dead) return;

        switch(this.direction) {

            case "UP":
                this.pos = this.pos.shiftY(-10);
                break;
            case "RIGHT":
                this.pos = this.pos.shiftX(10);
                break;
            case "DOWN":
                this.pos = this.pos.shiftY(10);
                break;
            case "LEFT":
                this.pos = this.pos.shiftX(-10);
                break;
            default:
                throw new Error("Invalid Direction");

        }

        this.posHistory.unshift(this.pos);


        this.body.unshift(this.pos);
        
        if(this.foodCollision()) {

            this.eatenFood = true;
            this.food = new Vector2D(randomIntBetween(1, (this.screenWidth-10)/10)*10, randomIntBetween(1, (this.screenHeight-10)/10)*10);
            this.movesLeft += parseInt(FOOD_REWARD/2);

        } else this.body.pop();

        if(this.movesLeft <= 0) this.dead = true;

        if(this.posHistory.length > 12) {
            if(vectorsArraysAreEqual(this.posHistory.slice(0, 4), this.posHistory.slice(4, 8)) && vectorsArraysAreEqual(this.posHistory.slice(4, 8), this.posHistory.slice(8, 12))) {
                this.dead = true;
                fitness[this.index] -= parseInt(FOOD_REWARD/2);
                console.log("LOOPER " + this.index + " ELIMINATED");
            }
        }


        if(this.borderCollision() || this.bodyCollision()) {
            fitness[this.index] -= FOOD_REWARD;
            this.dead = true;
    
        }

        this.movesLeft--;

        this.draw()

    }

    draw() {

        this.body.forEach(sq => {

            ctx.fillStyle = this.color;
            ctx.fillRect(sq.x, sq.y, 10, 10);


        })

        ctx.fillStyle = "#fff";
        ctx.fillRect(this.food.x, this.food.y, 10, 10);

    }

    bodyCollision() {
            
        return this.body.slice(1).some(sq => sq.x == this.pos.x && sq.y == this.pos.y)
    }

    foodCollision() {
        return this.pos.x == this.food.x && this.pos.y == this.food.y;
    }

    borderCollision() {
        return this.pos.x < 0 || this.pos.x >= this.screenWidth || this.pos.y < 0 || this.pos.y >= this.screenHeight;
    }

    changeDirection(direction) {

        if(this.direction == direction) return;

        if (this.direction == directions[(directions.indexOf(direction)+2) % 4]) return this.dead = true;

        this.direction = direction;
        this.directionHistory.push(direction);

    }

    dangerRight(){
        return this.pos.x + 10 === this.screenWidth || this.body.some(sq => sq.x == this.pos.x + 10 && sq.y == this.pos.y);
    }

    dangerLeft(){
        return this.pos.x === 0|| this.body.some(sq => sq.x == this.pos.x - 10 && sq.y == this.pos.y);
    }

    dangerUp(){
        return this.pos.y === 0 || this.body.some(sq => sq.x == this.pos.x && sq.y == this.pos.y - 10);
    }

    dangerDown(){

        return this.pos.y + 10 === this.screenHeight || this.body.some(sq => sq.x == this.pos.x && sq.y == this.pos.y + 10);

    }

    danger() {
            
        return this.dangerRight() || this.dangerLeft() || this.dangerUp() || this.dangerDown();
    
    }


    getInputs() {

        return boolToInt([[this.pos.x < this.food.x, this.pos.x > this.food.x, this.food.y < this.pos.y, this.food.y > this.pos.y, this.direction == "UP", this.direction == "DOWN", this.direction == "RIGHT", this.direction == "LEFT", this.directionHistory[this.directionHistory.length-2] == "UP", this.directionHistory[this.directionHistory.length-2] == "DOWN", this.directionHistory[this.directionHistory.length-2] == "RIGHT", this.directionHistory[this.directionHistory.length-2] == "LEFT",  this.directionHistory[this.directionHistory.length-3] == "UP", this.directionHistory[this.directionHistory.length-3] == "DOWN", this.directionHistory[this.directionHistory.length-3] == "RIGHT", this.directionHistory[this.directionHistory.length-3] == "LEFT", this.directionHistory[this.directionHistory.length-4] == "UP", this.directionHistory[this.directionHistory.length-4] == "DOWN", this.directionHistory[this.directionHistory.length-4] == "RIGHT", this.directionHistory[this.directionHistory.length-4] == "LEFT", this.dangerUp(), this.dangerDown(), this.dangerRight(), this.dangerLeft()]]);

    }


}

