var Util = require('../core/Util');

/**
 * Breadth-First-Search path finder.
 * @constructor
 * @param {Object} opt
 * @param {boolean} opt.allowDiagonal Whether diagonal movement is allowed.
 */
function BreadthFirstFinder(opt) {
    opt = opt || {};
    this.allowDiagonal = opt.allowDiagonal || true;
    this.compare = opt.compare || false;

    this.diagonalMovement = this.allowDiagonal;
}

/**
 * Find and return the the path.
 * @return {Array<Array<number>>} The path, including start and
 *    all end positions.
 */
BreadthFirstFinder.prototype.findPath = function(startX, startY, endX, endY, grid, end) {
    var openList = [],
        diagonalMovement = this.diagonalMovement,
        compare = this.compare;
        startNode = grid.getNodeAt(startX, startY),
        endNodes = [],
        neighbors, neighbor, node, i, l, destinationIndex = -1, destinationNumber = 1, operations = 0;

    // get all destination nodes from end array
    for(var a=0 ;a<end.length; a++) {
        endNodes.push(grid.getNodeAt(end[a].x, end[a].y));
    }

    // push the start pos into the queue
    openList.push(startNode);
    startNode.opened = true;
    operations++;
    startNode.visit = destinationNumber;

    // while the queue is not empty
    while (openList.length) {

        // take the front node from the queue
        node = openList.shift();
        node.closed = true;
        operations++;

        // check if current node is one of the destinations
        for(var a=0;a<endNodes.length;a++) {
            if(endNodes[a] === node){
                destinationIndex = a;
                break;
            }
        }

        // if reached any of the destinations, move to next one 
        if (destinationIndex>-1) {
            endNodes.splice(destinationIndex, 1);

            // increase destinationNumber by 1
            destinationNumber++;

            // if all endNodes have been traced, return the path
            if(endNodes.length === 0) {
                if(compare) {
                    return operations;
                }
                return Util.backtrace(node); 
            }

            //set the visit number of all nodes which are a part of the path to 
            // current destinationNumber so that they are not explored again 
            var current = node;
            while(current) {
                current.visit = destinationNumber;
                current = current.parent;
            }

            // clear the open List
            openList.splice(0, openList.length);
            destinationIndex = -1;
        }

        neighbors = grid.getNeighbors(node, diagonalMovement);
        for (i = 0; i < neighbors.length; i++) {
            neighbor = neighbors[i];

            if(neighbor.visit !== destinationNumber) {
                openList.push(neighbor);
                neighbor.visit = destinationNumber;
                neighbor.opened = true;
                operations++;
                neighbor.parent = node;
            }

        }
    }

    if(this.compare) {
        return operations;
    }
    // fail to find the path
    return [];
};

module.exports = BreadthFirstFinder;
