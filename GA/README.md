Solving Traveling Salesman Problem using Genetic Algorithm
====

Uses p5.js to visualize the process. Left half of the screen uses random swaps to find best path, right half uses Genetic Algorithm.

### Instructions to run

Contains index.html file that can be directly opened using any modern browser. Google chrome recommended.

### Tested this model for values

+ cities : 15
+ population : 20
+ elitism : true | if enabled, no mutation for best path
+ mutation rate : 0.05
+ mutation type : swap
+ crossover window size : 2 | takes 2 parent from best available paths so far, produces 2 children, replaces 2 worst paths
+ fitness : 1/distance between cities


#### References

Inspired from
+ Coding Rainbows
+ http://www.theprojectspot.com/tutorial-post/applying-a-genetic-algorithm-to-the-travelling-salesman-problem/5
