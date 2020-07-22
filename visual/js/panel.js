/**
 * The control panel.
 */
var Panel = {
    init: function() {
        var $algo = $('#algorithm_panel');

        $('.panel').draggable();
        $('.accordion').accordion({
            collapsible: false,
        });
        $('.option_label').click(function() {
            $(this).prev().click();
        });
        $('#hide_instructions').click(function() {
            $('#instructions_panel').slideUp();
        });
        $('#play_panel').css({
            top: $algo.offset().top + $algo.outerHeight() + 20
        });
        $('#button2').attr('disabled', 'disabled');
    },
    getToggleValue: function() {
        var toggleValue = typeof $('.togbtn:checked').val() !== 'undefined';
        console.log(toggleValue);
        return toggleValue;
        //typeof $('#switch:checked').val() !== 'undefined' ;
    },
    /**
     * Get the user selected path-finder.
     * TODO: clean up this messy code.
     */
    getFinder: function() {
        var finder, selected_header, heuristic, allowDiagonal, biDirectional, dontCrossCorners, weight, trackRecursion, timeLimit,visualize_recursion;
        
        selected_header = $(
            '#algorithm_panel ' +
            '.ui-accordion-header[aria-selected=true]'
        ).attr('id');
        
        switch (selected_header) {

        case 'astar_header':
            this.toggleDisabled = true;
            console.log(this.toggleDisabled);
            allowDiagonal = typeof $('#astar_section ' +
                                     '.allow_diagonal:checked').val() !== 'undefined';
                                     console.log(allowDiagonal);
            // biDirectional = typeof $('#astar_section ' +
            //                          '.bi-directional:checked').val() !=='undefined';
            // dontCrossCorners = typeof $('#astar_section ' +
            //                          '.dont_cross_corners:checked').val() !=='undefined';

            // /* parseInt returns NaN (which is falsy) if the string can't be parsed */
            // weight = parseInt($('#astar_section .spinner').val()) || 1;
            // weight = weight >= 1 ? weight : 1; /* if negative or 0, use 1 */

            heuristic = $('input[name=astar_heuristic]:checked').val();
            console.log('heuristic is');
            console.log(heuristic);
            // if (biDirectional)
            //     finder = new PF.BiAStarFinder({
            //         allowDiagonal: allowDiagonal,
            //         dontCrossCorners: dontCrossCorners,
            //         heuristic: PF.Heuristic[heuristic],
            //         weight: weight
            //     });
            // } else {
                finder = new Pf.AStarFinder({
                    allowDiagonal: allowDiagonal,
                    heuristic: Pf.Heuristic[heuristic],
                    multiplePaths:false,
                });
            //}
            break;

        case 'breadthfirst_header':
            this.toggleDisabled = false;
            allowDiagonal = typeof $('#breadthfirst_section ' +
                                     '.allow_diagonal:checked').val() !== 'undefined';
            // biDirectional = typeof $('#breadthfirst_section ' +
            //                          '.bi-directional:checked').val() !== 'undefined';
            // dontCrossCorners = typeof $('#breadthfirst_section ' +
            //                          '.dont_cross_corners:checked').val() !=='undefined';
            // if (biDirectional) {
            //     finder = new PF.BiBreadthFirstFinder({
            //         allowDiagonal: allowDiagonal,
            //         dontCrossCorners: dontCrossCorners
            //     });
            // } else {
                finder = new Pf.BreadthFirstFinder({
                    allowDiagonal: allowDiagonal,
                    dontCrossCorners: dontCrossCorners,
                    multiplePaths:false,
                });
            //}
            break;

        case 'bestfirst_header':
            this.toggleDisabled = false;
            allowDiagonal = typeof $('#bestfirst_section ' +
                                     '.allow_diagonal:checked').val() !== 'undefined';
            // biDirectional = typeof $('#bestfirst_section ' +
            //                          '.bi-directional:checked').val() !== 'undefined';
            // dontCrossCorners = typeof $('#bestfirst_section ' +
            //                          '.dont_cross_corners:checked').val() !=='undefined';
            // heuristic = $('input[name=bestfirst_heuristic]:checked').val();
            // if (biDirectional) {
            //     finder = new PF.BiBestFirstFinder({
            //         allowDiagonal: allowDiagonal,
            //         dontCrossCorners: dontCrossCorners,
            //         heuristic: PF.Heuristic[heuristic]
            //     });
            // } else {
                finder = new Pf.BestFirstFinder({
                    allowDiagonal: allowDiagonal,
                    dontCrossCorners: dontCrossCorners,
                    heuristic: Pf.Heuristic[heuristic],
                    multiplePaths:false,
                });
            //}
            break;

        case 'dijkstra_header':
            this.toggleDisabled = false;
            allowDiagonal = typeof $('#dijkstra_section ' +
                                     '.allow_diagonal:checked').val() !== 'undefined';
                                     console.log(allowDiagonal);
            // biDirectional = typeof $('#dijkstra_section ' +
            //                          '.bi-directional:checked').val() !=='undefined';
            // dontCrossCorners = typeof $('#dijkstra_section ' +
            //                          '.dont_cross_corners:checked').val() !=='undefined';
            // if (biDirectional) {
            //     finder = new PF.BiDijkstraFinder({
            //         allowDiagonal: allowDiagonal,
            //         dontCrossCorners: dontCrossCorners
            //     });
            // } else {
                finder = new Pf.DijkstraFinder({
                    allowDiagonal: allowDiagonal,
                    dontCrossCorners: dontCrossCorners,
                    multiplePaths:false,
                });
            //}
            break;

        case 'thetastar_header':
            this.toggleDisabled = true;
            console.log(this.toggleDisabled);
            allowDiagonal = typeof $('#thetastar_section ' +
                                     '.allow_diagonal:checked').val() !== 'undefined';
                                     console.log(allowDiagonal);
            // biDirectional = typeof $('#astar_section ' +
            //                          '.bi-directional:checked').val() !=='undefined';
            // dontCrossCorners = typeof $('#astar_section ' +
            //                          '.dont_cross_corners:checked').val() !=='undefined';

            // /* parseInt returns NaN (which is falsy) if the string can't be parsed */
            // weight = parseInt($('#astar_section .spinner').val()) || 1;
            // weight = weight >= 1 ? weight : 1; /* if negative or 0, use 1 */

            heuristic = $('input[name=thetastar_heuristic]:checked').val();
            // if (biDirectional) {
            //     finder = new PF.BiAStarFinder({
            //         allowDiagonal: allowDiagonal,
            //         dontCrossCorners: dontCrossCorners,
            //         heuristic: PF.Heuristic[heuristic],
            //         weight: weight
            //     });
            // } else {
                finder = new Pf.ThetaStarFinder({
                    allowDiagonal: allowDiagonal,
                    heuristic: Pf.Heuristic[heuristic],
                });
            //}
            break;

        // case 'jump_point_header':
        //     trackRecursion = typeof $('#jump_point_section ' +
        //                              '.track_recursion:checked').val() !== 'undefined';
        //     heuristic = $('input[name=jump_point_heuristic]:checked').val();
            
        //     finder = new PF.JumpPointFinder({
        //       trackJumpRecursion: trackRecursion,
        //       heuristic: PF.Heuristic[heuristic],
        //       diagonalMovement: PF.DiagonalMovement.IfAtMostOneObstacle
        //     });
        //     break;
        // case 'orth_jump_point_header':
        //     trackRecursion = typeof $('#orth_jump_point_section ' +
        //                              '.track_recursion:checked').val() !== 'undefined';
        //     heuristic = $('input[name=orth_jump_point_heuristic]:checked').val();

        //     finder = new PF.JumpPointFinder({
        //       trackJumpRecursion: trackRecursion,
        //       heuristic: PF.Heuristic[heuristic],
        //       diagonalMovement: PF.DiagonalMovement.Never
        //     });
             break;
        case 'ida_header':
            this.toggleDisabled = true;
            allowDiagonal = typeof $('#ida_section ' +
                                     '.allow_diagonal:checked').val() !== 'undefined';
            visualize_recursion = typeof $('#ida_section ' +
                                     '.visualize_recursion:checked').val() !== 'undefined';

            // dontCrossCorners = typeof $('#ida_section ' +
            //                          '.dont_cross_corners:checked').val() !=='undefined';
            // trackRecursion = typeof $('#ida_section ' +
            //                          '.track_recursion:checked').val() !== 'undefined';

            // heuristic = $('input[name=jump_point_heuristic]:checked').val();

            // weight = parseInt($('#ida_section input[name=astar_weight]').val()) || 1;
            // weight = weight >= 1 ? weight : 1; /* if negative or 0, use 1 */

            // timeLimit = parseInt($('#ida_section input[name=time_limit]').val());

            // // Any non-negative integer, indicates "forever".
            // timeLimit = (timeLimit <= 0 || isNaN(timeLimit)) ? -1 : timeLimit;

            finder = new Pf.IDAStarFinder({
              allowDiagonal: allowDiagonal,
              heuristic: Pf.Heuristic[heuristic],
              visualize_recursion:visualize_recursion,
            });

            break;

        case 'k_paths_header':
           this.toggleDisabled = true;
           allowDiagonal = typeof $('#k_paths_section ' +
                                     '.allow_diagonal:checked').val() !== 'undefined';
           visualize_recursion = typeof $('#k_paths_section ' +
                                     '.visualize_recursion:checked').val() !== 'undefined';

           var paths = $('input[name=NumberOfPaths]:checked').val();

             console.log(allowDiagonal);
             console.log(visualize_recursion);
             console.log(paths);

             finder = new Pf.KShortestPathFinder({
                allowDiagonal:allowDiagonal,
                multiplePaths:true,
                K:paths,
                visualize_recursion:visualize_recursion
            });
            break;

        }

        return finder;
    }
};
