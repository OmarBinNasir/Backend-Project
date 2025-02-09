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

const req = {
    hell : "bad",

}
req.heaven = "good"

console.log("req : ",req)

router.get("/profile", verifyJwt, async(req,res) => {
    return res
    .status(200)
    .json({status:200,user : req.user,  })
})