$(document).ready(function () {
    //createSudokuHTML();


    $("td.su-inner").click(function () {
        if( $(this).hasClass("selected") ){
            $(this).removeClass("selected");
        } else {
            $(this).addClass("selected");
        }
    });

    $(window).keypress(function(e) {
        var ev = e || window.event;
        var key = ev.keyCode || ev.which;
        if (key > 48 && key <= 57) {
            $("td.su-inner.selected").text(key - 48);
        } else if(key == 48) {
            $("td.su-inner.selected").text("");
        } else {
            return;
        }
        $("td.su-inner.selected").removeClass("selected");
    });


    $("#brute-force").click( function(){
        $("td.su-inner.selected").removeClass("selected");
        bruteForce();
    });
    $("#extended-brute").click( function(){
        $("td.su-inner.selected").removeClass("selected");
        extendedBruteForce();
    });
    $("#clean-table").click( function(){
        $("td.su-inner").removeClass("selected");
        $("td.su-inner").removeClass("found");
        $("td.su-inner").text("");
    });


    $("#perm-check").click( function(){
        $("td.su-inner.selected").removeClass("selected");
        permutationChecking();
    });

    $("#export-button").click( function(){
        $("#export-table").text( $("#sudoku").html() );
    });
    $("#import-button").click( function(){
        $("#sudoku").html( $("#export-table").text() );
    });


});
function getCellValue(x,y){

    var value = $("#su-inner-cell-" + getCell(x,y)).text();
    if(!value) {
        return 0;
    }
    return Number(value);
}
// Returns HTML sudoku table in 9x9 array format.
function getTable(){


    var table = new Array(11);
    for(var i = 0; i < 9; i++) {
        table[i] = new Array(11);
        for(var j = 0; j < 9; j++) {
            table[i][j] = getCellValue(i,j);
        }
    }

    return table;
}


function getCell(x,y){
    var y_offset = Math.floor(y / 3) * 9 + (y % 3) + 1;
    var x_offset = (x % 3)*3 + Math.floor(x / 3) * 27;

    return y_offset + x_offset;
}

function setTableHTML(table){
    for(var i = 0; i < 9; i++){
        for(var j = 0; j < 9; j++){
            if(getCellValue(i,j) == 0) {
                if(table[i][j] != 0) {
                    setCellValue(i, j, table[i][j]);
                }
                else{
                    setCellValue(i, j, "");
                }
            }
        }
    }
}

function setCellValue(x,y,value){
    $("#su-inner-cell-" + getCell(x,y)).text(value);
    $("#su-inner-cell-" + getCell(x,y)).addClass("found");
}

function getCircular(x,y,i,table){
    var circ = Math.floor(x / 3) * 3 + Math.floor(y / 3);

    var start_y = (circ % 3) * 3;
    var start_x = Math.floor(circ / 3) * 3;

    var final_y = start_y + i % 3;
    var final_x = start_x + Math.floor(i / 3);

    return table[final_x][final_y];
}

function removeElementFromArray(element, array){
    var index = array.indexOf(element);
    if(index > -1) {
        array.splice(index, 1);
    }
}

function utilClone2D(arr){
    var clone = [];
    for(var i = 0; i < arr.length; i++){
        if(arr[i] != null) {
            clone.push(arr[i].slice(0));
        }
    }
    return clone;
}


function permutationChecking(){
    permSolution();


    function permSolution(){
        var queue = [];
        queue.push(getTable());

        var check = 0;
        do {
            check++;
            var table = queue.shift();
            console.log("TABLE[1][1]: " + table[1][1]);
            table = fillTable(table);
            if(check == 1){
                setTableHTML(table);
            }
            if(isSolved(table) == true){
                console.log("I FOUND A SOLUTION");
                setTableHTML(table);
                return 0;
            }
            addPossiblePermutations(queue, table);
            console.log("END OF CHECK: " + check + " >> QUEUE LENGTH: " + queue.length);
        }while(queue.length > 0 && check < 10000);

        console.log("I COULD NOT FIND A SOLUTION");
        return 0;




        function addPossiblePermutations(queue, table){

            var minPosList = [0,1,2,3,4,5,6,7,8,9];
            var minPosX = -1;
            var minPosY = -1;

            for(var i = 0; i < 9; i++){
                for(var j = 0; j < 9; j++){
                    var curPosList = checkCellCases(table,i,j);
                    if(curPosList.length > 0 && curPosList.length < minPosList.length){
                        minPosList = curPosList;
                        minPosX = i;
                        minPosY = j;
                    }
                }
            }
            if(minPosList.length == 10){
                return;
            }

            console.log("Add to Queue > possible cases (min): " + minPosList.length);
            for(var i = 0; i < minPosList.length; i++ ) {
                var temp_table = utilClone2D(table);
                temp_table[minPosX][minPosY] = minPosList[i];
                queue.push(temp_table);
                console.log("Adding Possible Permutation: [x,y] : num >> [ " + minPosX + "," + minPosY + " ] : " + minPosList[i] );
            }

            return;
        }




    }

    function isSolved(s_table){
        for(var i = 0; i < 9; i++) {
            for(var j = 0; j < 9; j++) {
                if(s_table[i][j] == 0){
                    return false;
                }
            }
        }
        return true;
    }

    function checkCellCases(table, x, y){
        var possibleNumbers = [];
        for(var i = 1; i < 10; i++) {
            if(isPossibleNumber(table,x,y,i)){
                possibleNumbers.push(i);
            }
        }

        return possibleNumbers;

        function isPossibleNumber(table,x,y,number){
            if(table[x][y] != 0) {
                return false;
            }
            for(var i = 0; i < 9; i++) {
                if( table[i][y] == number ){
                    return false;
                }
            }
            for(var i = 0; i < 9; i++) {
                if( table[x][i] == number ){
                    return false;
                }
            }

            for(var i = 0; i < 9; i++) {
                if( getCircular(x,y,i,table) == number ){
                    return false;
                }
            }

            return true;
        }
    }

    function fillTable(table){
        var progress = false; // did we make progress in the last loop?
        do {
            progress = false;
            // For each row, column, box
            for(var i = 0; i < 9; i++){
                if(searchRow(i) || searchColumn(i) || searchCircular(i)) {
                    progress = true;
                }
            }
            // For each X,Y cell
            for(var i = 0; i < 9; i++){
                for(var j = 0; j < 9; j++){
                    var cases = checkCellCases(table,i,j)
                    if(cases.length == 1){
                        table[i][j] = cases[0];
                        progress = true;
                    }
                }
            }

        } while(isSolved(table) == false && progress == true);

        return table;

        function searchRow(row){
            var progress = false;
            var poss_num = [1, 2, 3, 4, 5, 6, 7, 8, 9];

            for(var i = 0; i < 9; ++i) {
                removeElementFromArray(table[row][i],poss_num);
            }
            for(var i = 0; i < poss_num.length; i++) {
                var poss_loc = [0, 1, 2, 3, 4, 5, 6, 7, 8];
                for(var j = 0; j < 9; j++) {
                    if(isPossible(row,j,poss_num[i]) == false){
                        removeElementFromArray(j,poss_loc);
                    }
                }
                if(poss_loc.length == 1){
                    table[row][poss_loc[0]] = poss_num[i];
                    progress = true;
                }
            }
            return progress;
        }


        function searchColumn(col){
            var progress = false;
            var poss_num = [1, 2, 3, 4, 5, 6, 7, 8, 9];

            for(var i = 0; i < 9; ++i) {
                removeElementFromArray(table[i][col], poss_num);
            }
            for(var i = 0; i < poss_num.length; i++) {
                var poss_loc = [0, 1, 2, 3, 4, 5, 6, 7, 8];
                for(var j = 0; j < 9; j++) {
                    if(isPossible(j,col,poss_num[i]) == false){
                        removeElementFromArray(j,poss_loc)
                    }
                }
                if(poss_loc.length == 1){
                    table[poss_loc[0]][col] = poss_num[i];
                    progress = true;
                }
            }
            return progress;
        }

        function searchCircular(circ){
            var progress = false;
            var poss_num = [1, 2, 3, 4, 5, 6, 7, 8, 9];
            for(var i = 0; i < 9; ++i) {
                removeElementFromArray(getNthCircular(i),poss_num);
            }
            for(var i = 0; i < poss_num.length; i++) {
                var poss_loc = [0, 1, 2, 3, 4, 5, 6, 7, 8];
                for(var j = 0; j < 9; j++) {
                    var coord = getNthCircularCoordinates(j);
                    var x = coord[0];
                    var y = coord[1];

                    if(isPossible(x ,y, poss_num[i]) == false) {
                        removeElementFromArray(j,poss_loc)
                    }
                }
                if(poss_loc.length == 1) {
                    setNthCircular(poss_loc[0],poss_num[i]);
                    progress = true;
                }
                return progress;
            }


            function getNthCircularCoordinates(i){
                var start_y = (circ % 3) * 3;
                var start_x = Math.floor(circ / 3) * 3;

                var final_y = start_y + i % 3;
                var final_x = start_x + Math.floor(i / 3);
                return [final_x, final_y];
            }

            function getNthCircular(i){
                var coord = getNthCircularCoordinates(i);
                var x = coord[0];
                var y = coord[1];

                return table[x][y];
            }

            function setNthCircular(i,value){
                var coord = getNthCircularCoordinates(i);
                var x = coord[0];
                var y = coord[1];

                table[x][y] = value;
            }
        }

        function isPossible(x,y,number){
            if(table[x][y] != 0) {
                return false;
            }
            for(var i = 0; i < 9; i++) {
                if( table[i][y] == number ){
                    return false;
                }
            }
            for(var i = 0; i < 9; i++) {
                if( table[x][i] == number ){
                    return false;
                }
            }

            for(var i = 0; i < 9; i++) {
                if( getCircular(x,y,i,table) == number ){
                    return false;
                }
            }

            return true;
        }
    }
}





// Search Per Row/Col/Circ
function extendedBruteForce(){
    var table = getTable();

    var progress = false; // did we make progress in the last loop?

    do {
        for(var i = 0; i < 9; i++){
            console.log("Extend brute force i: " + i);

            searchRow(i);
            searchColumn(i);
            searchCircular(i);

        }

    } while( isSolved() == false && progress == true)
    if( isSolved() == false ){
        $("#log").text("Extended cant solve this puzzle :( !");
    }

    function searchRow(row){
        var poss_num = [1, 2, 3, 4, 5, 6, 7, 8, 9];

        for(var i = 0; i < 9; ++i) {
            var index = poss_num.indexOf(table[row][i]);
            if(index > -1) {
                poss_num.splice(index, 1);
            }
        }
        for(var i = 0; i < poss_num.length; i++) {
            var poss_loc = [0, 1, 2, 3, 4, 5, 6, 7, 8];
            for(var j = 0; j < 9; j++) {
                if(isPossible(row,j,poss_num[i]) == false){
                    var index = poss_loc.indexOf(j);
                    if(index > -1) {
                        poss_loc.splice(index, 1);
                    }
                }
            }
            if(poss_loc.length == 1){
                table[row][poss_loc[0]] = poss_num[i];
                setCellValue(row,poss_loc[0],poss_num[i]);
            }
        }
    }


    function searchColumn(col){
        var poss_num = [1, 2, 3, 4, 5, 6, 7, 8, 9];

        for(var i = 0; i < 9; ++i) {
            var index = poss_num.indexOf(table[i][col]);
            if(index > -1) {
                poss_num.splice(index, 1);
            }
        }
        for(var i = 0; i < poss_num.length; i++) {
            var poss_loc = [0, 1, 2, 3, 4, 5, 6, 7, 8];
            for(var j = 0; j < 9; j++) {
                if(isPossible(j,col,poss_num[i]) == false){
                    var index = poss_loc.indexOf(j);
                    if(index > -1) {
                        poss_loc.splice(index, 1);
                    }
                }
            }
            if(poss_loc.length == 1){
                table[poss_loc[0]][col] = poss_num[i];
                setCellValue(poss_loc[0],col,poss_num[i]);
            }
        }
    }

    function searchCircular(circ){


        var poss_num = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        for(var i = 0; i < 9; ++i) {
            var index = poss_num.indexOf(getNthCircular(i));
            if(index > -1) {
                poss_num.splice(index, 1);
            }
        }
        for(var i = 0; i < poss_num.length; i++) {
            var poss_loc = [0, 1, 2, 3, 4, 5, 6, 7, 8];
            for(var j = 0; j < 9; j++) {
                var coord = getNthCircularCoordinates(j);
                var x = coord[0];
                var y = coord[1];

                if(isPossible(x ,y, poss_num[i]) == false) {
                    var index = poss_loc.indexOf(j);
                    if(index > -1) {
                        poss_loc.splice(index, 1);
                    }
                }
            }
            if(poss_loc.length == 1) {
                setNthCircular(poss_loc[0],poss_num[i]);
            }
        }


        function getNthCircularCoordinates(i){
            var start_y = (circ % 3) * 3;
            var start_x = Math.floor(circ / 3) * 3;

            var final_y = start_y + i % 3;
            var final_x = start_x + Math.floor(i / 3);
            return [final_x, final_y];
        }

        function getNthCircular(i){
            var coord = getNthCircularCoordinates(i);
            var x = coord[0];
            var y = coord[1];

            return table[x][y];
        }

        function setNthCircular(i,value){
            var coord = getNthCircularCoordinates(i);
            var x = coord[0];
            var y = coord[1];

            table[x][y] = value;
            setCellValue(x, y, value);
        }
    }






    function isPossible(x,y,number){
        if(table[x][y] != 0) {
            return false;
        }
        for(var i = 0; i < 9; i++) {
            if( table[i][y] == number ){
                return false;
            }
        }
        for(var i = 0; i < 9; i++) {
            if( table[x][i] == number ){
                return false;
            }
        }

        for(var i = 0; i < 9; i++) {
            if( getCircular(x,y,i,table) == number ){
                return false;
            }
        }

        return true;
    }






    function isSolved(){
        for(var i = 0; i < 9; i++) {
            for(var j = 0; j < 9; j++) {
                if(table[i][j] == 0){
                    return false;
                }
            }
        }
        return true;
    }
}


// Search Per Cell. Fails at medium and above puzzles.
function bruteForce(){
    var table = getTable();
    var sum = 0;
    var change = false;
    do {
        change = false;
        sum = 0;
        for(var i = 0; i < 9; i++) {
            for(var j = 0; j < 9; j++) {
                var result = bruteForceCell(i, j);
                if(result == 2) {
                    change = true;
                }
                sum += result;
            }
        }
        console.log("NEXT LOOP CHECK");
    }while(sum>0 && change == true);


    if(change == false) {
        $("#log").text("Simple Brute Force could not solve this puzzle!");
    }
//    for(var i = 0; i < 9; i++) {
//        for(var j = 0; j < 9; j++) {
//            if( getCellValue(i,j) != table[i][j]) {
//                setCellValue(i, j, table[i][j]);
//            }
//        }
//    }

    function isPossible(x,y,number){
        for(var i = 0; i < 9; i++) {
            if( table[i][y] == number ){
                return false;
            }
        }
        for(var i = 0; i < 9; i++) {
            if( table[x][i] == number ){
                return false;
            }
        }
        console.log("Entering Circular Check.");
        for(var i = 0; i < 9; i++) {
            if( getCircular(x,y,i,table) == number ){
                return false;
            }
        }

        return true;
    }


    function bruteForceCell(x,y){
        if( table[x][y] ){
            return 0;
        }

        var poss = 0;

        for(var i = 1; i < 10; i++) {
            if(isPossible(x,y,i)) {
                console.log(x + "|" + y + " is possible as: " + i);
                if(poss == 0) {
                    poss = i;
                }
                else{
                    return 1;
                }
            }
        }
        console.log(":::::" + x + "|" + y + " setting: " + poss);
        table[x][y] = poss;
        setCellValue(x,y,poss);
        console.log("::::::SET");
        return 2;
    }
}






function createSudokuHTML(){


    var inner_cells = [];
    var inner_rows = [];
    var inner_tables = [];

    // Create the inner 81 cells
    for(var i = 1; i <= 81; i++) {
        inner_cells.push( $("<td/>").attr("id","su-inner-cell-" + i).attr("class","su-inner").text("1"));
    }

    // Create the inner 27 rows
    for(var i = 1; i <= 27; i++) {
        var row = $("<tr/>").attr("id","su-inner-row-" + i).attr("class","su-inner");
        for(var j = 1; j <= 3; j++) {
            row.append(inner_cells[(i-1)*3+j-1]);
        }

        inner_rows.push(row);
    }

    // Create the inner 9 tables with body
    for(var i = 1; i <= 9; i++) {
        var tbody = $("<tbody/>").attr("id", "su-inner-tbody-" + i).attr("class","su-inner");
        for(var j = 1; j <= 3; j++) {
            tbody.append(inner_rows[(i-1)*3+j-1]);
        }
        inner_tables.push( $("<table/>").attr("id","su-inner-table-" + i).attr("class","su-inner").append(tbody));
    }

    console.log("Created Inner DOM elements!");

    var outer_cells = [];
    var outer_rows = [];

    // Create outer 9 cells
    for(var i = 1; i <= 9; i++) {
        var cell = $("<td/>").attr("id","su-outer-cell-"+i).attr("class","su-outer").append(inner_tables[i-1]);
        outer_cells.push(cell);
    }

    // Create outer 3 rows
    for(var i = 1; i <= 3; i++) {
        var row = $("<tr/>").attr("id","su-outer-row-"+i).attr("class","su-outer");
        for(var j = 1; j <= 3; j++){
            row.append(outer_cells[(i-1)*3+j-1]);
        }
        outer_rows.push(row);
    }




    // Create outer table
    $("#sudoku").append(
        $("<table/>")
            .attr("id","su-outer-table")
            .attr("class","su-outer")
            .append($("<tbody/>").attr("id","su-outer-tbody"))
    );

    // Attach outer rows to outer table
    for(var i = 1; i <= 3; i++){
        $("#su-outer-tbody").append(outer_rows[i-1]);
    }


}
