var BinaryHeap = require('@tyriar/binary-heap');
var Heuristic  = require('../core/Heuristic');

function AStarFinder(opt) {
   opt = opt || {};
   this.allowDiagonal = opt.allowDiagonal||true;
   this.heuristic = opt.heuristic||Heuristic.manhattan;
   this.compare = opt.comparison||false;
   this.operations=0;
}

AStarFinder.prototype.findPath = function(srcX,srcY,destX,destY,grid) {
  console.log('went here to find path');
var unexploredCellsSet;
var rows = grid.nodes.length;
var columns = grid.nodes[0].length;
var path = new Array();
console.log(rows);

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
    console.log(cellDetails);

    cellDetails[srcY][srcX].f = 0.0; 
    cellDetails[srcY][srcX].g = 0.0; 
    cellDetails[srcY][srcX].h = 0.0; 
    cellDetails[srcY][srcX].parentX = srcX; 
    cellDetails[srcY][srcX].parentY = srcY; 

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
      
      exploredCells[val.value.y][val.value.x]=true;
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

     this.operations++;
     grid.getNodeAt(val.value.x,val.value.y).closed=true;  
   }
  console.log(path);

  if(this.compare==true)
  {
      return {ops:this.operations,path:path};;
  }
   else
   {
      return path;
   }  
};

AStarFinder.prototype.getCost = function(x,y,x1,y1)
{
   if(x==x1||y==y1)
   {
    return 1;
   }
   else
   {
     return 1.414;
   }
} 

AStarFinder.prototype.isValidCell = function (x,y,grid)
{
   if(x>=0&&x<grid.nodes[0].length&&y>=0&&y<grid.nodes.length)
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
   //console.log(cellDetails[row][col].parentX,cellDetails[row][col].parentY);
   while (!(cellDetails[col][row].parentX == row 
             && cellDetails[col][row].parentY == col )) 
    { 
        path.push([row,col]); 
        var temp_row = cellDetails[col][row].parentX; 
        var temp_col = cellDetails[col][row].parentY; 
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
   if(grid.nodes[y][x].walkable==1)
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
  
        if(this.isValidCell(x-1,y,grid)&&this.isUnblocked(grid,x-1,y))
        {
          neighbours.push([x-1,y]);  
            s0=true;
        }
        if(this.isValidCell(x,y-1,grid)&&this.isUnblocked(grid,x,y-1))
        {
          neighbours.push([x,y-1]);  
             s1=true;        
        }
        if(this.isValidCell(x+1,y,grid)&&this.isUnblocked(grid,x+1,y))
        { 
           neighbours.push([x+1,y]);  
             s2=true;
        }
        if(this.isValidCell(x,y+1,grid)&&this.isUnblocked(grid,x,y+1))
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

       if(this.isValidCell(x+1,y-1,grid)&&d0&&this.isUnblocked(grid,x+1,y-1))
       {
           neighbours.push([x+1,y-1]);    
       }

       if(this.isValidCell(x+1,y+1,grid)&&d1&&this.isUnblocked(grid,x+1,y+1))
       {
          neighbours.push([x+1,y+1]);        
       }
       if(this.isValidCell(x-1,y+1,grid)&&d2&&this.isUnblocked(grid,x-1,y+1))
       {
           neighbours.push([x-1,y+1]);       
       }
       if(this.isValidCell(x-1,y-1,grid)&&d3&&this.isUnblocked(grid,x-1,y-1))
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
         cellDetails[y][x].parentX = xOriginal; 
         cellDetails[y][x].parentY = yOriginal; 
         this.printPath (cellDetails,endPoints,path); 
         foundDest.value = true; 
         return; 
     }
     else if(exploredCells[y][x]==false&&this.isUnblocked(grid,x,y,endPoints)==true)
     {
      var gNew = cellDetails[yOriginal][xOriginal].g + this.getCost(x,y,xOriginal,yOriginal); 
       var hNew
      if(this.heuristic==Heuristic.manhattan)
      {
          hNew =this.manhattan(x,y,endPoints);
      }else if(this.heuristic==Heuristic.euclidean)
      {
         hNew=this.euclidean(x,y,endPoints);
      }
     
      var fNew = gNew+hNew;
        
       if (cellDetails[y][x].f == Number.MAX_VALUE ||cellDetails[y][x].f > fNew) 
                {      
                    unexploredCellsSet.insert(fNew,{x:x,y:y});  
                    grid.getNodeAt(x,y).opened=true;  
                    this.operations++;           
                    cellDetails[y][x].f = fNew; 
                    cellDetails[y][x].g = gNew; 
                    cellDetails[y][x].h = hNew; 
                    cellDetails[y][x].parentX=xOriginal;
                    cellDetails[y][x].parentY=yOriginal; 
                } 
     }

   }
}

module.exports = AStarFinder;


