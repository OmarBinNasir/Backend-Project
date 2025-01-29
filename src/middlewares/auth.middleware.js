import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";


export const verifyJWT = asyncHandler( async (req,res,next)=>{
  try {
     console.log("verify JWT : ",req)
     const token = req.cookies?.accessToken || req.header 
      ("Authorization")?.replace("Bearer ","");
  
      if(!token){
          throw new ApiError(401,"Unauthorized request");
      }
  
      const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
  
     const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
  
     if(!user){
      throw new ApiError(401,"Invalid Access Token");
     }
     
     req.user = user;
     next() //this will run the next funtion after verifyJWT in user route: post(verifyJWT, logoutUser)

  } catch (error) {
    throw new ApiError(401,error?.message||"invalid access token")
  }

})
//added auth middeware to get the info of the user using cookies 
// it creates a req.user that contains the whole database user
