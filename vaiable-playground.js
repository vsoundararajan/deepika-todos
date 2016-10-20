/**
 * Created by soundararajanvenkatasubramanian on 10/20/16.
 */

var arr = [1, 2, 3, 4];

function assignArray(a){
    a = [11, 12, 13, 14];
    console.log("Inside assignArray");
    console.log(a);
}

function updateArray(a){
    a.push(5);
    a.unshift(0);
}


console.log("original array");
console.log(arr);
assignArray(arr);
console.log("after calling assignArray ");
console.log(arr);


updateArray(arr);
console.log("after calling updateArray ");
console.log(arr);
