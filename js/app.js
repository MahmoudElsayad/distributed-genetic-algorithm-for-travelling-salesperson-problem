var socket = io.connect();
var DEBUG = false;
var cities = [];
var totalCities = 0; //fact(25): 15511210043330985984000000 (~10^24)
var recordDistance;
var bestEver;
var percent = 0;
var iteration = 0;
var totalIterations = 0;
var startDrawing = 0;
var pop;
var populationCount = 20;
var tempCities = [];
var screenOffset;
var citiesText = [0,1,2,3,4,5,6,7,8,9];
var bestResultSoFar = [];
var bestDistanceSoFar = 0;

function setup() {
if (window.app.setup == 1) {
  window.app.setupNewNotification = true;
  // console.log(window.app.newNotification);
  window.app.setupNotification = "Setting up the environment variables."
  let canvas = createCanvas(1000,1000);
  screenOffset = width / 2;
  canvas.parent('#graph');
  createPopulation();

  cities = pop.cities.slice();
  var d = calcDistance(cities);
  recordDistance = d;
  bestEver = cities.slice();

  totalIterations = fact(totalCities)

  window.app.setupNotification = "Done Setting up the environment variables."
  setTimeout(function(){ window.app.setupNewNotification = false; }, 5000);
}

};

function createPopulation(cities) {
  pop = new Population();
  pop.init();
}

function Population() {
  this.count = populationCount;
  this.cityCount = totalCities;
  this.paths = []; // paths used for simulation between cities. Stores index of serial traversal of city
  this.cities = []; // cities used in this simulation. Has screen position of each city
  this.distances = []; //distances of routes. Sum of each city using respective path
  this.fitness = [];
  this.bestPath = 0; //index of best path
  this.useElitism = true;
  this.mutationRate = 0.08;
  this.crossSize = 2; //floor(max(1, this.cityCount/3)); //take the crossover window of size = max(1, total cities/3);
  this.bestDistanceEver = 9999999;

  this.init = function() {
    this.initCities();
    this.initPaths();
    this.updateDistance();
    this.updateFitness();
  }

  this.evolve = function() {
    this.crossover();
    this.mutation();
    this.updateDistance();
    this.updateFitness();
  }

  this.initCities = function() {
    var c = JSON.parse(tempCities);

    //update random city position coordinates
    for (var i = 0; i < this.cityCount; i++) {
      var v = createVector(c[i].x, c[i].y);
      this.cities[i] = v;
    }
    console.log(this.cities);
  };

  this.initPaths = function() {
    //generate random path indexes
    var path = [];
    for (var j = 0; j < this.cityCount; j++) {
      path.push(j);
    }
    for (var i = 0; i < this.count; i++) {
      if (bestResultSoFar.length > 0) {
      path = bestResultSoFar;
      console.log(i + 1 + " population: " + path);
      this.paths.push(path);
      }
      path = shuffle(path);
      console.log(i + 1 + " population: " + path);
      this.paths.push(path);
    }
    console.log("Initial Paths are : " + this.paths);
  };

  this.updateDistance = function() {
    //sum of route distance
    for (var i = 0; i < this.count; i++) {
      var sum = 0;
      for (j = 0; j < this.cityCount - 1; j++) {
        sum += dist(this.cities[this.paths[i][j]].x, this.cities[this.paths[i][j]].y, this.cities[this.paths[i][j + 1]].x, this.cities[this.paths[i][j + 1]].y);
      }
      this.distances[i] = sum;
      //console.log("d:"+sum);
      //updating best available route uptil now
      if (sum < this.distances[this.bestPath]) {
        this.bestPath = i;
        var temp = {
          "distance": this.distances[this.bestPath],
          "bestPath": this.paths[this.bestPath]
        };

        ////// problem here /////////
        socket.emit('bestPath', temp);
        console.log("emitted: " + temp.bestPath);

      }

      if (sum < this.bestDistanceEver)
        this.bestDistanceEver = sum;

    }
  }

  this.updateFitness = function() {
    for (i = 0; i < this.count; i++) {
      this.fitness[i] = 1 / this.distances[i];
    }
  }

  this.crossover = function() {

    if (DEBUG)
      console.log("Applying Crossover... ");
    //find best 2 path as parents
    var parentA, parentB;
    var childA = [],
      childB = [];

    parentA = this.findBest();
    parentB = this.findBest([parentA]);
    //console.log(parentA+" , "+ parentB);

    childA = Array(this.cityCount).fill(-1);
    childB = Array(this.cityCount).fill(-1);

    var crossPos = floor(random(this.cityCount - this.crossSize));

    for (var i = 0; i < this.cityCount; i++) {
      if (i >= crossPos && i <= crossPos + this.crossSize) {
        //if we are in crossover window area then copy as it is from parent A
        childA[i] = this.paths[parentA][i];
      }
    }
    for (var i = 0, j = 0; i < this.cityCount; i++) {
      //copy from parent B if not already added from parent A

      //look for empty spot in child
      while (childA[j] != -1 && j < this.cityCount) j++;

      if (childA.indexOf(this.paths[parentB][i]) == -1) {
        childA[j++] = this.paths[parentB][i];
      }
    }

    crossPos = floor(random(this.cityCount - this.crossSize));

    //now child B, switch parents
    for (var i = 0; i < this.cityCount; i++) {
      if (i >= crossPos && i <= crossPos + this.crossSize) {
        //if we are in crossover window area then copy as it is from parent B
        childB[i] = this.paths[parentB][i];
      }
    }
    for (var i = 0, j = 0; i < this.cityCount; i++) {
      //copy from parent A if not already added from parent B

      //look for empty spot in child
      while (childB[j] != -1 && j < this.cityCount) j++;

      if (childB.indexOf(this.paths[parentA][i]) == -1) {
        childB[j++] = this.paths[parentA][i];
      }
    }

    if (DEBUG)
      console.log("Updating population with new childrens");
    //replace new childrens with worst 2
    //find worst
    var worstPathA = this.findWorst();
    var worstPathB = this.findWorst([worstPathA]);

    //replace with
    this.paths[worstPathA] = childA;
    this.paths[worstPathB] = childB;

    if (DEBUG) {
      console.log("parents:" + this.paths[parentA] + " || " + this.paths[parentB]);
      console.log("child A:" + childA);
      console.log("child B:" + childB);
    }
  }

  this.mutation = function() {
    //applying swap mutation
    if (DEBUG)
      console.log("Applying mutation with rate:" + this.mutationRate);
    if (this.mutationRate < random()) {
      var pathindex; // = Math.floor(random(this.count));
      var currentBestPath = this.findBest();
      for (pathindex = 0; pathindex < this.count; pathindex++) {
        if (this.useElitism === true && currentBestPath == pathindex) {
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
  this.findBest = function(ignoreList) {
    var best = 0;
    ignoreList = ignoreList || [];

    for (i = 0; i < this.count; i++) {
      var ignore = false;
      for (j = 0; j < ignoreList.length; j++) {
        if (i == ignoreList[j]) {
          ignore = true;
        }
        if (best == ignoreList[i]) {
          best++;
        }
      }
      if (ignore === true) {
        continue;
      }
      if (this.fitness[i] > this.fitness[best])
        best = i;
    }
    return best;
  }

  //find path with lowest fitness, ignoring paths provided in argument
  this.findWorst = function(ignoreList) {
    var worst = 0;
    ignoreList = ignoreList || [];

    for (i = 0; i < this.count; i++) {
      var ignore = false;
      for (j = 0; j < ignoreList.length; j++) {
        if (i == ignoreList[j]) {
          ignore = true;
        }
        if (worst == ignoreList[i]) {
          worst++;
        }
      }
      if (ignore === true) {
        continue;
      }
      if (this.fitness[i] < this.fitness[worst])
        worst = i;
    }
    return worst;
  }
}

function draw() {
  if (window.app.compute == 1) {
    // randomTSP();
    gaTSP();
    iteration++;
    window.app.iteration = iteration;
    percent = iteration / totalIterations * 100;
    window.app.percent = percent.toFixed(4);
    // text(percent, 20, height - 60)
    if (percent > 99.99)
      noLoop();
    // text(iteration, 20, height - 20)
  }

}

function gaTSP() {

  //clear screen
    clear();

  //drawing cities
  fill('#FFF');
  noStroke();
  for (var i = 0; i < cities.length; i++) {

    ellipse(cities[i].x, cities[i].y, 12, 12);
    // ellipse(screenOffset + cities[i].x, cities[i].y, 12, 12);
  }

  stroke('#fff');
  strokeWeight(1);
  noFill();
  //drawing current second best
  beginShape();
  for (var i = 0; i < pop.cityCount; i++) {
    var secondBest = pop.findBest([pop.bestPath]);
    vertex(pop.cities[pop.paths[secondBest][i]].x, pop.cities[pop.paths[secondBest][i]].y);
    // vertex(screenOffset + pop.cities[pop.paths[secondBest][i]].x, pop.cities[pop.paths[secondBest][i]].y);
  }
  endShape();

  //draw current best path
  stroke('#9575cd');
  strokeWeight(2);
  noFill();
  beginShape();
  for (var i = 0; i < pop.cityCount; i++) {
    if (i ==0) {
      stroke('#F00');
    }
    vertex(pop.cities[pop.paths[pop.bestPath][i]].x, pop.cities[pop.paths[pop.bestPath][i]].y);
    // vertex(screenOffset + pop.cities[pop.paths[pop.bestPath][i]].x, pop.cities[pop.paths[pop.bestPath][i]].y);
    noStroke();
    fill('#9575cd');
    text(pop.paths[pop.bestPath][i],pop.cities[pop.paths[pop.bestPath][i]].x + 10, pop.cities[pop.paths[pop.bestPath][i]].y-10);
    noFill();
    stroke('#9575cd');
    strokeWeight(2);
    // text(pop.paths[pop.bestPath][i],pop.cities[pop.paths[pop.bestPath][i]].x + 10 + screenOffset, pop.cities[pop.paths[pop.bestPath][i]].y-10);
  }
  endShape();
  textSize(16);
  fill('#fff');
  pop.evolve();
  //display best path distance
  fill('#9575cd');
  noStroke();
  // text("Minimal Cost so far: " + pop.distances[pop.bestPath].toFixed(0), width/2 - 200, height - 300);
  window.app.minimalCost = pop.distances[pop.bestPath].toFixed(0);

  //if elitism is off, draw best ever distance found so far in simulation
  if (pop.useElitism === false) {
    text(pop.bestDistanceEver, width - 200, 20);
  }
}

function randomTSP() {
  //clear screen
  background(255, 255, 255);

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
    text(Math.floor(bestEver[i].x)+ " , " + Math.floor(bestEver[i].y),bestEver[i].x + 15, bestEver[i].y-15);
  }
  endShape();
  textSize(16);
  fill(0);
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

  fill(0,0,255);
  noStroke();
  text("Minimal Cost so far: " + recordDistance.toFixed(0), width / 2 - 200, height - 300)
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
  while (i > 1) {
    res *= i - 1;
    i--;
  }
  return res;
}


//////////////////////////////////////////////// VUE JS CODE ///////////////////////////////////////////////////////

setTimeout(function(){ socket.emit('checkPath')}, 10000);


window.app = new Vue({
  el: "#fullpage",
  data: {
    bestPath: [],
    minDistance: 0,
    globalCounter: 0,
    localCounter: 0,
    connectedUsers: 0,
    compute: 0,
    setup: 0,
    iteration: 0,
    percent: 0,
    notification: "",
    newNotification: false,
    setupNotification: "",
    setupNewNotification: false,
    minimalCost: 0
  },
  created: function() {
    socket.on('connectedUsers', function(connectedUsers) {
      this.connectedUsers = connectedUsers;
    }.bind(this));

    socket.on('cities', function(contents) {
      tempCities = contents;
      totalCities = JSON.parse(tempCities).length;
    }.bind(this));

    socket.on('bestResultSoFar', function(bestTemp){
      if (bestTemp.bestPath.length == tempCities.lenght) {
        bestResultSoFar = bestTemp.bestPath;
        bestDistanceSoFar = bestTemp.distance;
      }
    }.bind(this));

    socket.on('bestNewPath', function(newPath) {
      pop.paths[pop.bestPath] = newPath;
      window.app.newNotification = true;
      window.app.notification = "New Minimal Cost has been found."
      setTimeout(function(){ window.app.newNotification = false; }, 2000);
    }.bind(this));

    socket.on('checkedPath', function(newPath) {
      pop.paths[pop.bestPath] = newPath;
      window.app.newNotification = true;
      window.app.notification = "New Minimal Cost has been found."
      setTimeout(function(){ window.app.newNotification = false; }, 2000);
    }.bind(this));


  },
  methods: {
    participate: function() {
      this.compute = 1;
    },
    set: function(){
      this.setup = 1;
      setup();
    }
  },
  mounted: function() {

  }
});


//Pushing me outside myself ,
