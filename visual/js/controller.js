/**
 * The visualization controller will works as a state machine.
 * See files under the `doc` folder for transition descriptions.
 * See https://github.com/jakesgordon/javascript-state-machine
 * for the document of the StateMachine module.
 */
var Controller = StateMachine.create({
    initial: 'none',
    events: [
        {
            name: 'init',
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
         {
            name: 'compare',
            from: ['ready', 'finished','modified','paused'],
            to:   'ready'
        },
        {
            name: 'dummy',
            from: ['ready', 'finished','modified','paused'],
            to:   'ready'
        },
    ],
});

$.extend(Controller, {
    gridSize: [64, 36], // number of nodes horizontally and vertically
    operationsPerSecond: 300,

    /**
     * Asynchronous transition from `none` state to `ready` state.
     */
    onleavenone: function() {
        var numCols = this.gridSize[0],
            numRows = this.gridSize[1];

        this.grid = new Pf.Grid(numCols, numRows);

        View.init({
            numCols: numCols,
            numRows: numRows
        });
        View.generateGrid(function() {
            Controller.setDefaultStartEndPos();
            Controller.bindEvents();
            Controller.transition(); // transit to the next state (ready)
        });

        this.$buttons = $('.control_button');

        this.hookPathFinding();

        return StateMachine.ASYNC;
        // => ready
    },
    ondrawWall: function(event, from, to, gridX, gridY) {
        this.setWalkableAt(gridX, gridY, false);
        // => drawingWall
    },
    oneraseWall: function(event, from, to, gridX, gridY) {
        this.setWalkableAt(gridX, gridY, true);
        // => erasingWall
    },
    onsearch: function(event, from, to) {
        var grid,
            timeStart, timeEnd,
            finder = Panel.getFinder();

        timeStart = window.performance ? performance.now() : Date.now();
        grid = this.grid.clone();

        if(this.end.length<1) {
            alert("Please give atleast one end point.");
            return;
        }

        if(Panel.toggleDisabled) {
            while(this.end.length>1) {
                View.setEndPos1(this.end[1].x, this.end[1].y);
                this.end.splice(1, 1);
            }
        }
       
        this.path = finder.findPath(
            this.startX, this.startY, this.end[0].x, this.end[0].y, grid, this.end
        );
       
        this.finderType =finder.constructor.name;

        this.operationCount = this.operations.length;
        timeEnd = window.performance ? performance.now() : Date.now();
        this.timeSpent = (timeEnd - timeStart).toFixed(4);

        this.loop();
        // => searching
    },
    onrestart: function() {
        // When clearing the colorized nodes, there may be
        // nodes still animating, which is an asynchronous procedure.
        // Therefore, we have to defer the `abort` routine to make sure
        // that all the animations are done by the time we clear the colors.
        // The same reason applies for the `onreset` event handler.
        setTimeout(function() {
            Controller.clearOperations();
            Controller.clearFootprints();
            Controller.start();
        }, View.nodeColorizeEffect.duration * 1.2);
        // => restarting
    },
    onpause: function(event, from, to) {
        // => paused
    },
    onresume: function(event, from, to) {
        this.loop();
        // => searching
    },
    oncancel: function(event, from, to) {
        this.clearOperations();
        this.clearFootprints();
        // => ready
    },
    onfinish: function(event, from, to) {
        View.showStats({
            pathLength: Pf.Util.pathLength(this.path),
            timeSpent:  this.timeSpent,
            operationCount: this.operationCount,
        });
     
         View.drawPath(this.path,this.finderType);
         
        // => finished
    },
    onclear: function(event, from, to) {
        this.clearOperations();
        this.clearFootprints();
        // => ready
    },
    onmodify: function(event, from, to) {
        // => modified
    },
    onreset: function(event, from, to) {
        setTimeout(function() {
            Controller.clearOperations();
            Controller.clearAll();
            Controller.buildNewGrid();
        }, View.nodeColorizeEffect.duration * 1.2);
        // => ready
    },
    oncompare:function()
    {
        if(this.end.length<1) {
            alert("Please give atleast one end point.");
            return;
        }
        while(this.end.length>1) {
            View.setEndPos1(this.end[1].x, this.end[1].y);
            this.end.splice(1, 1);
        }

        var gridCopyAStar = this.grid.clone();
        var gridCopyBestFirst = this.grid.clone();
        var gridCopyBreadthFirst = this.grid.clone();
        var gridCopyDijkstra = this.grid.clone();
        var gridCopyThetaStar = this.grid.clone();

        var finderAStar = new Pf.AStarFinder({comparison:true});
        var finderBestFirst = new Pf.BestFirstFinder({comparison:true});
        var finderBreadthFirst = new Pf.BreadthFirstFinder({comparison:true});
        var finderDijkstra = new Pf.DijkstraFinder({comparison:true});
        var finderThetaStar = new Pf.ThetaStarFinder({comparison:true});

        var operationsAStar = finderAStar.findPath(this.startX,this.startY,this.end[0].x,this.end[0].y,gridCopyAStar);
        var operationsBestFirst = finderBestFirst.findPath(this.startX,this.startY,this.endX,this.endY,gridCopyBestFirst,this.end);
        var operationsBreadthFirst = finderBreadthFirst.findPath(this.startX,this.startY,this.endX,this.endY,gridCopyBreadthFirst,this.end);
        var operationsDijkstra = finderDijkstra.findPath(this.startX,this.startY,this.endX,this.endY,gridCopyDijkstra,this.end);
        var operationsThetaStar = finderThetaStar.findPath(this.startX,this.startY,this.end[0].x,this.end[0].y,gridCopyThetaStar);

        Controller.clearOperations();
        Controller.clearFootprints();

        this.displayGraph(operationsAStar,operationsBestFirst,operationsBreadthFirst,operationsDijkstra,operationsThetaStar);
        // => ready
    },

    /**
     * The following functions are called on entering states.
     */

    onready: function() {
        console.log('=> ready');
        this.setButtonStates({
            id: 1,
            text: 'Start Search',
            enabled: true,
            callback: $.proxy(this.start, this),
        }, {
            id: 2,
            text: 'Pause Search',
            enabled: false,
        }, {
            id: 3,
            text: 'Clear Walls',
            enabled: true,
            callback: $.proxy(this.reset, this),
        },{
            id: 4,
            text: 'Compare Algorithms',
            enabled: true,
            callback: $.proxy(this.compare, this),
        });
        // => [starting, draggingStart, draggingEnd, drawingStart, drawingEnd]
    },
    onstarting: function(event, from, to) {
        console.log('=> starting');
        // Clears any existing search progress
        this.clearFootprints();
        this.setButtonStates({
            id: 2,
            enabled: true,
        });
        this.search();
        // => searching
    },
    onsearching: function() {
        console.log('=> searching');
        this.setButtonStates({
            id: 1,
            text: 'Restart Search',
            enabled: true,
            callback: $.proxy(this.restart, this),
        }, {
            id: 2,
            text: 'Pause Search',
            enabled: true,
            callback: $.proxy(this.pause, this),
        });
        // => [paused, finished]
    },
    onpaused: function() {
        console.log('=> paused');
        this.setButtonStates({
            id: 1,
            text: 'Resume Search',
            enabled: true,
            callback: $.proxy(this.resume, this),
        }, {
            id: 2,
            text: 'Cancel Search',
            enabled: true,
            callback: $.proxy(this.cancel, this),
        },
         {
            id: 4,
            text: 'Compare Algorithms',
            enabled: true,
            callback: $.proxy(this.compare, this),
        });
        // => [searching, ready]
    },
    onfinished: function() {
        console.log('=> finished');
        this.setButtonStates({
            id: 1,
            text: 'Restart Search',
            enabled: true,
            callback: $.proxy(this.restart, this),
        }, {
            id: 2,
            text: 'Clear Path',
            enabled: true,
            callback: $.proxy(this.clear, this),
        },
         {
            id: 4,
            text: 'Compare Algorithms',
            enabled: true,
            callback: $.proxy(this.compare, this),
        });
    },
    onmodified: function() {
        console.log('=> modified');
        this.setButtonStates({
            id: 1,
            text: 'Start Search',
            enabled: true,
            callback: $.proxy(this.start, this),
        }, {
            id: 2,
            text: 'Clear Path',
            enabled: true,
            callback: $.proxy(this.clear, this),
        },
         {
            id: 4,
            text: 'Compare Algorithms',
            enabled: true,
            callback: $.proxy(this.compare, this),
        });
    },

    /**
     * Define setters and getters of PF.Node, then we can get the operations
     * of the pathfinding.
     */
    hookPathFinding: function() {

        Pf.Node.prototype = {
            get opened() {
                return this._opened;
            },
            set opened(v) {
                this._opened = v;
                Controller.operations.push({
                    x: this.x,
                    y: this.y,
                    attr: 'opened',
                    value: v
                });
            },
            get closed() {
                return this._closed;
            },
            set closed(v) {
                this._closed = v;
                Controller.operations.push({
                    x: this.x,
                    y: this.y,
                    attr: 'closed',
                    value: v
                });
            },
            get tested() {
                return this._tested;
            },
            set tested(v) {
                this._tested = v;
                Controller.operations.push({
                    x: this.x,
                    y: this.y,
                    attr: 'tested',
                    value: v
                });
            },
        };

        this.operations = [];
    },
    bindEvents: function() {
        $('#draw_area').mousedown($.proxy(this.mousedown, this));
        $(window)
            .mousemove($.proxy(this.mousemove, this))
            .mouseup($.proxy(this.mouseup, this));
    },
    loop: function() {
        var interval = 1000 / this.operationsPerSecond;
        (function loop() {
            if (!Controller.is('searching')) {
                return;
            }
            Controller.step();
            setTimeout(loop, interval);
        })();
    },
    step: function() {
        var operations = this.operations,
            op, isSupported;

        do {
            if (!operations.length) {
                this.finish(); // transit to `finished` state
                return;
            }
            op = operations.shift();
            isSupported = View.supportedOperations.indexOf(op.attr) !== -1;
        } while (!isSupported);

        View.setAttributeAt(op.x, op.y, op.attr, op.value);
    },
    clearOperations: function() {
        this.operations = [];
    },
    clearFootprints: function() {
        View.clearFootprints();
        View.clearPath();
    },
    clearAll: function() {
        this.clearFootprints();
        View.clearBlockedNodes();
    },
    buildNewGrid: function() {
        this.grid = new Pf.Grid(this.gridSize[0], this.gridSize[1]);
    },
    mousedown: function (event) {
        var coord = View.toGridCoordinate(event.pageX, event.pageY),
            gridX = coord[0],
            gridY = coord[1],
            grid  = this.grid;

        if (this.can('dragStart') && this.isStartPos(gridX, gridY)) {
            this.dragStart();
            return;
        }
        var togVal = Panel.getToggleValue();
        if(togVal) {
            if(this.isEnd(gridX, gridY)>-1) {
                View.setEndPos1(gridX, gridY);
                this.end.splice(this.isEnd(gridX, gridY), 1);
            }
            else if(grid.isWalkableAt(gridX, gridY) && !this.isStartPos(gridX, gridY)) {
                View.setEndPos1(gridX, gridY);
                this.end.push({x:gridX, y:gridY});
            } 
            return;
        }

        if (this.can('drawWall') && grid.isWalkableAt(gridX, gridY) && this.isEnd(gridX, gridY)===-1) {
            this.drawWall(gridX, gridY);
            return;
        }
        if (this.can('eraseWall') && !grid.isWalkableAt(gridX, gridY)) {
            this.eraseWall(gridX, gridY);
        }
    },
    mousemove: function(event) {
        var coord = View.toGridCoordinate(event.pageX, event.pageY),
            grid = this.grid,
            gridX = coord[0],
            gridY = coord[1];

        if (this.isStartOrEndPos(gridX, gridY) || this.isEnd(gridX, gridY)>-1) {
            return;
        }

        switch (this.current) {
        case 'draggingStart':
            if (grid.isWalkableAt(gridX, gridY)) {
                this.setStartPos(gridX, gridY);
            }
            break;
        case 'draggingEnd':
            if (grid.isWalkableAt(gridX, gridY)) {
                this.setEndPos(gridX, gridY);
            }
            break;
        case 'drawingWall':
            this.setWalkableAt(gridX, gridY, false);
            break;
        case 'erasingWall':
            this.setWalkableAt(gridX, gridY, true);
            break;
        }
    },
    mouseup: function(event) {
        if (Controller.can('rest')) {
            Controller.rest();
        }
    },
    setButtonStates: function() {
        $.each(arguments, function(i, opt) {
            var $button = Controller.$buttons.eq(opt.id - 1);
            if (opt.text) {
                $button.text(opt.text);
            }
            if (opt.callback) {
                $button
                    .unbind('click')
                    .click(opt.callback);
            }
            if (opt.enabled === undefined) {
                return;
            } else if (opt.enabled) {
                $button.removeAttr('disabled');
            } else {
                $button.attr({ disabled: 'disabled' });
            }
        });
    },
    /**
     * When initializing, this method will be called to set the positions
     * of start node and end node.
     * It will detect user's display size, and compute the best positions.
     */
    setDefaultStartEndPos: function() {
        var width, height,
            marginRight, availWidth,
            centerX, centerY,
            nodeSize = View.nodeSize;

        width = Math.min($(window).width(), this.gridSize[0]*nodeSize);
        height = Math.min($(window).height(), this.gridSize[1]*nodeSize);

        marginRight = $('#algorithm_panel').width();
        availWidth = width - marginRight;

        centerX = Math.ceil(availWidth / 2 / nodeSize);
        centerY = Math.floor(height / 2 / nodeSize);

        this.setStartPos(centerX - 5, centerY - 3);
        this.setEndPos(centerX + 5, centerY - 3);
        if(!this.end) {
            this.end = [];
        }
        this.end.push({x:centerX + 5, y:centerY - 3});
    },
    setStartPos: function(gridX, gridY) {
        this.startX = gridX;
        this.startY = gridY;
        View.setStartPos(gridX, gridY);
    },
    setEndPos: function(gridX, gridY) {
        this.endX = gridX;
        this.endY = gridY;
        View.setEndPos1(gridX, gridY);
    },
    setWalkableAt: function(gridX, gridY, walkable) {
        this.grid.setWalkableAt(gridX, gridY, walkable);
        View.setAttributeAt(gridX, gridY, 'walkable', walkable);
    },
    isStartPos: function(gridX, gridY) {
        return gridX === this.startX && gridY === this.startY;
    },
    isEndPos: function(gridX, gridY) {
        return gridX === this.endX && gridY === this.endY;
    },
    isEnd: function(gridX, gridY) {
        for(var q=0;q<this.end.length;q++) {
            if((this.end[q].x === gridX) && (this.end[q].y === gridY)) {
                return q;
            }
        }
        return -1;
    },
    isStartOrEndPos: function(gridX, gridY) {
        return this.isStartPos(gridX, gridY) || this.isEndPos(gridX, gridY);
    },
    displayGraph: function(a,b,c,d,e) {
        var chart1 = new CanvasJS.Chart("chartContainer1", {
            animationEnabled: true,
            theme: "light2",
            width:700,
            title:{
                text: "Algorithm Comparison"
            },
            axisY:{
                includeZero: true,
                title:'No of Operations'
            },
            axisX:{
                title:'Algorithm'
            },
            data: [{        
                type: "column",
                indexLabelFontSize: 16,
                dataPoints: [
                    { y: a.ops, label:'AStarFinder'},
                    { y: b.ops, label:'Best First Search' },
                    { y: c.ops, label:'Breadth First Search' },
                    { y: d.ops, label:'Dijkstra' },
                    { y: e.ops, label:'Theta*' },
                ]
            }]
        });

        var lengthAStar = Pf.Util.pathLength(a.path);
        var lengthBestFirstSearch = Pf.Util.pathLength(b.path);
        var lengthBreadthSearch = Pf.Util.pathLength(c.path);
        var lengthDijkstra = Pf.Util.pathLength(d.path);
        var lengthThetaStar = Pf.Util.pathLength(e.path);

        var chart2 = new CanvasJS.Chart("chartContainer2", {
            animationEnabled: true,
            theme: "light2",
            width:700,
            title:{
                text: "Algorithm Comparison"
            },
            axisY:{
                includeZero: true,
                title:'PathLength'
            },
            axisX:{
                title:'Algorithm'
            },
            data: [{        
                type: "column",
                indexLabelFontSize: 16,
                dataPoints: [
                    { y: lengthAStar, label:'AStarFinder'},
                    { y: lengthBestFirstSearch, label:'Best First Search'},
                    { y: lengthBreadthSearch, label:'Breadth First Search' },
                    { y: lengthDijkstra, label:'Dijkstra' },
                    { y: lengthThetaStar, label:'Theta*' },
                ]
            }]
        });

        chart1.render();
        chart2.render();
        document.getElementById('graph').style.display='block';
    }

});
