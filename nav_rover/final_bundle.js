(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
var Node = require('./Node.js');

/**
 * The Grid class, which serves as the encapsulation of the layout of the nodes.
 * @constructor
 * @param {number|Array<Array<(number|boolean)>>} width_or_matrix Number of columns of the grid, or matrix
 * @param {number} height Number of rows of the grid.
 * @param {Array<Array<(number|boolean)>>} [matrix] - A 0-1 matrix
 *     representing the walkable status of the nodes(0 or false for walkable).
 *     If the matrix is not supplied, all the nodes will be walkable.  */
module.exports = class Grid {
    constructor(width_or_matrix, height, matrix) {
        var width;

        if (typeof width_or_matrix !== 'object') {
            width = width_or_matrix;
        }
        else {
            height = width_or_matrix.length;
            width = width_or_matrix[0].length;
            matrix = width_or_matrix;
        }

        /**
         * The number of columns of the grid.
         * @type number
         */
        this.width = width;
        /**
         * The number of rows of the grid.
         * @type number
         */
        this.height = height;

        /**
         * A 2D array of nodes.
         */
        this.nodes = this._buildNodes(width, height, matrix);
    }
    /**
     * Build and return the nodes.
     * @private
     * @param {number} width
     * @param {number} height
     * @param {Array<Array<number|boolean>>} [matrix] - A 0-1 matrix representing
     *     the walkable status of the nodes.
     * @see Grid
     */
    _buildNodes(width, height, matrix) {
        var i, j,
            nodes = new Array(height);

        for (i = 0; i < height; ++i) {
            nodes[i] = new Array(width);
            for (j = 0; j < width; ++j) {
                nodes[i][j] = new Node(j, i);
            }
        }


        if (matrix === undefined) {
            return nodes;
        }

        if (matrix.length !== height || matrix[0].length !== width) {
            throw new Error('Matrix size does not fit');
        }

        for (i = 0; i < height; ++i) {
            for (j = 0; j < width; ++j) {
                if (matrix[i][j]) {
                    // 0, false, null will be walkable
                    // while others will be un-walkable
                    nodes[i][j].walkable = false;
                }
            }
        }

        return nodes;
    }
    getNodeAt(x, y) {
        return this.nodes[y][x];
    }
    /**
     * Determine whether the node at the given position is walkable.
     * (Also returns false if the position is outside the grid.)
     * @param {number} x - The x coordinate of the node.
     * @param {number} y - The y coordinate of the node.
     * @return {boolean} - The walkability of the node.
     */
    isWalkableAt(x, y) {
        return this.isInside(x, y) && this.nodes[y][x].walkable;
    }
    /**
     * Determine whether the position is inside the grid.
     * XXX: `grid.isInside(x, y)` is wierd to read.
     * It should be `(x, y) is inside grid`, but I failed to find a better
     * name for this method.
     * @param {number} x
     * @param {number} y
     * @return {boolean}
     */
    isInside(x, y) {
        return (x >= 0 && x < this.width) && (y >= 0 && y < this.height);
    }
    /**
     * Set whether the node on the given position is walkable.
     * NOTE: throws exception if the coordinate is not inside the grid.
     * @param {number} x - The x coordinate of the node.
     * @param {number} y - The y coordinate of the node.
     * @param {boolean} walkable - Whether the position is walkable.
     */
    setWalkableAt(x, y, walkable) {
        this.nodes[y][x].walkable = walkable;
    }
    /**
     * Get the neighbors of the given node.
     *
     *     offsets      diagonalOffsets:
     *  +---+---+---+    +---+---+---+
     *  |   | 0 |   |    | 0 |   | 1 |
     *  +---+---+---+    +---+---+---+
     *  | 3 |   | 1 |    |   |   |   |
     *  +---+---+---+    +---+---+---+
     *  |   | 2 |   |    | 3 |   | 2 |
     *  +---+---+---+    +---+---+---+
     *
     *  When allowDiagonal is true, if offsets[i] is valid, then
     *  diagonalOffsets[i] and
     *  diagonalOffsets[(i + 1) % 4] is valid.
     * @param {Node} node
     * @param {DiagonalMovement} diagonalMovement
     */
    getNeighbors(node, diagonalMovement) {
        var x = node.x,
            y = node.y,
            neighbors = [],
            s0 = false, d0 = false,
            s1 = false, d1 = false,
            s2 = false, d2 = false,
            s3 = false, d3 = false,
            nodes = this.nodes;

        // ↑
        if (this.isWalkableAt(x, y - 1)) {
            neighbors.push(nodes[y - 1][x]);
            s0 = true;
        }
        // →
        if (this.isWalkableAt(x + 1, y)) {
            neighbors.push(nodes[y][x + 1]);
            s1 = true;
        }
        // ↓
        if (this.isWalkableAt(x, y + 1)) {
            neighbors.push(nodes[y + 1][x]);
            s2 = true;
        }
        // ←
        if (this.isWalkableAt(x - 1, y)) {
            neighbors.push(nodes[y][x - 1]);
            s3 = true;
        }

        if (diagonalMovement === false) {
            return neighbors;
        }
        else if (diagonalMovement === true) {
            d0 = true;
            d1 = true;
            d2 = true;
            d3 = true;
        }
        else {
            throw new Error('Incorrect value of diagonalMovement');
        }

        // ↖
        if (d0 && this.isWalkableAt(x - 1, y - 1)) {
            neighbors.push(nodes[y - 1][x - 1]);
        }
        // ↗
        if (d1 && this.isWalkableAt(x + 1, y - 1)) {
            neighbors.push(nodes[y - 1][x + 1]);
        }
        // ↘
        if (d2 && this.isWalkableAt(x + 1, y + 1)) {
            neighbors.push(nodes[y + 1][x + 1]);
        }
        // ↙
        if (d3 && this.isWalkableAt(x - 1, y + 1)) {
            neighbors.push(nodes[y + 1][x - 1]);
        }

        return neighbors;
    }
    /**
     * Get a clone of this grid.
     * @return {Grid} Cloned grid.
     */
    clone() {
        var i, j,

            width = this.width,
            height = this.height,
            thisNodes = this.nodes,

            newGrid = new Grid(width, height),
            newNodes = new Array(height);

        for (i = 0; i < height; ++i) {
            newNodes[i] = new Array(width);
            for (j = 0; j < width; ++j) {
                newNodes[i][j] = new Node(j, i, thisNodes[i][j].walkable);
            }
        }

        newGrid.nodes = newNodes;

        return newGrid;
    }
}














//module.exports = Grid;
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    
},{"./Node.js":2}],2:[function(require,module,exports){
/**
 * A node in grid.
 * This class holds some basic information about a node and custom
 * attributes may be added, depending on the algorithms' needs.
 * @constructor
 * @param {number} x - The x coordinate of the node on the grid.
 * @param {number} y - The y coordinate of the node on the grid.
 * @param {boolean} [walkable] - Whether this node is walkable.
 */
module.exports = class Node {
    constructor(x, y, walkable) {
        /**
         * The x coordinate of the node on the grid.
         * @type number
         */
        this.x = x;
        /**
         * The y coordinate of the node on the grid.
         * @type number
         */
        this.y = y;
        /**
         * Whether this node can be walked through.
         * @type boolean
         */
        this.walkable = (walkable === undefined ? true : walkable);
    }
}

//module.exports = Node;

},{}],3:[function(require,module,exports){
var Grid = require('./Grid.js');

class View {
    constructor() {
        this.canvas = document.querySelector("#myCanvas");
        this.context = canvas.getContext("2d");
        this.node = 30;
        this.windowHeight = window.innerHeight;
        this.windowWidth = window.innerWidth;
        canvas.width  = this.windowWidth;
        canvas.height = this.windowHeight;
        this.grid = new Grid(this.windowWidth, this.windowHeight);
    }
    grid_generate() {
        var x, y, i, j, col, row;
        row = this.windowHeight/this.node;
        col = this.windowWidth/this.node;

        for (i = 0; i < row; i++) {
            for (j = 0; j < col; ++j) {
                x = j * this.node;
                y = i * this.node;
                // the rectangle
                this.context.beginPath();
                this.context.rect(x, y, node, node);
                this.context.closePath();
                    
                // the fill color
                this.context.fillStyle = 'white';
                this.context.fill();

                // the outline
                this.context.lineWidth = 0.3;
                this.context.strokeStyle = 'black';
                this.context.stroke();
            }
        }

    }
    //grid_generate();
    //setDefaultStartEndPosition();
    eventListener() {
        this.canvas.addEventListener("mousedown", function(e) 
        { 
            this.getMousePosition(this.canvas, e); 
        });
    }
    getMousePosition(canvas, event) { 
        var node = this.node;
        let rect1 = canvas.getBoundingClientRect(); 
        let x = event.clientX - rect1.left; 
        let y = event.clientY - rect1.top; 
        console.log("Coordinate x: " + x/node,  
                    "Coordinate y: " + y/node);
        // context.beginPath();
        // context.rect((Math.floor(x)*node), (Math.floor(y)*node), node, node);
        var coord = this.toGridCoordinate(x, y);
        var actual_coord = this.toPageCoordinate(coord[0], coord[1]);
        if(!this.isStartOrEndPos(coord[0], coord[1])) {
            if(grid.isWalkableAt(coord[0], coord[1])) {
                this.setAttribute(actual_coord[0], actual_coord[1], 'walkable', false);
            } 
            else {
                this.setAttribute(actual_coord[0], actual_coord[1], 'walkable', true);
                //context.clearRect(actual_coord[0], actual_coord[1], node, node);
            }
        }
    } 

    setAttribute(pageX, pageY, attr, value) { 
        var color;
            switch (attr) {
            case 'walkable':
                color = value ? 'white' : 'grey';
                this.context.fillStyle = color;
                this.context.fillRect(pageX, pageY, node, node);
                if(value){
                    this.context.lineWidth = 0.25;
                    this.context.strokeStyle = "black";
                }
                else {
                    this.context.lineWidth = 0.5;
                    this.context.strokeStyle = "white";
                    var blockedNodes = this.blockedNodes;
                    if(!blockedNodes) {
                        blockedNodes = new Array();
                    }
                    else {
                        blockedNodes.push([pageX, pageY]);
                    }
                    this.blockedNodes = blockedNodes;
                }
                this.context.strokeRect(pageX, pageY, node, node);
                var coo = this.toGridCoordinate(pageX, pageY);
                grid.setWalkableAt(coo[0], coo[1], value);
                break;
            // case 'opened':
            //     this.colorizeNode(this.rects[gridY][gridX], nodeStyle.opened.fill);
            //     this.setCoordDirty(gridX, gridY, true);
            //     break;
            // case 'closed':
            //     this.colorizeNode(this.rects[gridY][gridX], nodeStyle.closed.fill);
            //     this.setCoordDirty(gridX, gridY, true);
            //     break;
            // case 'tested':
            //     color = (value === true) ? nodeStyle.tested.fill : nodeStyle.normal.fill;

            //     this.colorizeNode(this.rects[gridY][gridX], color);
            //     this.setCoordDirty(gridX, gridY, true);
            //     break;
            // case 'parent':
            //     // XXX: Maybe draw a line from this node to its parent?
            //     // This would be expensive.
            //     break;
            case 'start':
                color = value ? '#00FF00' : 'white';
                this.context.fillStyle = color;
                this.context.lineWidth = 0.3;
                this.context.strokeStyle = "black";
                this.context.fillRect(pageX, pageY, node, node);
                //context.strokeRect(pageX, pageY, node, node);
                break;
            case 'end':
                color = value ? 'red' : 'white';
                this.context.fillStyle = color;
                this.context.strokeStyle = "black";
                this.context.fillRect(pageX, pageY, node, node);
                this.context.lineWidth = 0.3;
                //context.strokeRect(pageX, pageY, node, node);
                break;
            default:
                console.error('unsupported operation: ' + attr + ':' + value);
                return;
            }
    }


    setDefaultStartEndPosition() {
        var width, height,
            centerX, centerY,
            nodeSize = this.node;

            width  = this.windowWidth;
            height = this.windowHeight;

            // marginRight = $('#algorithm_panel').width();
            // availWidth = width - marginRight;

            centerX = Math.ceil(width / 2 / nodeSize);
            centerY = Math.floor(height / 2 / nodeSize);

            this.setStartPos(centerX - 5, centerY);
            this.setEndPos(centerX + 5, centerY);
    }

    setStartPos(gridX, gridY) {
        this.startX = gridX;
        this.startY = gridY;
        var coord = this.toPageCoordinate(gridX, gridY);
        this.setAttribute(coord[0], coord[1], 'start', true);
    }
    setEndPos(gridX, gridY) {
        this.endX = gridX;
        this.endY = gridY;
        var coord = this.toPageCoordinate(gridX, gridY);
        this.setAttribute(coord[0], coord[1], 'end', true);
    }
    /**
     * Helper function to convert the page coordinate to grid coordinate
     */
    toGridCoordinate(pageX, pageY) {
        return [
            Math.floor(pageX / this.node),
            Math.floor(pageY / this.node)
        ];
    }
    /**
     * helper function to convert the grid coordinate to page coordinate
     */
    toPageCoordinate(gridX, gridY) {
        return [
            gridX * this.node,
            gridY * this.node
        ];
    }
    //drawPath([[3, 5], [4, 5], [5, 6], [5, 5], [6, 5]]);    
    drawPath(path) {
        if (!path.length) {
            return;
        }
        var size = this.node;
        //var svgPath = buildSvgPath(path);
        //this.path = this.paper.path(svgPath).attr(this.pathStyle);
        this.context.beginPath();
        this.context.strokeStyle = 'yellow';
        this.context.lineWidth = 3;
        this.context.moveTo((path[0][0] * size + size / 2), (path[0][1] * size + size / 2));
        for (i = 1; i < path.length; ++i) {
            this.context.lineTo((path[i][0] * size + size / 2), (path[i][1] * size + size / 2));
        }
        this.context.stroke();
        //context.closePath();
    }
    isStartPos(gridX, gridY) {
        return gridX === this.startX && gridY === this.startY;
    }
    isEndPos(gridX, gridY) {
        return gridX === this.endX && gridY === this.endY;
    }
    isStartOrEndPos(gridX, gridY) {
        return this.isStartPos(gridX, gridY) || this.isEndPos(gridX, gridY);
    }
    clearBlockedNodes() {
        for(var p=0;p<this.blockedNodes.length;p++) {
            this.setAttribute(this.blockedNodes[p][0], this.blockedNodes[p][1], 'walkable', true);
        }
    }
    clearPath(path) {
        for(var p=0;p<path.length;p++) {
            var page = this.toPageCoordinate(path[p][0], path[p][1]);
            this.setAttribute(page[0], page[1], 'walkable', true);
        }
    }
}

},{"./Grid.js":1}]},{},[3]);
