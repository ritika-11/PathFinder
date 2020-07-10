  var StateMachine = require('javascript-state-machine');

 var fsm = new StateMachine({
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


console.log(fsm.state);
fsm.initialize();
console.log(fsm.state);