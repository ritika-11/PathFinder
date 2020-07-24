/**
 * @author ritika
 */

var BinaryHeap = require('@tyriar/binary-heap');
var Util       = require('../core/Util');
var Heuristic  = require('../core/Heuristic');

/**
 * @constructor
 * @param {Object} opt
 * @param {boolean} opt.allowDiagonal Whether diagonal movement is allowed.
 * @param {function} opt.heuristic Heuristic function to estimate the distance
 *     (defaults to manhattan).
 * @param {boolean} opt.comparison Whether the algo needs to be run for comparison
 */
function BestFirstFinder(opt) {
    opt = opt || {};
    this.allowDiagonal = opt.allowDiagonal || true;
    this.heuristic = opt.heuristic || Heuristic.manhattan;
    this.compare = opt.comparison || false;

    this.diagonalMovement = this.allowDiagonal;
}

/**
 * Find and return the the path.
 * @return {Array<Array<number>>} The path, including start and
 *    all end positions.
 */
BestFirstFinder.prototype.findPath = function(startX, startY, endX, endY, grid, end) {
    var openList = new BinaryHeap(),
        temporaryDestination,
        startNode = grid.getNodeAt(startX, startY),
        endNodes = [],
        heuristic = this.heuristic,
        diagonalMovement = this.diagonalMovement,
        compare = this.compare,
        abs = Math.abs, node, neighbors, neighbor, i, x, y, destinationNumber = 1, operations = 0;

        // get all destination nodes from end array
        for(var a=0;a<end.length;a++) {
            endNodes.push(grid.getNodeAt(end[a].x, end[a].y));
        }

    // set the `heuristic` value of the start node to be heuristic from 1st (can be any as of now) endNode
    startNode.heuristic = heuristic(abs(startX - end[0].x), abs(startY - end[0].y));

    // push the start node into the open list
    openList.insert(startNode.heuristic, startNode);
    startNode.opened = true;
    operations++;
    startNode.visit = destinationNumber;

    // while the open list is not empty
    while (!openList.isEmpty()) {

        // extract the position of node which has the minimum `h` value.
        node = openList.extractMinimum().value;
        node.closed = true;
        operations++;

        // calculate the heuristic of current node from all endNodes and store in a heap
        var endList = new BinaryHeap();
        for(i=0;i<endNodes.length;i++) {
            endList.insert(heuristic(abs(node.x - endNodes[i].x), abs(node.y - endNodes[i].y)), endNodes[i]);
        }

        // extract the endNode having the nearest distance from current node
        if(!endList.isEmpty()) {
            temporaryDestination = endList.extractMinimum().value;
        }

        // check if reached any of the end positions
        if (node === temporaryDestination) {
            var index = endNodes.indexOf(temporaryDestination);
            if (index > -1) {
                endNodes.splice(index, 1);
            }

            // increase destinationNumber by 1
            destinationNumber++;

            // if all endNodes have been traced, return the path
            if(endNodes.length === 0) {
                if(compare) {
                    var returnPath = Util.backtrace(temporaryDestination); 
                     return {ops:operations,path:returnPath};
                }
                return Util.backtrace(temporaryDestination); 
            }

            //set the visit number of all nodes which are a part of the path to 
            // current destinationNumber so that they are not explored again 
            var current = node;
            while(current) {
                current.visit = destinationNumber;
                current = current.parent;
            }

            //clear the current openList and start exploring next nearest destination
            openList.clear();
            temporaryDestination = endList.extractMinimum().value;

        }

        // get neigbours of the current node
        neighbors = grid.getNeighbors(node, diagonalMovement);
        for (i = 0; i< neighbors.length; i++) {
            neighbor = neighbors[i];

            x = neighbor.x;
            y = neighbor.y;

            if(!neighbor.visit) {
                neighbor.visit = 0;
            }

            // check if the neighbor has not been inspected yet
            if (neighbor.visit !== destinationNumber) {
                neighbor.heuristic = heuristic(abs(x - temporaryDestination.x), abs(y - temporaryDestination.y));
                neighbor.parent = node;
                neighbor.visit = destinationNumber;
                openList.insert(neighbor.heuristic, neighbor);
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

module.exports = BestFirstFinder;
