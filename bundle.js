(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
  var StateMachine = require('javascript-state-machine');
  var View = require('./View.js');

module.exports = class  FSM
{
  constructor()
  {
    this.SM = new StateMachine({
    init: 'none',
    transitions: [
       {
            name: 'initialize',
            from: 'none',
            to:   'ready'
        },

       {
            name: 'search',
            from: 'starting',
            to:   'searching'
        },
        {
            name: 'pause',
            from: 'searching',
            to:   'paused'
        },
        {
            name: 'finish',
            from: 'searching',
            to:   'finished'
        },
         {
            name: 'resume',
            from: 'paused',
            to:   'searching'
        },
        {
            name: 'cancel',
            from: 'paused',
            to:   'ready'
        },
        {
            name: 'modify',
            from: 'finished',
            to:   'modified'
        },
        {
            name: 'reset',
            from: '*',
            to:   'ready'
        },
        {
            name: 'clear',
            from: ['finished', 'modified'],
            to:   'ready'
        },
         {
            name: 'start',
            from: ['ready', 'modified', 'restarting'],
            to:   'starting'
        },
        {
            name: 'restart',
            from: ['searching', 'finished'],
            to:   'restarting'
        },
        {
            name: 'dragStart',
            from: ['ready', 'finished'],
            to:   'draggingStart'
        },
        {
            name: 'dragEnd',
            from: ['ready', 'finished'],
            to:   'draggingEnd'
        },
        {
            name: 'drawWall',
            from: ['ready', 'finished'],
            to:   'drawingWall'
        },
         {
            name: 'eraseWall',
            from: ['ready', 'finished'],
            to:   'erasingWall'
        },
        {
            name: 'rest',
            from: ['draggingStart', 'draggingEnd', 'drawingWall', 'erasingWall'],
            to  : 'ready'
        },

    ],
    methods: {
       onInitialize: function() { 
        //went from none to ready state
        //do the binding events thing here which tells what to do when when mouse is moved
        var canvas = document.querySelector("#myCanvas");
        var view = new View(canvas);
        view.grid_generate();
        view.setDefaultStartEndPosition();
        canvas.addEventListener("mousedown", function(e){
          view.getMousePosition(e);
        });
        // view.eventListener();
        console.log('initialized')  
       },

      onStart: function(){
        //takes to starting state, nothing special
        console.log('went to starting state');
      },
    
       onSearch:  function() { 
        //goes from starting to searching
          // get finder and search
        },

        onPause:function()
        {
            //went from searching to paused state, nnothing else
        },

        onResume:function()
        {
            //this can be called from paused state
            //goes from paused to searching

            //also something related to loop
        },

        onCancel: function()
        {
          //takes paused to ready(buttons are chnaged in ready) and clears everything
        },

        onFinish:function()
        {
          //takes searching to finished
          //called after the search is completed (here path is drawn and stats are shown) 
        },

        onModify: function()
        {
          //can be called only from finish
          //takes you to modified state
          //modifying means changing obstacles
        },
        onReset: function()
        {
          //can vbe called from any state
          //clear everything and build new grid here
          //reset means clearing walls
        },
        onClear: function()
        {
          //clear everything
          //takes you to ready state
          //clear means clearing path
        },
        onRestart: function()
        {
          //called from seraching and finished 
          //takes you to restarting state
          //clear things and call start again
        },
        








      //these functions are called automatically once you enter in this state
       onReady: function ()
      {
        console.log('came into ready state');
         //chage buttons from here
      },

       onStarting: function() {
        //clear previous things and search
        //also change button states here
       // this.search();
      },

      onPaused: function()
      {
         //chnage buttons here 
      },
      onModified:function()
      {
        //change buttons here
        //they have changed buttons wronly here, you do it right
      },
      onRestarting: function()
      {
        //does nothing
      }
    }
  });

  this.SM.initialize();

 }
}


},{"./View.js":4,"javascript-state-machine":6}],2:[function(require,module,exports){
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
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    
},{"./Node.js":3}],3:[function(require,module,exports){
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

},{}],4:[function(require,module,exports){
var Grid = require('./Grid.js');

module.exports = class View {
    constructor(canvas) {
        this.canvas = canvas;
        this.context = this.canvas.getContext("2d");
        this.node = 30;
        this.windowHeight = window.innerHeight;
        this.windowWidth = window.innerWidth;
        this.canvas.width  = this.windowWidth;
        this.canvas.height = this.windowHeight;
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
                this.context.rect(x, y, this.node, this.node);
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
        this.canvas.onmousedown = function(event) {
            var node = this.node;
            let x = event.clientX ; 
            let y = event.clientY ; 
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
        };
        //this.canvas.addEventListener("mousedown", this.getMousePosition(e));
    }
    getMousePosition(event) { 
        var node = this.node;
        let rect1 = this.canvas.getBoundingClientRect(); 
        let x = event.clientX - rect1.left; 
        let y = event.clientY - rect1.top; 
        console.log("Coordinate x: " + x/node,  
                    "Coordinate y: " + y/node);
        // context.beginPath();
        // context.rect((Math.floor(x)*node), (Math.floor(y)*node), node, node);
        var coord = this.toGridCoordinate(x, y);
        var actual_coord = this.toPageCoordinate(coord[0], coord[1]);
        if(!this.isStartOrEndPos(coord[0], coord[1])) {
            if(this.grid.isWalkableAt(coord[0], coord[1])) {
                this.setAttribute(actual_coord[0], actual_coord[1], 'walkable', false);
            } 
            else {
                this.setAttribute(actual_coord[0], actual_coord[1], 'walkable', true);
                //context.clearRect(actual_coord[0], actual_coord[1], node, node);
            }
        }
    } 

    setAttribute(pageX, pageY, attr, value) { 
        var color, node = this.node;
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
                this.grid.setWalkableAt(coo[0], coo[1], value);
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


},{"./Grid.js":2}],5:[function(require,module,exports){
var FSM = require('./FSM.js');

var dummy = new FSM();

// $(document).ready(

// //     function() {
// //     if (!Raphael.svg) {
// //         window.location = './notsupported.html';
// //     }

// //     // suppress select events
// //     $(window).bind('selectstart', function(event) {
// //         event.preventDefault();
// //     });

// //     // initialize visualization
// //     Panel.init();
// //     Controller.init();
// // }

// function()
// {
//    var dummy = new FSM();
// }

// );

},{"./FSM.js":1}],6:[function(require,module,exports){
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("StateMachine", [], factory);
	else if(typeof exports === 'object')
		exports["StateMachine"] = factory();
	else
		root["StateMachine"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 5);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function(target, sources) {
  var n, source, key;
  for(n = 1 ; n < arguments.length ; n++) {
    source = arguments[n];
    for(key in source) {
      if (source.hasOwnProperty(key))
        target[key] = source[key];
    }
  }
  return target;
}


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


//-------------------------------------------------------------------------------------------------

var mixin = __webpack_require__(0);

//-------------------------------------------------------------------------------------------------

module.exports = {

  build: function(target, config) {
    var n, max, plugin, plugins = config.plugins;
    for(n = 0, max = plugins.length ; n < max ; n++) {
      plugin = plugins[n];
      if (plugin.methods)
        mixin(target, plugin.methods);
      if (plugin.properties)
        Object.defineProperties(target, plugin.properties);
    }
  },

  hook: function(fsm, name, additional) {
    var n, max, method, plugin,
        plugins = fsm.config.plugins,
        args    = [fsm.context];

    if (additional)
      args = args.concat(additional)

    for(n = 0, max = plugins.length ; n < max ; n++) {
      plugin = plugins[n]
      method = plugins[n][name]
      if (method)
        method.apply(plugin, args);
    }
  }

}

//-------------------------------------------------------------------------------------------------


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


//-------------------------------------------------------------------------------------------------

function camelize(label) {

  if (label.length === 0)
    return label;

  var n, result, word, words = label.split(/[_-]/);

  // single word with first character already lowercase, return untouched
  if ((words.length === 1) && (words[0][0].toLowerCase() === words[0][0]))
    return label;

  result = words[0].toLowerCase();
  for(n = 1 ; n < words.length ; n++) {
    result = result + words[n].charAt(0).toUpperCase() + words[n].substring(1).toLowerCase();
  }

  return result;
}

//-------------------------------------------------------------------------------------------------

camelize.prepended = function(prepend, label) {
  label = camelize(label);
  return prepend + label[0].toUpperCase() + label.substring(1);
}

//-------------------------------------------------------------------------------------------------

module.exports = camelize;


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


//-------------------------------------------------------------------------------------------------

var mixin    = __webpack_require__(0),
    camelize = __webpack_require__(2);

//-------------------------------------------------------------------------------------------------

function Config(options, StateMachine) {

  options = options || {};

  this.options     = options; // preserving original options can be useful (e.g visualize plugin)
  this.defaults    = StateMachine.defaults;
  this.states      = [];
  this.transitions = [];
  this.map         = {};
  this.lifecycle   = this.configureLifecycle();
  this.init        = this.configureInitTransition(options.init);
  this.data        = this.configureData(options.data);
  this.methods     = this.configureMethods(options.methods);

  this.map[this.defaults.wildcard] = {};

  this.configureTransitions(options.transitions || []);

  this.plugins = this.configurePlugins(options.plugins, StateMachine.plugin);

}

//-------------------------------------------------------------------------------------------------

mixin(Config.prototype, {

  addState: function(name) {
    if (!this.map[name]) {
      this.states.push(name);
      this.addStateLifecycleNames(name);
      this.map[name] = {};
    }
  },

  addStateLifecycleNames: function(name) {
    this.lifecycle.onEnter[name] = camelize.prepended('onEnter', name);
    this.lifecycle.onLeave[name] = camelize.prepended('onLeave', name);
    this.lifecycle.on[name]      = camelize.prepended('on',      name);
  },

  addTransition: function(name) {
    if (this.transitions.indexOf(name) < 0) {
      this.transitions.push(name);
      this.addTransitionLifecycleNames(name);
    }
  },

  addTransitionLifecycleNames: function(name) {
    this.lifecycle.onBefore[name] = camelize.prepended('onBefore', name);
    this.lifecycle.onAfter[name]  = camelize.prepended('onAfter',  name);
    this.lifecycle.on[name]       = camelize.prepended('on',       name);
  },

  mapTransition: function(transition) {
    var name = transition.name,
        from = transition.from,
        to   = transition.to;
    this.addState(from);
    if (typeof to !== 'function')
      this.addState(to);
    this.addTransition(name);
    this.map[from][name] = transition;
    return transition;
  },

  configureLifecycle: function() {
    return {
      onBefore: { transition: 'onBeforeTransition' },
      onAfter:  { transition: 'onAfterTransition'  },
      onEnter:  { state:      'onEnterState'       },
      onLeave:  { state:      'onLeaveState'       },
      on:       { transition: 'onTransition'       }
    };
  },

  configureInitTransition: function(init) {
    if (typeof init === 'string') {
      return this.mapTransition(mixin({}, this.defaults.init, { to: init, active: true }));
    }
    else if (typeof init === 'object') {
      return this.mapTransition(mixin({}, this.defaults.init, init, { active: true }));
    }
    else {
      this.addState(this.defaults.init.from);
      return this.defaults.init;
    }
  },

  configureData: function(data) {
    if (typeof data === 'function')
      return data;
    else if (typeof data === 'object')
      return function() { return data; }
    else
      return function() { return {};  }
  },

  configureMethods: function(methods) {
    return methods || {};
  },

  configurePlugins: function(plugins, builtin) {
    plugins = plugins || [];
    var n, max, plugin;
    for(n = 0, max = plugins.length ; n < max ; n++) {
      plugin = plugins[n];
      if (typeof plugin === 'function')
        plugins[n] = plugin = plugin()
      if (plugin.configure)
        plugin.configure(this);
    }
    return plugins
  },

  configureTransitions: function(transitions) {
    var i, n, transition, from, to, wildcard = this.defaults.wildcard;
    for(n = 0 ; n < transitions.length ; n++) {
      transition = transitions[n];
      from  = Array.isArray(transition.from) ? transition.from : [transition.from || wildcard]
      to    = transition.to || wildcard;
      for(i = 0 ; i < from.length ; i++) {
        this.mapTransition({ name: transition.name, from: from[i], to: to });
      }
    }
  },

  transitionFor: function(state, transition) {
    var wildcard = this.defaults.wildcard;
    return this.map[state][transition] ||
           this.map[wildcard][transition];
  },

  transitionsFor: function(state) {
    var wildcard = this.defaults.wildcard;
    return Object.keys(this.map[state]).concat(Object.keys(this.map[wildcard]));
  },

  allStates: function() {
    return this.states;
  },

  allTransitions: function() {
    return this.transitions;
  }

});

//-------------------------------------------------------------------------------------------------

module.exports = Config;

//-------------------------------------------------------------------------------------------------


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {


var mixin      = __webpack_require__(0),
    Exception  = __webpack_require__(6),
    plugin     = __webpack_require__(1),
    UNOBSERVED = [ null, [] ];

//-------------------------------------------------------------------------------------------------

function JSM(context, config) {
  this.context   = context;
  this.config    = config;
  this.state     = config.init.from;
  this.observers = [context];
}

//-------------------------------------------------------------------------------------------------

mixin(JSM.prototype, {

  init: function(args) {
    mixin(this.context, this.config.data.apply(this.context, args));
    plugin.hook(this, 'init');
    if (this.config.init.active)
      return this.fire(this.config.init.name, []);
  },

  is: function(state) {
    return Array.isArray(state) ? (state.indexOf(this.state) >= 0) : (this.state === state);
  },

  isPending: function() {
    return this.pending;
  },

  can: function(transition) {
    return !this.isPending() && !!this.seek(transition);
  },

  cannot: function(transition) {
    return !this.can(transition);
  },

  allStates: function() {
    return this.config.allStates();
  },

  allTransitions: function() {
    return this.config.allTransitions();
  },

  transitions: function() {
    return this.config.transitionsFor(this.state);
  },

  seek: function(transition, args) {
    var wildcard = this.config.defaults.wildcard,
        entry    = this.config.transitionFor(this.state, transition),
        to       = entry && entry.to;
    if (typeof to === 'function')
      return to.apply(this.context, args);
    else if (to === wildcard)
      return this.state
    else
      return to
  },

  fire: function(transition, args) {
    return this.transit(transition, this.state, this.seek(transition, args), args);
  },

  transit: function(transition, from, to, args) {

    var lifecycle = this.config.lifecycle,
        changed   = this.config.options.observeUnchangedState || (from !== to);

    if (!to)
      return this.context.onInvalidTransition(transition, from, to);

    if (this.isPending())
      return this.context.onPendingTransition(transition, from, to);

    this.config.addState(to);  // might need to add this state if it's unknown (e.g. conditional transition or goto)

    this.beginTransit();

    args.unshift({             // this context will be passed to each lifecycle event observer
      transition: transition,
      from:       from,
      to:         to,
      fsm:        this.context
    });

    return this.observeEvents([
                this.observersForEvent(lifecycle.onBefore.transition),
                this.observersForEvent(lifecycle.onBefore[transition]),
      changed ? this.observersForEvent(lifecycle.onLeave.state) : UNOBSERVED,
      changed ? this.observersForEvent(lifecycle.onLeave[from]) : UNOBSERVED,
                this.observersForEvent(lifecycle.on.transition),
      changed ? [ 'doTransit', [ this ] ]                       : UNOBSERVED,
      changed ? this.observersForEvent(lifecycle.onEnter.state) : UNOBSERVED,
      changed ? this.observersForEvent(lifecycle.onEnter[to])   : UNOBSERVED,
      changed ? this.observersForEvent(lifecycle.on[to])        : UNOBSERVED,
                this.observersForEvent(lifecycle.onAfter.transition),
                this.observersForEvent(lifecycle.onAfter[transition]),
                this.observersForEvent(lifecycle.on[transition])
    ], args);
  },

  beginTransit: function()          { this.pending = true;                 },
  endTransit:   function(result)    { this.pending = false; return result; },
  failTransit:  function(result)    { this.pending = false; throw result;  },
  doTransit:    function(lifecycle) { this.state = lifecycle.to;           },

  observe: function(args) {
    if (args.length === 2) {
      var observer = {};
      observer[args[0]] = args[1];
      this.observers.push(observer);
    }
    else {
      this.observers.push(args[0]);
    }
  },

  observersForEvent: function(event) { // TODO: this could be cached
    var n = 0, max = this.observers.length, observer, result = [];
    for( ; n < max ; n++) {
      observer = this.observers[n];
      if (observer[event])
        result.push(observer);
    }
    return [ event, result, true ]
  },

  observeEvents: function(events, args, previousEvent, previousResult) {
    if (events.length === 0) {
      return this.endTransit(previousResult === undefined ? true : previousResult);
    }

    var event     = events[0][0],
        observers = events[0][1],
        pluggable = events[0][2];

    args[0].event = event;
    if (event && pluggable && event !== previousEvent)
      plugin.hook(this, 'lifecycle', args);

    if (observers.length === 0) {
      events.shift();
      return this.observeEvents(events, args, event, previousResult);
    }
    else {
      var observer = observers.shift(),
          result = observer[event].apply(observer, args);
      if (result && typeof result.then === 'function') {
        return result.then(this.observeEvents.bind(this, events, args, event))
                     .catch(this.failTransit.bind(this))
      }
      else if (result === false) {
        return this.endTransit(false);
      }
      else {
        return this.observeEvents(events, args, event, result);
      }
    }
  },

  onInvalidTransition: function(transition, from, to) {
    throw new Exception("transition is invalid in current state", transition, from, to, this.state);
  },

  onPendingTransition: function(transition, from, to) {
    throw new Exception("transition is invalid while previous transition is still in progress", transition, from, to, this.state);
  }

});

//-------------------------------------------------------------------------------------------------

module.exports = JSM;

//-------------------------------------------------------------------------------------------------


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


//-----------------------------------------------------------------------------------------------

var mixin    = __webpack_require__(0),
    camelize = __webpack_require__(2),
    plugin   = __webpack_require__(1),
    Config   = __webpack_require__(3),
    JSM      = __webpack_require__(4);

//-----------------------------------------------------------------------------------------------

var PublicMethods = {
  is:                  function(state)       { return this._fsm.is(state)                                     },
  can:                 function(transition)  { return this._fsm.can(transition)                               },
  cannot:              function(transition)  { return this._fsm.cannot(transition)                            },
  observe:             function()            { return this._fsm.observe(arguments)                            },
  transitions:         function()            { return this._fsm.transitions()                                 },
  allTransitions:      function()            { return this._fsm.allTransitions()                              },
  allStates:           function()            { return this._fsm.allStates()                                   },
  onInvalidTransition: function(t, from, to) { return this._fsm.onInvalidTransition(t, from, to)              },
  onPendingTransition: function(t, from, to) { return this._fsm.onPendingTransition(t, from, to)              },
}

var PublicProperties = {
  state: {
    configurable: false,
    enumerable:   true,
    get: function() {
      return this._fsm.state;
    },
    set: function(state) {
      throw Error('use transitions to change state')
    }
  }
}

//-----------------------------------------------------------------------------------------------

function StateMachine(options) {
  return apply(this || {}, options);
}

function factory() {
  var cstor, options;
  if (typeof arguments[0] === 'function') {
    cstor   = arguments[0];
    options = arguments[1] || {};
  }
  else {
    cstor   = function() { this._fsm.apply(this, arguments) };
    options = arguments[0] || {};
  }
  var config = new Config(options, StateMachine);
  build(cstor.prototype, config);
  cstor.prototype._fsm.config = config; // convenience access to shared config without needing an instance
  return cstor;
}

//-------------------------------------------------------------------------------------------------

function apply(instance, options) {
  var config = new Config(options, StateMachine);
  build(instance, config);
  instance._fsm();
  return instance;
}

function build(target, config) {
  if ((typeof target !== 'object') || Array.isArray(target))
    throw Error('StateMachine can only be applied to objects');
  plugin.build(target, config);
  Object.defineProperties(target, PublicProperties);
  mixin(target, PublicMethods);
  mixin(target, config.methods);
  config.allTransitions().forEach(function(transition) {
    target[camelize(transition)] = function() {
      return this._fsm.fire(transition, [].slice.call(arguments))
    }
  });
  target._fsm = function() {
    this._fsm = new JSM(this, config);
    this._fsm.init(arguments);
  }
}

//-----------------------------------------------------------------------------------------------

StateMachine.version  = '3.0.1';
StateMachine.factory  = factory;
StateMachine.apply    = apply;
StateMachine.defaults = {
  wildcard: '*',
  init: {
    name: 'init',
    from: 'none'
  }
}

//===============================================================================================

module.exports = StateMachine;


/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function(message, transition, from, to, current) {
  this.message    = message;
  this.transition = transition;
  this.from       = from;
  this.to         = to;
  this.current    = current;
}


/***/ })
/******/ ]);
});
},{}]},{},[5]);
