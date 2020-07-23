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
            top: $algo.offset().top + $algo.outerHeight() + 50
        });
        $('#button2').attr('disabled', 'disabled');
    },

    getToggleValue: function() {
        var toggleValue = $('input[name=wall_destination]:checked').val();
        if(toggleValue === 'destination') {
            return true;
        }
        else {
            return false;
        }
    },
    /**
     * Get the user selected path-finder.
     * TODO: clean up this messy code.
     */
    getFinder: function() {
        var finder, selected_header, heuristic, allowDiagonal, visualize_recursion;
        
        selected_header = $(
            '#algorithm_panel ' +
            '.ui-accordion-header[aria-selected=true]'
        ).attr('id');
        
        switch (selected_header) {

        case 'astar_header':
            this.toggleDisabled = true;
            allowDiagonal = typeof $('#astar_section ' +
                                     '.allow_diagonal:checked').val() !== 'undefined';

            heuristic = $('input[name=astar_heuristic]:checked').val();
            finder = new Pf.AStarFinder({
                allowDiagonal: allowDiagonal,
                heuristic: Pf.Heuristic[heuristic],
                multiplePaths:false,
            });
            break;

        case 'breadthfirst_header':
            this.toggleDisabled = false;
            allowDiagonal = typeof $('#breadthfirst_section ' +
                                     '.allow_diagonal:checked').val() !== 'undefined';
            finder = new Pf.BreadthFirstFinder({
                allowDiagonal: allowDiagonal,
                multiplePaths:false,
            });
            break;

        case 'bestfirst_header':
            this.toggleDisabled = false;
            allowDiagonal = typeof $('#bestfirst_section ' +
                                     '.allow_diagonal:checked').val() !== 'undefined';
            heuristic = $('input[name=bestfirst_heuristic]:checked').val();
            finder = new Pf.BestFirstFinder({
                allowDiagonal: allowDiagonal,
                heuristic: Pf.Heuristic[heuristic],
                multiplePaths:false,
            });
            break;

        case 'dijkstra_header':
            this.toggleDisabled = false;
            allowDiagonal = typeof $('#dijkstra_section ' +
                                     '.allow_diagonal:checked').val() !== 'undefined';
            finder = new Pf.DijkstraFinder({
                allowDiagonal: allowDiagonal,
                multiplePaths:false,
            });
            break;

        case 'thetastar_header':
            this.toggleDisabled = true;
            allowDiagonal = typeof $('#thetastar_section ' +
                                     '.allow_diagonal:checked').val() !== 'undefined';
            heuristic = $('input[name=thetastar_heuristic]:checked').val();
            finder = new Pf.ThetaStarFinder({
                allowDiagonal: allowDiagonal,
                heuristic: Pf.Heuristic[heuristic],
            });
            break;

        case 'ida_header':
            this.toggleDisabled = true;
            allowDiagonal = typeof $('#ida_section ' +
                                     '.allow_diagonal:checked').val() !== 'undefined';
            visualize_recursion = typeof $('#ida_section ' +
                                     '.visualize_recursion:checked').val() !== 'undefined';
            heuristic = $('input[name=ida_heuristic]:checked').val();

            timeLimit = parseInt($('#ida_section input[name=time_limit]').val());

            finder = new Pf.IDAStarFinder({
              allowDiagonal: allowDiagonal,
              heuristic: Pf.Heuristic[heuristic],
              visualize_recursion:visualize_recursion,
              timeLimit:timeLimit,
            });

            break;

        case 'k_paths_header':
            this.toggleDisabled = true;
            allowDiagonal = typeof $('#k_paths_section ' +
                                     '.allow_diagonal:checked').val() !== 'undefined';
            visualize_recursion = typeof $('#k_paths_section ' +
                                     '.visualize_recursion:checked').val() !== 'undefined';

            var paths = $('input[name=NumberOfPaths]:checked').val();
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
