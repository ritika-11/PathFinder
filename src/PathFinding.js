module.exports = {
    'BinaryHeap'                : require('@tyriar/binary-heap'),
    'Node'                      : require('./core/Node'),
    'Grid'                      : require('./core/Grid'),
    'Util'                      : require('./core/Util'),
    'Heuristic'                 : require('./core/Heuristic'),
    'AStarFinder'               : require('./finders/AStarFinder'),
    'BestFirstFinder'           : require('./finders/BestFirstFinder'),
    'BreadthFirstFinder'        : require('./finders/BreadthFirstFinder'),
    'DijkstraFinder'            : require('./finders/DijkstraFinder'),
    'IDAStarFinder'             : require('./finders/IDAStarFinder'),
    'ThetaStarFinder'           : require('./finders/ThetaStarFinder'),
    'KShortestPathFinder'       : require('./finders/KShortestPathFinder'),
};
