'use strict';

var CSV = require("comma-separated-values");
var fs  = require("fs");
var _   = require("underscore");
var sys = require("sys");

//決定木のノード(コンストラクタ)
function DecisionNode(col, val, results, tb, fb, isEnd) {
    var node     = {};
    node.col     = col;
    node.val     = val;
    node.results = results;
    node.tb      = tb;
    node.fb      = fb;
    node.isEnd   = isEnd;
    return node;
}

//クラスとそれぞれの個数を計算する関数
function uniqueCounts(rows) {
    var results = {};
    if(rows.length !== 0) { 
        rows.forEach(function(row) {
            var y = row[row.length-1];
            if( results[y] >= 1) results[y]++;
            else {
                results[y] = 1;
            }
        });
    }
    return results;
}

//ジニ不純度を計算する関数
function calcGini(rows) {
    var total = rows.length;
    var sum = 0;
    var uniques = uniqueCounts(rows);

    Object.keys(uniques).forEach(function(key) {
        sum += (uniques[key]/total) * (uniques[key]/total);
    });

    return 1-sum;   
}

//任意の特徴量で、任意の値で二つに分類する関数
function divide(rows, column, value) {
    var splitFunc;
    var notSplitFunc;

    if(typeof value === 'number') {
        splitFunc    = function(row) { return row[column] > value; };
        notSplitFunc = function(row) { return !(row[column] > value); };
    } else {
        splitFunc    = function(row) { return row[column] === value; }
        notSplitFunc = function(row) { return !(row[column] === value); }
    }
    var trueSet  = rows.filter(splitFunc);
    var falseSet = rows.filter(notSplitFunc);

    return [trueSet, falseSet];
}    

// 決定木を構築
function buildTree(rows) {
    var currentGini = calcGini(rows);
    var subResult = uniqueCounts(rows);
    var bestCol;
    var bestVal;
    var bestGini = 1;
    var bestSets = new Array();

    var cols = rows[0].length-1;

    for(var col=0; col < cols; col++) {
        var min = parseFloat(_.min(rows, function(row) { return row[col]; })[2]);
        var max = parseFloat(_.max(rows, function(row) { return row[col]; })[2]);

        var boundaries = _.uniq(rows.map(function(row) { return parseFloat(row[col]); }))
        .sort(function(pre, after) { return pre > after ? 1 : -1; });
        var diffs = new Array();
        for(var i=0; i < boundaries.length-1; i++) {
            var diff = (boundaries[i+1]+boundaries[i])/2;
            diffs.push(diff.toFixed(2));
        }

        diffs.forEach(function(diff) {
            var dividedSets = divide(rows, col, parseFloat(diff));
            if(!(dividedSets[0].length === 0) && !(dividedSets[1].lentgh === 0)) {
                var gini = ( calcGini(dividedSets[0]) + calcGini(dividedSets[1]) ) / 2;
                if(gini < bestGini) {
                    bestCol = col;
                    bestVal = diff;
                    bestGini = gini;
                    bestSets[0] = dividedSets[0];
                    bestSets[1] = dividedSets[1];
                }
            }
        });
    }
    if(bestGini < currentGini && bestSets[0].length > 1 && bestSets[1].length > 1) {
        var trueBranch  = buildTree(bestSets[0]);
        var falseBranch = buildTree(bestSets[1]);
        return new DecisionNode(bestCol, bestVal, subResult, trueBranch, falseBranch, false);
    } else {
        return new DecisionNode(null, null, subResult, null, null, true);
    }

}

function printTree(tree, indent) {
    if (indent === null) indent = '';
    if (tree.isEnd) {
        console.log(tree.results);
    } else {
        console.log(tree.col+":"+tree.val);
        sys.print(indent+'T->');
        printTree(tree.tb, indent+' ');
        sys.print(indent+'F->');
        printTree(tree.fb, indent+' ');
    }
}

function createJSON(tree, attributes) {
    if(tree.isEnd) {
        var object = new Array()
        Object.keys(tree.results).forEach(function(key) {
            object.push({name: key+": "+tree.results[key]})
        })
        if(object.length === 1) return object[0]
            else return object
    } else {
        var object = {
            name: attributes[tree.col]+" <= "+tree.val,
        }
        object.children = new Array()

        var fb = createJSON(tree.fb, attributes);
        if(fb && Array.isArray(fb)) {
            fb.forEach(function(obj) {
                object.children.push(obj)
            })
        } else {
            object.children.push(fb)
        }

        var tb = createJSON(tree.tb, attributes);
        if(tb && Array.isArray(tb)) {
            tb.forEach(function(obj) {
                object.children.push(obj)
            })
        } else {
            object.children.push(tb)
        }
        return object
    }
}

/*
 * ******
 * main *
 * *******
 */

(function() {
    var csv        = new CSV(fs.readFileSync('../source/iris.data', 'utf-8')).parse();
    var attributes = csv[0];
    var data       = csv.splice(1, csv.length);
    var tree = buildTree(data);    
    var resultJSON = JSON.stringify(createJSON(tree, attributes), null, '\t')
    fs.writeFile('../source/result.json', resultJSON, function(err) {
        if(err) console.error(err)
    })
printTree(tree, '');
})();
