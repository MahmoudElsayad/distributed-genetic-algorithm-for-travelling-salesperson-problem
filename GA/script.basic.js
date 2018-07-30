/*
* Kush Kumar Sharma
* Apache License | Version 2.0, January 2004 | http://www.apache.org/licenses/
*/

var cities = [];
var totalCities = 7;

var recordDistance;
var bestEver;

var percent = 0;
var iteration = 0;
var totalIterations = 0;

function setup() {
  createCanvas(600, 500);
  for (var i = 0; i < totalCities; i++) {
    var v = createVector(random(width), random(height));
    cities[i] = v;
  }

  var d = calcDistance(cities);
  recordDistance = d;
  bestEver = cities.slice();

  totalIterations = fact(totalCities)

}

function draw() {
  background(0);
  fill(255);
  for (var i = 0; i < cities.length; i++) {
    ellipse(cities[i].x, cities[i].y, 8, 8);
  }

  stroke(255);
  strokeWeight(2);
  noFill();
  beginShape();
  for (var i = 0; i < cities.length; i++) {
    vertex(cities[i].x, cities[i].y);
  }
  endShape();

  stroke(155, 10, 255);
  strokeWeight(4);
  noFill();
  beginShape();
  for (var i = 0; i < cities.length; i++) {
    vertex(bestEver[i].x, bestEver[i].y);
  }
  endShape();



  var i = floor(random(cities.length));
  var j = floor(random(cities.length));
  swap(cities, i, j);

  var d = calcDistance(cities);
  if (d < recordDistance) {
    recordDistance = d;
    bestEver = cities.slice();
  }

  iteration++;
  percent = iteration/totalIterations * 100;
  //console.log("%:"+ percent + " ti:"+totalIterations+" i:"+iteration)
  //if(percent > 99.99)
  //    noLoop();
  textSize(32);
  fill(255);
  text(iteration, 20, height - 20)

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
