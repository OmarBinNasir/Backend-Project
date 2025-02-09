let arr = ["gay", "dsc"]
let arr1 = ["gay"] // no sortType given
 
let sortBy = {};

if( arr[1] ){
    //computed property
    sortBy[arr[0]] = arr[1];
}
else{
    sortBy[arr[0]] = "asc" // by default ascending
}



console.log(sortBy)