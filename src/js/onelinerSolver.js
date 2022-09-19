const _ = require('lodash');
const GeneticAlgorithmConstructor = require('geneticalgorithm');

const populationSize = 100;
const maxGenerations = 1000;

let edges = {
    a: [1, 2],
    b: [2, 3],
    c: [1, 5],
    d: [2, 5],
    e: [2, 6],
    f: [3, 6],
    g: [3, 7],
    h: [6, 7],
    i: [4, 7],
    j: [4, 5],
    k: [5, 6],
    l: [5, 7],
};

window.OneLinerSolver = {};
window.OneLinerSolver.solve = function(inputEdges) {
    console.log({inputEdges});
    edges = inputEdges;
    const config = {
        mutationFunction: mutation,
        crossoverFunction: crossover,
        fitnessFunction: fitness,
        // doesABeatBFunction: yourCompetitionFunction,
        population: population(),
        populationSize: populationSize 	// defaults to 100
    }
    const geneticalgorithm = GeneticAlgorithmConstructor( config )
    for(let i=0; i<maxGenerations; i++){
        geneticalgorithm.evolve();
        console.log('generation: ' + i, geneticalgorithm.best().genes, geneticalgorithm.bestScore());
        if(geneticalgorithm.bestScore() === Object.keys(edges).length){
            break;
        }
    }
    return geneticalgorithm.best().genes;
}

function population(){
    const population = [];
    for(let i=0; i<populationSize; i++){
        population.push({
            genes: _.chain(edges).keys().shuffle().value(),
        });
    }
    return population;
}

function mutation(individual){
    const position1 = _.random(0, individual.genes.length - 1);
    const position2 = _.random(0, individual.genes.length - 1);
    const temp = individual.genes[position1];
    individual.genes[position1] = individual.genes[position2];
    individual.genes[position2] = temp;
    return individual;
}

function fitness(individual){
    let fitness = 1;
    // current node will be the common node between the first two edges
    let currentNode = _.intersection(edges[individual.genes[0]], edges[individual.genes[1]])[0];
    if(!currentNode){
        return fitness;
    }
    for(let i=1; i<individual.genes.length; i++){
        const edge = individual.genes[i];
        // if the current node is not in the edge, then the edge is not connected to the current node
        if(!_.includes(edges[edge], currentNode)){
            return fitness;
        }
        // current node will be the other node in the edge
        currentNode = _.without(edges[edge], currentNode)[0];
        fitness++;
    }
    return fitness;
}

function crossover(parentA, parentB){
    const crossoverPoint = _.random(1, parentA.genes.length - 1);
    const parentAFirstHalf = _.take(parentA.genes, crossoverPoint);
    const parentASecondHalf = _.takeRight(parentA.genes, parentA.genes.length - crossoverPoint);

    const parentBFirstHalf = _.take(parentB.genes, crossoverPoint);
    const parentBSecondHalf = _.takeRight(parentB.genes, parentB.genes.length - crossoverPoint);

    const offspringA = {
        genes: _.concat(parentASecondHalf, parentAFirstHalf),
    }
    const offspringB = {
        genes: _.concat(parentBSecondHalf, parentBFirstHalf),
    }
    return [offspringA, offspringB];
}
