const role = {
    position : "slave",
    rank : "not free"
}

const path = role.rank
const obj = {
    name : "gay",
    class : "6th",
    ...{path}
}

console.log(obj)