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

