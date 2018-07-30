

var DEBUG = false;

var cities = [];
var totalCities = 5; //fact(25): 15511210043330985984000000 (~10^24)

var recordDistance;
var bestEver;

var percent = 0;
var iteration = 0;
var totalIterations = 0;
var startDrawing = 0;

var pop;
var populationCount = 20;

//gap to draw two simulation
var screenOffset;

function setup() {
  var cnv = createCanvas(700, 400);
 var x = (windowWidth - width) / 2;
 var y = (windowHeight - height) / 2;
 cnv.position(x, y);
 background(255, 255, 255);
  screenOffset = width/2;

  createPopulation();

  cities = pop.cities.slice();

  var d = calcDistance(cities);
  recordDistance = d;
  bestEver = cities.slice();

  totalIterations = fact(totalCities)

}

function createPopulation() {
    pop = new Population();
    pop.init();
}

function Population () {
    this.count = populationCount;
    this.cityCount = totalCities;
    this.paths = []; // paths used for simulation between cities. Stores index of serial traversal of city
    this.cities = []; // cities used in this simulation. Has screen position of each city
    this.distances = []; //distances of routes. Sum of each city using respective path
    this.fitness = [];
    this.bestPath = 0; //index of best path
    this.useElitism = true;
    this.mutationRate = 0.05;
    this.crossSize = 2; //floor(max(1, this.cityCount/3)); //take the crossover window of size = max(1, total cities/3);
    this.bestDistanceEver = 9999999;

    this.init = function () {
        this.initCities();
        this.initPaths();
        this.updateDistance();
        this.updateFitness();
    }

    this.evolve = function () {
        this.crossover();
        this.mutation();
        this.updateDistance();
        this.updateFitness();
    }

    this.initCities = function() {
        //update random city position coordinates
        for (var i = 0; i < this.cityCount; i++) {
          var v = createVector(random(width/2), random(height));
          this.cities[i] = v;
        }
        console.log(this.cities);
    };

    this.initPaths = function () {
        //generate random path indexes
        var path = [];
        for(var j=0;j < this.cityCount;j++){
            path.push(j);
        }
        for (var i = 0; i < this.count; i++) {
            path = shuffle(path);
            console.log(i+1 + " population: " + path);
            this.paths.push(path);
        }
        console.log("Initial Paths are : " + this.paths);
    };

    this.updateDistance = function () {
        //sum of route distance
        for(var i=0;i<this.count;i++){
            var sum = 0;
            for(j=0;j<this.cityCount-1;j++){
                sum += dist(this.cities[this.paths[i][j]].x, this.cities[this.paths[i][j]].y, this.cities[this.paths[i][j + 1]].x, this.cities[this.paths[i][j + 1]].y);
            }
            this.distances[i] = sum;
            //console.log("d:"+sum);
            //updating best available route uptil now
            if(sum < this.distances[this.bestPath]){
                this.bestPath = i;
            }

            if(sum < this.bestDistanceEver)
                this.bestDistanceEver = sum;
        }
    }

    this.updateFitness = function () {
        for(i=0;i<this.count;i++){
            this.fitness[i] = 1 / this.distances[i];
        }
    }

    this.crossover = function () {
        //pick 2 of the better (shorter) tours parents in the population and combine them to make 2 new child tours.
        //Hopefully, these children tour will be better than either parent

        if(DEBUG)
            console.log("Applying Crossover... ");
        //find best 2 path as parents
        var parentA, parentB;
        var childA = [], childB = [];

        parentA = this.findBest();
        parentB = this.findBest([parentA]);
        //console.log(parentA+" , "+ parentB);

        /*
        //get parent A
        var maxP = 0;
        for(i = 1;i<this.count;i++){
            if(this.distances[i] < this.distances[maxP])
                maxP = i;
        }
        parentA = maxP;
        //console.log(parentA);

        //get parent B
        maxP = (parentA == 0) ? 1 : 0;
        for(i = 0;i<this.count;i++){
            if(i != parentA && this.distances[i] < this.distances[maxP])
                maxP = i;
        }
        parentB = maxP;
        //console.log(parentB);
        */

        childA = Array(this.cityCount).fill(-1);
        childB = Array(this.cityCount).fill(-1);

        //create offsprings

        //console.log("win:"+crossSize);
        var crossPos = floor(random(this.cityCount - this.crossSize));
        //console.log("pos:"+crossPos);

        //child A
        for(var i=0;i<this.cityCount;i++){
            if(i >= crossPos && i <= crossPos+this.crossSize){
                //if we are in crossover window area then copy as it is from parent A
                childA[i] = this.paths[parentA][i];
            }
        }
        for(var i=0, j = 0; i<this.cityCount; i++){
            //copy from parent B if not already added from parent A

            //look for empty spot in child
            while(childA[j] != -1 && j<this.cityCount) j++;

            if(childA.indexOf(this.paths[parentB][i]) == -1){
                childA[j++] = this.paths[parentB][i];
            }
        }

        crossPos = floor(random(this.cityCount - this.crossSize));

        //now child B, switch parents
        for(var i=0; i<this.cityCount; i++){
            if(i >= crossPos && i <= crossPos+this.crossSize){
                //if we are in crossover window area then copy as it is from parent B
                childB[i] = this.paths[parentB][i];
            }
        }
        for(var i=0, j = 0; i<this.cityCount; i++){
            //copy from parent A if not already added from parent B

            //look for empty spot in child
            while(childB[j] != -1 && j<this.cityCount) j++;

            if(childB.indexOf(this.paths[parentA][i]) == -1){
                childB[j++] = this.paths[parentA][i];
            }
        }

        if(DEBUG)
        console.log("Updating population with new childrens");
        //replace new childrens with worst 2
        //find worst
        var worstPathA = this.findWorst();
        var worstPathB = this.findWorst([worstPathA]);

        //replace with
        this.paths[worstPathA] = childA;
        this.paths[worstPathB] = childB;

        if(DEBUG){
            console.log("parents:" + this.paths[parentA] + " || "+this.paths[parentB]);
            console.log("child A:"+childA);
            console.log("child B:"+childB);
        }
    }

    this.mutation = function () {
        //applying swap mutation
        if(DEBUG)
            console.log("Applying mutation with rate:"+this.mutationRate);

        if(this.mutationRate < random()){
            var pathindex;// = Math.floor(random(this.count));

            var currentBestPath = this.findBest();

            for(pathindex = 0;pathindex<this.count;pathindex++){

                if(this.useElitism === true && currentBestPath == pathindex)
                {
                    //dont apply mutation to best fitness path if elitism on
                    continue;
                }
                var cityindexA = Math.floor(random(this.cityCount));
                var cityindexB = Math.floor(random(this.cityCount));

                //if(DEBUG)
                //    console.log("Mutated path: "+this.paths[pathindex]);

                swap(this.paths[pathindex], cityindexA, cityindexB);

                //if(DEBUG)
                //    console.log("to path: "+this.paths[pathindex]);
            }
        }
    }

    //find path with best fitness, ignoring paths provided in argument
    this.findBest = function (ignoreList) {
        var best = 0;
        ignoreList = ignoreList || [];

        for(i = 0;i<this.count;i++){
            var ignore = false;
            for(j=0;j<ignoreList.length;j++){
                if(i == ignoreList[j])
                {
                    ignore = true;
                }

                if(best == ignoreList[i]){
                    best++;
                }
            }

            if(ignore === true){
                continue;
            }

            if(this.fitness[i] > this.fitness[best])
                best = i;

        }

        return best;
    }

    //find path with lowest fitness, ignoring paths provided in argument
    this.findWorst = function (ignoreList) {
        var worst = 0;
        ignoreList = ignoreList || [];

        for(i = 0;i<this.count;i++){
            var ignore = false;
            for(j=0;j<ignoreList.length;j++){
                if(i == ignoreList[j])
                {
                    ignore = true;
                }

                if(worst == ignoreList[i]){
                    worst++;
                }
            }

            if(ignore === true){
                continue;
            }

            if(this.fitness[i] < this.fitness[worst])
                worst = i;

        }

        return worst;
    }
}

function draw() {
  if (startDrawing == 1) {

  randomTSP();
  gaTSP();
  iteration++;
  percent = iteration/totalIterations * 100;
  text(percent, 20, height - 60)
  if(percent > 99.99)
     noLoop();
  text(iteration, 20, height - 20)
}

}

function gaTSP() {

    //background(0);

    //drawing cities
    fill(0);
    noStroke();
    for (var i = 0; i < cities.length; i++) {
      ellipse(screenOffset + cities[i].x, cities[i].y, 12, 12);
    }

    stroke(0);
    strokeWeight(1);
    noFill();
    //drawing current second best
    beginShape();
    for (var i = 0; i < pop.cityCount; i++) {
        var secondBest = pop.findBest([pop.bestPath]);
        console.log(secondBest);
        vertex(screenOffset + pop.cities[pop.paths[secondBest][i]].x, pop.cities[pop.paths[secondBest][i]].y);
    }
    endShape();

    //draw current best path
    stroke(255, 0, 0);
    strokeWeight(2);
    noFill();
    beginShape();
    for (var i = 0; i < pop.cityCount; i++) {
        vertex(screenOffset + pop.cities[pop.paths[pop.bestPath][i]].x, pop.cities[pop.paths[pop.bestPath][i]].y);
    }
    endShape();


    textSize(16);
    fill(0);

    pop.evolve();

    //display best path distance
    text(pop.distances[pop.bestPath], width - 200, height - 20);

    //if elitism is off, draw best ever distance found so far in simulation
    if(pop.useElitism === false){
        text(pop.bestDistanceEver, width - 200, 20);
    }
}

function randomTSP() {
    //clear screen
    background(255,255,255);

    //drawing cities
    fill(0);
    noStroke();
    for (var i = 0; i < cities.length; i++) {
      ellipse(cities[i].x, cities[i].y, 12, 12);
    }

    //draw current processing path
    stroke(0);
    strokeWeight(1);
    noFill();
    beginShape();
    for (var i = 0; i < cities.length; i++) {
      vertex(cities[i].x, cities[i].y);
    }
    endShape();


    //draw best path ever
    stroke(0, 0, 255);
    strokeWeight(2);
    noFill();
    beginShape();
    for (var i = 0; i < cities.length; i++) {
      vertex(bestEver[i].x, bestEver[i].y);
    }
    endShape();

    //applying random swaps
    var i = floor(random(cities.length));
    var j = floor(random(cities.length));
    swap(cities, i, j);

    //is this better than before?
    var d = calcDistance(cities);
    if (d < recordDistance) {
      recordDistance = d;
      bestEver = cities.slice();
    }

    fill(0);
    text(recordDistance, width/2 -60, height -20)
}

function swap(a, i, j) {
  var temp = a[i];
  a[i] = a[j];
  a[j] = temp;
}


function calcDistance(points) {
  var sum = 0;
  for (var i = 0; i < points.length - 1; i++) {
    var d = dist(points[i].x, points[i].y, points[i + 1].x, points[i + 1].y);
    sum += d;
  }
  return sum;
}

function fact(i) {
    var res = i;
    while(i>1){
        res *= i-1;
        i--;
    }
    return res;
}

//fisher-yates algo
// function shuffle(array) {
//   var currentIndex = array.length, temporaryValue, randomIndex;
//
//   // While there remain elements to shuffle...
//   while (0 !== currentIndex) {
//
//     // Pick a remaining element...
//     randomIndex = Math.floor(Math.random() * currentIndex);
//     currentIndex -= 1;
//
//     // And swap it with the current element.
//     temporaryValue = array[currentIndex];
//     array[currentIndex] = array[randomIndex];
//     array[randomIndex] = temporaryValue;
//   }
//
//   return array;
// }
