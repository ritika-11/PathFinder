var BinaryHeap = require('@tyriar/binary-heap');
var Heuristic  = require('../core/Heuristic');

function AStarFinder(opt) {
   opt = opt || {};
   this.allowDiagonal = opt.allowDiagonal||true;
   this.heuristic = opt.heuristic||Heuristic.manhattan;
}

AStarFinder.prototype.findPath = function(srcX,srcY,destX,destY,grid) {
var unexploredCellsSet;
var rows = grid.nodes.length;
var columns = grid.nodes[0].length;
var path = new Array();
var endPoints = {
   srcX:srcX,
   srcY:srcY,
   destX:destX,
   destY:destY,
};


  if(srcX==destX&&srcY==destY)
    return "already present at destination";
  var exploredCells = [];
  for(var i=0;i<rows;i++)
  {
    var tempArray=new Array();
    for(var j=0;j<columns;j++)
    {
       tempArray.push(false); 
    }
    exploredCells.push(tempArray);
  }

  var cellDetails =[];
  for(var i=0;i<rows;i++)
  {
       var tempArray = new Array();
       for(var j=0;j<columns;j++)
       {
          var cell = {
            parentX : -1,
            parentY :-1,
            f : Number.MAX_VALUE,
            g : Number.MAX_VALUE,
            h : Number.MAX_VALUE
          };
         tempArray.push(cell);
       }
       cellDetails.push(tempArray);
  } 

    cellDetails[srcX][srcY].f = 0.0; 
    cellDetails[srcX][srcY].g = 0.0; 
    cellDetails[srcX][srcY].h = 0.0; 
    cellDetails[srcX][srcY].parentX = srcX; 
    cellDetails[srcX][srcY].parentY = srcY; 

    unexploredCellsSet = new BinaryHeap();

    unexploredCellsSet.insert(0,{x:srcX,y:srcY});
   var foundDest = {
    value:false
   };
    var temp = {
    value:false
   };


   while(!unexploredCellsSet.isEmpty())
   {
      var val = unexploredCellsSet.extractMinimum();
      
      exploredCells[val.value.x][val.value.y]=true;
      
      var x = val.value.x;
      var y = val.value.y;
      var neighbours = this.getNeighbours(x,y,grid,this.allowDiagonal);
     
      for(var i=0;i<neighbours.length;i++)
      {
          if(foundDest.value==true)
          {
            temp.value=true;
            break;
          }
          this.checkneighbour(neighbours[i][0],neighbours[i][1],cellDetails,foundDest,exploredCells,grid,x,y,endPoints,unexploredCellsSet,path);        
      }
      if(temp.value==true)
        break;

   //   grid.getNodeAt(val.value.x,val.value.y).closed=true;  
   }
  console.log(path);
   return path;

};


AStarFinder.prototype.isValidCell = function (x,y,grid)
{
   if(x>=0&&x<grid.nodes.length&&y>=0&&y<grid.nodes[0].length)
    return true;
   else
    return false;
}

AStarFinder.prototype.isDestination = function isDestination (x,y,endPoints)
{
  if(x==endPoints.destX&&y==endPoints.destY)
    return true;
  else
    return false;
}

 AStarFinder.prototype.printPath = function (cellDetails,endPoints,path)
{
  var row = endPoints.destX;
  var col = endPoints.destY;
  console.log(cellDetails);
   //console.log(cellDetails[row][col].parentX,cellDetails[row][col].parentY);
    console.log('yghg');
   while (!(cellDetails[row][col].parentX == row 
             && cellDetails[row][col].parentY == col )) 
    { 
        //Path.push (make_pair (row, col));
        console.log(row,col);
        path.push([row,col]); 
        var temp_row = cellDetails[row][col].parentX; 
        var temp_col = cellDetails[row][col].parentY; 
        row = temp_row; 
        col = temp_col; 
    } 
     path.push([row,col]); 
     path.push([endPoints.srcX,endPoints.srcY]); 
     //console.log(endPoints.srcX,endPoints.srcY);
}

AStarFinder.prototype.euclidean =function  (x,y,endPoints)
{
  return Math.pow((x-endPoints.destX)*(x-endPoints.destX)+(y-endPoints.destY)*(y-endPoints.destY),0.5);
}

AStarFinder.prototype.manhattan = function  (x,y,endPoints)
{
  var a = Math.abs(x-endPoints.destX);
  var b = Math.abs(y-endPoints.destY);
  return a+b;
}

AStarFinder.prototype.diagonal = function (x,y,endPoints)
{
  var a = Math.abs(x-endPoints.destX);
  var b = Math.abs(y-endPoints.destY);
  if(a>=b)
    return a;
  else
    return b;
}

 AStarFinder.prototype.isUnblocked = function(grid,x,y)
{
   if(grid.nodes[y][x].walkable===true)
    return true;
   else
    return false;
}

AStarFinder.prototype.getNeighbours = function(x,y,grid,allowDiagonal)
{
       var neighbours = new Array();
        s0 = false, d0 = false,
        s1 = false, d1 = false,
        s2 = false, d2 = false,
        s3 = false, d3 = false;
  
        if(this.isUnblocked(grid,x-1,y))
        {
           neighbours.push([x-1,y]);  
           s0=true;
        }
        if(this.isUnblocked(grid,x,y-1))
        {
           neighbours.push([x,y-1]);  
           s1=true;
        }
        if(this.isUnblocked(grid,x+1,y))
        {
           neighbours.push([x+1,y]);  
           s2=true;
        }
        if(this.isUnblocked(grid,x,y+1))
        {
           neighbours.push([x,y+1]); 
           s3=true; 
        }
       
       if(!allowDiagonal)
       {
        return neighbours;
       }

       d0=s1||s2;
       d1=s2||s3;
       d2=s3||s0;
       d3=s0||s1;

       if(d0&&this.isUnblocked(grid,x+1,y-1))
       {
        neighbours.push([x+1,y-1]);
       }
       if(d1&&this.isUnblocked(grid,x+1,y+1))
       {
        neighbours.push([x+1,y+1]);
       }
       if(d2&&this.isUnblocked(grid,x-1,y+1))
       {
        neighbours.push([x-1,y+1]);
       }
       if(d3&&this.isUnblocked(grid,x-1,y-1))
       {
        neighbours.push([x-1,y-1]);
       }

return neighbours;

}

AStarFinder.prototype.checkneighbour = function (x,y,cellDetails,foundDest,exploredCells,grid,xOriginal,yOriginal,endPoints,unexploredCellsSet,path)
{
   if(foundDest.value==true)
   {
    return;
   }
    
   if(this.isValidCell(x,y,grid))
   {
     if(this.isDestination(x,y,endPoints)==true)
     {
         cellDetails[x][y].parentX = xOriginal; 
         cellDetails[x][y].parentY = yOriginal; 
         this.printPath (cellDetails,endPoints,path); 
         foundDest.value = true; 
         return; 
     }
     else if(exploredCells[x][y]==false&&this.isUnblocked(grid,x,y,endPoints)==true)
     {
      var gNew = cellDetails[xOriginal][yOriginal].g + 1.0; 
       var hNew
      if(this.heuristic==Heuristic.manhattan)
      {
          hNew =this.manhattan(x,y,endPoints);
      }else if(this.heuristic==Heuristic.euclidean)
      {
         hNew=this.euclidean(x,y,endPoints);
      }
     
      var fNew = gNew+hNew;

        
       if (cellDetails[x][y].f == Number.MAX_VALUE ||cellDetails[x][y].f > fNew) 
                {      
                    unexploredCellsSet.insert(fNew,{x:x,y:y});  
                 //   grid.getNodeAt(x,y).opened=true;             
                    cellDetails[x][y].f = fNew; 
                    cellDetails[x][y].g = gNew; 
                    cellDetails[x][y].h = hNew; 
                    cellDetails[x][y].parentX=xOriginal;
                    cellDetails[x][y].parentY=yOriginal; 
                } 
     }

   }
}

module.exports = AStarFinder;


