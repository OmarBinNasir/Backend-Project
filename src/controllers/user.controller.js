import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from '../utils/ApiError.js';
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import {ApiResponse} from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken";
import { upload } from "../middlewares/multer.middleware.js";

const generateRefreshAndAccessTokens = async(userId)=>{
    try{
        
       const user= await User.findById(userId)
       const accessToken = user.generateAccessToken()
       const refreshToken = user.generateRefreshToken()

       user.refreshToken = refreshToken
       await user.save({ validateBeforeSave:false })

       return {accessToken,refreshToken}


    }catch(error){
        throw ApiError(500,"something went wrong while generating access and refresh token")
    }
}

const registerUser = asyncHandler(async (req,res)=>{
    //get user details from frontend
    //validation - not empty
    //check if user already exists
    //check for image, check for avatar
    //upload them to cloudinary, avatar
    //create user object and (add to database) create entry in database
    //remove password and refresh token from responose
    //check for user creation
    //return response
    
    const {fullName,email,username,password}=req.body
   // console.log(req.body);

    
        if(
            [fullName,email,username,password].some((field)=>field?.trim()==="")
            )
        {
            throw ApiError(400,"all field are required")
        }
        // validation can be multiple, there are multiple files of validation in production
        // to even check if email contains a @ sign
   const existedUser = await User.findOne({
        $or:[{username},{email}]      //$or checks username,email sends true the User model
    })

    if(existedUser)
        throw new ApiError(409,"User with same username or email already exists")

    const avatarLocalPath=req.files?.avatar[0]?.path;
   // const coverImageLocalPath=req.files?.coverImage[0]?.path;
   // this code is professional

    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0 ){
        coverImageLocalPath = req.files.coverImage[0].path
    }


    if(!avatarLocalPath)
        throw new ApiError(400,"Avatar file is required")
    
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

   if(!avatar)
       throw new ApiError(400,"Avatar file file is needed");

 const user = await User.create({
    fullName,
    avatar:avatar.url,
    coverImage:coverImage?.url||"",
    email,
    password,
    username:username.toLowerCase()
  })
  
   const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
   )

   if(!createdUser)
    throw new ApiError(500,"something went wrong with registering new user")

   return res.status(201).json(
    new ApiResponse(200,createdUser,"user registered succesfully")
   )
    
})

const loginUser = asyncHandler(async (req,res)=>{
    // req body -> data
    // enter username or email and password
    // check if username exists
    // validate the password and username
    // if exists login access generate refresh and access token
    // send cookies 
    const {email, username, password} = req.body

    if(!username||!email){
        throw new ApiError(400,"username or email is required");
    }

   const user = await User.findOne({
        $or:[{username},{email}]
    })// returns user instance
    if(!user){
        throw new ApiError(400,"User doesnt exist");
    }
    const isPasswordValid = await user.isPasswordCorrect(password);
    // User is not used, User is a mongoose object, the methods generateAccessToken, generateRefreshToken are available only in user instance
     
    if(!isPasswordValid){
        throw ApiError(400,"password is incorrect");
    }
    
    const {accessToken,refreshToken}=await generateRefreshAndAccessTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")// optional step

    const options ={
        httpOnly:true, //by these true, only server can modify the cookie, frontend cant modify the cookies now
        secure:true

    } // cookie options
     
    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(
            200,
            {
                user:loggedInUser, accessToken, refreshToken
            },
            "user logged in successfully"
        )
    )

})

const logoutUser = asyncHandler( async (req,res)=>{
  User.findOneAndUpdate(
    req.user._id,
    {
        $set:{
            refreshToken:undefined
        } // set gives the fields that needed to be upated
    },
    {
        new:true
    }
  )
  options={
    httponly:true,
    secure:true
  }

  return res
  .status(200)
  .clearCookie("accessToken",options)
  .clearCookie("refreshToken",options)
  .json(new ApiResponse(200,{},"user logged out"))

})

const refreshAccessToken = asyncHandler( async (req,res)=>{
    // when endpoint hits, cookie contains refresh token
   const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

   if(!incomingRefreshToken){
    throw new ApiError(401,"unauthorized request")
   }

  try {
     const decodedToken = jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
     //payload containing info fields like _id,
  
     const user = User.findById(decodedToken?._id).select("-pasword -refreshToken")
     
     if(!user){
      throw new ApiError(401,"invalid refresh token")
     }
  
     if(incomingRefreshToken !== user?.refreshToken){
      throw new ApiError(401,"invalid refresh token or token expired");
     }
  
     const options ={
      httpOnly:true,
      secure:true
     }
  
    const {accessToken, newRefreshToken} = await generateRefreshAndAccessTokens(user._id);
  
     return res
     .status(200)
     .cookies("accessToken",accessToken,options)
     .cookies("refreshToken",refreshToken,options)
     .json(
      new ApiResponse(200,
      {
          accessToken, refreshToken : newRefreshToken
      },
      "access token refreshed successfully"
  )
     )
  } catch (error) {
    throw new ApiError(401, error?.message || "invalid refreshToken")
  }
})

const changeUserPassword = asyncHandler( async (req,res)=>{
   const {oldPassword, newPassword, confirmPassword} = req.body

   if(newPassword !== confirmPassword ){
    throw new ApiError(401,"passwords doesnt match")
   }

   const user = await User.findById(req.user?._id)

   const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

   if(!isPasswordCorrect){
    throw new ApiError(400,"incorrect password");
   }

   user.password = newPassword

   await user.save({validateBeforeSave:false})

   return res
   .status(200)
   .json(
    200,
    "password changed successfully"
   )
})

const getCurrentUser = asyncHandler( async (req,res)=>{
    return res 
    .status(200)
    .json(
        200,
        req.user,
        "current user fetched sucessfully"
    )
})

const updateAccountDetail = asyncHandler ( async (req,res)=>{
    const {email,fullName} = req.body

    if(!(email||fullName)){
        throw new ApiError(401,"email and fullName is required")
    }

  const user = await User.findByIdAndUpdate(req.user._id,
        {
            $set:{
                fullName : fullName,
                email : email,
            } // set is used to only update selected items

        },
        {
            new :true
        }// new info returns if {new :true} or else use User.findByIdAndUpdate(req.user._id)  
    ).select("-password -refreshToken")

    return res
    .status(200)
    .json(
       new ApiResponse(200,user,"updated email and fullName successfully")
    )
})

const updateAvatar = asyncHandler(async (req,res)=>{
    const avatarLocalPath = req.file?.path

    if(!avatarLocalPath){
        throw new ApiError(401,"avatar not uploaded")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if(!avatar.url){
        throw new ApiError(400,"error occured while uplaoding on cloudinary")
    }

    User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                avatar : avatar.url
            }
        },
        {
            new : true
        }
    ).select("-password")
})



export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeUserPassword,
    getCurrentUser,
    updateAccountDetail,
    updateAvatar
}