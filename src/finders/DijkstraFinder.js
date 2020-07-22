var BinaryHeap = require('@tyriar/binary-heap');
var Util = require('../core/Util');

/**
 * @constructor
 * @param {Object} opt
 * @param {boolean} opt.allowDiagonal Whether diagonal movement is allowed.
 */
function DijkstraFinder(opt) {
    opt = opt || {};
    this.allowDiagonal = opt.allowDiagonal || true;
    this.compare = opt.comparison || false;

    this.diagonalMovement = this.allowDiagonal;
}

/**
 * Find and return the the path.
 * @return {Array<Array<number>>} The path, including start and
 *    all end positions.
 */
DijkstraFinder.prototype.findPath = function(startX, startY, endX, endY, grid, end) {
    var openList = new BinaryHeap(),
    startNode = grid.getNodeAt(startX, startY),
    destinationIndex = -1,
    endNodes = [], 
    diagonalMovement = this.diagonalMovement,
    compare = this.compare;
    var node, neighbors, neighbor, i, l, x, y, distance, destinationNumber = 1, operations = 0;

    // get all destination nodes from end array
    for(var a=0;a<end.length;a++) {
        endNodes.push(grid.getNodeAt(end[a].x, end[a].y));
    }

    // set the `distance` value of the start node to be 0
    startNode.distance = 0;

    // push the start node into the open list
    openList.insert(startNode.distance, startNode);
    startNode.opened = true;
    operations++;
    startNode.visit = destinationNumber;

    // while the open list is not empty
    while (!openList.isEmpty()) {

        // pop the position of node which has the minimum `distance` value.
        node = openList.extractMinimum().value;
        node.closed = true;
        operations++;

        // check if current node is one of the destinations
        for(var a=0; a<endNodes.length; a++) {
            if(endNodes[a] === node){
                destinationIndex = a;
                break;
            }
        }

        // if reached the any of the destinations, move to next one
        if (destinationIndex>-1) {
            endNodes.splice(destinationIndex, 1);
        
            // increase destinationNumber by 1
            destinationNumber++;

            // if all endNodes have been traced, return the path
            if(endNodes.length === 0) {
                if(compare) {
                   var returnPath = Util.backtrace(node); 
                   return {ops:operations,path:returnPath};
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

            //clear the open List
            openList.clear();
            destinationIndex = -1;
        }

        // get neigbours of the current node
        neighbors = grid.getNeighbors(node, diagonalMovement);
        for (i = 0; i < neighbors.length; i++) {
            neighbor = neighbors[i];

            x = neighbor.x;
            y = neighbor.y;

            // get the distance between current node and the neighbor
            distance = node.distance + ((x - node.x === 0 || y - node.y === 0) ? 1 : Math.SQRT2);

            // check if the neighbor has not been inspected yet, or
            // can be reached with smaller cost from the current node
            if (neighbor.visit !== destinationNumber || distance < neighbor.distance) {
                neighbor.distance = distance;
                neighbor.visit = destinationNumber;
                neighbor.parent = node;
                openList.insert(neighbor.distance, neighbor);
                neighbor.opened = true;
                operations++;
            }
        } // end for each neighbor
    } // end while not open list empty

    if(this.compare) {
         return {ops:operations,path:[]};
    }
    // fail to find the path
    return [];
};

module.exports = DijkstraFinder;
