if(typeof window === 'undefined') {
    console.log("Node.js detected, loading modules...");
    numbers = require("numbers");
}

class Matrix {

    constructor(rows, cols) {

        this.rows = rows;

        this.cols = cols;

        this.data = [];

        for (let i = 0; i < this.rows; i++) {

            this.data[i] = [];

            for (let j = 0; j < this.cols; j++) {

                this.data[i][j] = 0;

            }

        }


    }

    randomize(min, max) {

        for (let i = 0; i < this.rows; i++) {

            for (let j = 0; j < this.cols; j++) {

                this.data[i][j] = Math.random() * (max - min) + min;

            }

        }

        return this;


    }

    populate(arr) {
            
        for (let i = 0; i < this.rows; i++) {

            for (let j = 0; j < this.cols; j++) {

                this.data[i][j] = arr[i][j];

            }

        }

        return this;
    
    }

    mutate(mutationRate) {

        for(let i = 0; i < this.rows; i++) {

            for (let j = 0; j < this.cols; j++) {

                this.data[i][j] *= 1+ ((Math.random()*2 - 1) * mutationRate);

            }

        }
    }

    clone() {

        const clone = new Matrix(this.rows, this.cols);

        clone.populate(this.data);

        return clone;


    }

}

function getDims(arr) {

    let rows = arr.length;
    let cols = arr[0].length;

    return [rows, cols];

}

function addBias(arr, bias) {

    let rows = arr.length;
    let cols = arr[0].length;

    let result = [];

    for(let i = 0; i < rows; i++) {

        result[i] = [];

        for(let j = 0; j < cols; j++) {

            result[i][j] = arr[i][j] + bias[i][0];

        }

    }

    return result;


}

class NeuralNet {

    constructor(i, h1, h2, o) {

        this.i = i;
        this.h1 = h1;
        this.h2 = h2;
        this.o = o;

        const range = [-1, 1]


        this.W1 = new Matrix(h1, i).randomize(...range);
        this.b1 = new Matrix(h1, 1).randomize(...range);
        
        if(h2) {

            this.W2 = new Matrix(h2, h1).randomize(...range);
            this.b2 = new Matrix(h2, 1).randomize(...range);
            this.W3 = new Matrix(o, h2).randomize(...range);
            this.b3 = new Matrix(o, 1).randomize(...range);

        }
        else {

            this.W2 = new Matrix(o, h1).randomize(...range);
            this.b2 = new Matrix(o, 1).randomize(...range);

        }


    }

    sigmoid(x) {

        return x.map(row => row.map(col => 1 / (1 + Math.exp(-col))));

    }


    ReLU(x) {
            
        return x.map(row => row.map(col => Math.max(0, col)));
    
    }

    forward(input) {


        this.input = numbers.matrix.transpose([...input]);



        this.z1 = addBias(numbers.matrix.multiply(this.W1.data, this.input), this.b1.data);
        
        this.a1 = this.ReLU(this.z1);

        if(this.h2) {
            this.z2 = addBias(numbers.matrix.multiply(this.W2.data, this.a1), this.b2.data);
            this.a2 = this.ReLU(this.z2);
            this.z3 = addBias(numbers.matrix.multiply(this.W3.data, this.a2), this.b3.data);
            this.output = this.sigmoid(this.z3);

        }
        else {

            this.z2 = addBias(numbers.matrix.multiply(this.W2.data, this.a1), this.b2.data);
            this.output = this.sigmoid(this.z2);

        }

        return numbers.matrix.transpose(this.output);
    }

    mutate(mutationRate) {

        this.W1.mutate(mutationRate);
        this.b1.mutate(mutationRate);
        this.W2.mutate(mutationRate);
        this.b2.mutate(mutationRate);

        if(this.h2) {
            this.W3.mutate(mutationRate);
            this.b3.mutate(mutationRate);
        }


        return this;

    }

    clone() {

        let net = new NeuralNet(this.i, this.h1, this.h2, this.o);

        net.W1 = this.W1.clone();
        net.b1 = this.b1.clone();
        net.W2 = this.W2.clone();
        net.b2 = this.b2.clone();
        if(this.h2) {
            net.W3 = this.W3.clone();
            net.b3 = this.b3.clone();
        }

        return net;

    }

    isEqual(net) {

        return this.W1.data === net.W1.data && this.b1.data === net.b1.data && this.W2.data === net.W2.data && this.b2.data === net.b2.data && this.W3.data === net.W3.data && this.b3.data === net.b3.data;

    }

}

const net = new NeuralNet(23, 30, 28, 4);

const input = [[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23]];

console.log(net.forward(input));

const net2 = net.clone().mutate(0.1);

console.log(net2.forward(input));