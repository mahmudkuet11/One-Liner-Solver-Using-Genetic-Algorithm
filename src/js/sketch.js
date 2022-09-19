let addNodeButton;
let addEdgeButton;
let resetAllButton;
let solveButton;
const buttonSeparatorY = 70;
let mode = 'node';
let nodes = [];
let edges = [];
let currentEdge;
let solutionPath = 'Solution path will be shown here';

let canvasDimensions = {
    width: 350,
    height: 600,
}

function setup() {
    createCanvas(canvasDimensions.width, canvasDimensions.height);
    addButtons();
}

function draw() {
    background(220);
    stroke('black');
    strokeWeight(2);
    line(0, buttonSeparatorY, canvasDimensions.width, buttonSeparatorY);

    for (let edge of edges) {
        stroke('blue');
        strokeWeight(10);
        line(edge.from.x, edge.from.y, edge.to.x, edge.to.y);
    }
    if (currentEdge) {
        stroke('blue');
        strokeWeight(10);
        let to = currentEdge.to ? currentEdge.to : {x: mouseX, y: mouseY};
        line(currentEdge.from.x, currentEdge.from.y, to.x, to.y);
    }

    for (let node of nodes) {
        fill('red');
        strokeWeight(0);
        circle(node.x, node.y, 30);
        fill('white')
        textSize(18);
        textAlign(CENTER, CENTER);
        text(node.label, node.x, node.y);
    }

    fill('green');
    strokeWeight(0);
    textSize(22);
    textAlign(CENTER, CENTER);
    textWrap(WORD);
    text(solutionPath, 0, canvasDimensions.height - 100, canvasDimensions.width);
}

function addButtons() {
    addNodeButton = createButton('Add Node');
    addNodeButton.position(10, 10);
    addNodeButton.mousePressed(() => {
        mode = 'node';
    });

    addEdgeButton = createButton('Add Edge');
    addEdgeButton.position(90, 10);
    addEdgeButton.mousePressed(() => {
        mode = 'edge';
    });

    resetAllButton = createButton('Reset All');
    resetAllButton.position(170, 10);
    resetAllButton.mousePressed(() => {
        nodes = [];
        edges = [];
        solutionPath = 'Solution path will be shown here';
    });

    solveButton = createButton('Solve');
    solveButton.position(10, 40);
    solveButton.mousePressed(() => {
        const edgesMap = getEdgesMap(edges);
        const solution = window.OneLinerSolver.solve(edgesMap);
        solutionPath = getNodePathFromEdges(edgesMap, solution);
    });
}

function getEdgesMap(edges) {
    return _.chain(edges)
        .map((edge) => {
            return [edge.from.label, edge.to.label];
        })
        .mapKeys((edge) => {
            return _.chain([edge[0], edge[1]])
                .sort()
                .join('_')
                .value();
        })
        .value();
}

function getNodePathFromEdges(edgesMap, edgesArray){
    const edges = _.cloneDeep(edgesArray);
    const edgesMapCopy = _.cloneDeep(edgesMap);
    const nodePath = [];
    let intersection = _.intersection(edgesMapCopy[edges[0]], edgesMapCopy[edges[1]]);
    let currentNode = intersection[0];
    nodePath.push(_.without(edgesMapCopy[edges[0]], currentNode)[0]);
    nodePath.push(currentNode);
    for(let i=1; i<edges.length; i++){
        const edge = edges[i];
        const edgeNodes = edgesMapCopy[edge];
        const otherNode = _.without(edgeNodes, currentNode)[0];
        nodePath.push(otherNode);
        currentNode = otherNode;
    }
    return nodePath.join(', ');
}

function mouseClicked() {
    if (mouseY < buttonSeparatorY) {
        return false;
    }

    if (mouseX > canvasDimensions.width || mouseY > canvasDimensions.height) {
        return false;
    }
    if (mode === 'node') {
        addNode();
    }
    if (mode === 'edge') {
        addEdge();
    }
}

function addNode() {
    nodes.push({x: mouseX, y: mouseY, label: nodes.length + 1});
}

function addEdge() {
    let closestNode = _.chain(nodes)
        .minBy((node) => {
            return dist(node.x, node.y, mouseX, mouseY);
        })
        .value();
    if (!closestNode) return null;

    let edge = currentEdge;
    if (!edge) {
        edge = {};
        edge.from = closestNode;
        edge.label = `e${edges.length + 1}`;
        currentEdge = edge;
    } else {
        edge.to = closestNode;
        currentEdge = null;
        pushUniqueEdge(edge);
    }
}

function pushUniqueEdge(newEdge) {
    let duplicatedEdge = _.find(edges, (edge) => {
        return getHashOfEdge(edge) === getHashOfEdge(newEdge);
    });

    if (duplicatedEdge) {
        return null;
    }
    edges.push(newEdge);
}

function getHashOfEdge(edge) {
    return _.chain([edge.from.label, edge.to.label])
        .sort()
        .join('_')
        .value();
}

