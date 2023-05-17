const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let width, height;

const POPULATION_SIZE = 500;
let INIT_MOVES = 250;
const FOOD_REWARD = 400;

let snakesGroup = [];
let nets = [];
let dead = new Array(POPULATION_SIZE).fill(false);
let fitness = new Array(POPULATION_SIZE).fill(0);
let copyBest = 20;
let mutationRate = 0.1;

let generation = 1; 

let STARTED = true;


function setDimensions() {
    if(window.innerHeight*2 > window.innerWidth) { //portrait
        width = canvas.width = parseInt(window.innerWidth/10)*10;
        height = canvas.height = parseInt(window.innerWidth/20)*10;
    } else {
        width = canvas.width = parseInt(window.innerHeight *2/10)*10;
        height = canvas.height = parseInt(window.innerHeight/10)*10;
    }

    INIT_MOVES = 0.5*width;

    // width = canvas.width = 800;
    // height = canvas.height = 400;

}
setDimensions();
window.onresize = setDimensions;

for(let i = 0; i< POPULATION_SIZE; i++) {

    snakesGroup.push(new Snake(snakesGroup,i, width, height));
    nets.push(new NeuralNet(24,30,28,4));

}


function maximums(arr) {


    const sortedArr = [...arr].sort((a,b) => b-a);

    const res = sortedArr.map((el, i) => arr.indexOf(el));

    return res;

}

function resetGame() {

    console.log("ALL DEAD!");

    //RESET Logic Goes here:
    snakesGroup = [];

    for(let i = 0; i< POPULATION_SIZE; i++) {
        snakesGroup.push(new Snake(snakesGroup,i, width, height));
    }


    console.log("fitness: ", [...fitness])
    const maximumsList = maximums([...fitness]);

    console.log("maxFitness: ", maximumsList[0], "maximums Length: ", maximumsList.length);

    const prevNets = [...nets]
    nets = []

    for(let i = 0; i< POPULATION_SIZE; i++) {
        nets.push(prevNets[maximumsList[i%copyBest]].clone().mutate(mutationRate + ((i%4)*mutationRate)));
    }


    dead.fill(false);
    fitness.fill(0);

    generation++;

}

function drawLabels() {

    ctx.fillStyle = "#fff";
    ctx.font = "20px Arial";
    ctx.fillText("Generation: " + generation, 10, height-90);
    ctx.fillText("Alive: " + snakesGroup.filter(bird => !bird.dead).length, 10, height-60);
    ctx.fillText("Best: " + Math.max(...fitness), 10, height-30);


}


function animate() {
    ctx.clearRect(0, 0, width, height);

    // Snake logic goes here:
    snakesGroup.forEach((snake, i) => {

        if(snake.dead) return dead[snake.index] = true;

        let inputs = snake.getInputs();

        let output = nets[snake.index].forward(inputs);

        output = output[0];

        let decision = output.indexOf(Math.max(...output));

        if(snake.index > 0 && nets[snake.index].isEqual(nets[snake.index-1])) throw new Error("Same nets! Generation: " + generation + " index: " + snake.index);


        if(decision == 0) snake.changeDirection("UP");
        else if(decision == 1) snake.changeDirection("RIGHT");
        else if(decision == 2) snake.changeDirection("DOWN");
        else if(decision == 3) snake.changeDirection("LEFT");
        else {
            console.log(output);
            throw new Error("Decision is not valid! " + decision)
        };

        fitness[snake.index] += 1;

        if(snake.eatenFood) {
            fitness[snake.index] += FOOD_REWARD;
            // console.log(snake.index + " EATEN FOOD!")
        }

        snake.update();
    }
    )

    if(dead.every(d => d === true)) resetGame();

    drawLabels();

    setTimeout(animate, 1000/60);
}

animate();