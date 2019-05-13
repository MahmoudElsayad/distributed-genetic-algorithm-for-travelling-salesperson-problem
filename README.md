# Distributed Genetic Algorithm Implementation for Travelling Salesperson Problem

* This project is a distributed genetic algorithm implementation for solving the travelling salesperson problem using Docker Swarm for distributing the computation over any numbers of clusters, while preserving the best generation over all clusters.
* It offers an interactive UI for tracking the progress of the algorithm, viewing statistics for the number of clusters running and the amount of computations done, and changing the TPS problem.

### What is Travelling Salesperson problem ?
You can check [GeeksforGeeks tutorial about TSP problem](https://www.geeksforgeeks.org/travelling-salesman-problem-set-1/)

### What are Genetic Algorithms ? 
[Introduction to Genetic Algorithms — Including Example Code](https://towardsdatascience.com/introduction-to-genetic-algorithms-including-example-code-e396e98d8bf3)

### This project's main idea is based upon a type of distributed computing called "Volunteer Computing" 
[What is Volunteer Computing](https://en.wikipedia.org/wiki/Volunteer_computing)

-----



## Steps for running the project using Docker

1. Install Docker [Installation Guide](https://docs.docker.com/install/)
2. After installation, we can pull the docker repository i made containing the whole project, and you will have the whole application out-of-the-box working and running perfectly fine, without the need of any dependency installation.
3. Open 'CMD'
4. run this command "docker images", to check for the available images on your machine.
5. run this command to pull the docker image for the project "docker pull elsayad/tsp-nodejs-volunteercomputing"
6. to run the docker image "docker run -d --name tsp-app -p 3000:3000 elsayad/tsp-nodejs-volunteercomputing"
Now the docker container is mapped to port 3000 on localhost

#### Useful Commands :-
-d ==> detach mode, meaning that it will run in the background
-p ==> mapping the image's port to a real port on the pc, so we are mapping port 3000 in the image to port 3000 on our physical machine.
--name ==> giving alias for the running docker

7. Now lets check that the project runs smoothly, and fine.
8. Now, lets try adding some more participants to support computation


## Docker Swarm 
Now, lets make a docker Swarm from that particular docker image, so that it runs over multiple servers, but we only have this machine, so that we will simulate that by making a docker swarm over this pc only.

** Stop running containers first 
1. Initialize a docker swarm, and a token will be provided that will be used to add additional nodes in a secure fashion.
2. run "docker swarm init"
3. Now, we made a manager, then we can add workers to it using this command 
``` docker swarm join --token SWMTKN-1-35mx0b0y7d1e0dhtoezg8ahlgel2o0vffz247j1hloxn28raya-ch9fv91q360sp5zc03jiamfq6 192.168.65.3:2377 ```
#### NOTE: That command is a custom depending on your machine, so you will need to copy the one that appears on your machine

4. To add another manager we use this
``` docker swarm join-token manager ```
5. To view all the nodes in the swarm use `docker node ls`
6. We have only 1 node and its the LEADER node
7. Next thing that we need to create a new overlay network and call it anything, so that all containers registered to this network can communicate with each other, regardless of which node they are deployed onto.
run `docker network create -d overlay aastnet`
8. Next step is to create a new service "Our own project" to run over the available nodes from the IMAGE we downloaded earlier
run `docker service create --name tsp-ga-app --network aastnet --replicas 2 -p 3000:3000 elsayad/tsp-nodejs-volunteercomputing`
9. Now , we check for our service running `docker service ls`
10. We can check for the running nodes using `docker service ps tsp-ga-app`
11.If we need to scale our project to run across over 5 container for example we use the following command `docker service scale tsp-ga-app=5`


