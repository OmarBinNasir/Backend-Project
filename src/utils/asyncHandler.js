const asyncHandler=(requestHandler)=>{
    return (req,res,next)=>{
        Promise.resolve(requestHandler(req,res,next)).catch((error)=>next(error))
    }
}

// const asyncHandler=()=>{}
// const asyncHandler=(func)=>{ ()=>{} }
// const asyncHandler=(func)=> async ()={ await func();}

export {asyncHandler}


// const asyncHandler=(fun)=> async (req,res,next)=>{
//     try{
//         await fun(req,res,next);

//     }
//     catch(error){
//             res.status(error.code||500).json({
//                 sucess:false,
//                 message:error.message
//             })
//         }
// }
 //try catch method