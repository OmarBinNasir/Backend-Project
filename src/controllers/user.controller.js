import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from '../utils/ApiError.js';
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import {ApiResponse} from "../utils/ApiResponse.js"

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
    console.log(req.body);

    
        if(
            [fullName,email,username,password].some((field)=>field?.trim()==="")
            )
        {
            throw ApiError(400,"all field are required")
        }
        // validation can be multiple, there are multiple files of validation in production
        // to even check if email contains a @ sign
   const existedUser = User.findOne({
        $or:[{username},{email}]      //$or checks username,email sends true the User model
    })

    if(existedUser)
        throw new ApiError(409,"User with same username or email already exists")

    const avatarLocalPath=req.files?.avatar[0]?.path;
    const coverImageLocalPath=req.files?.coverImage[0]?.path;

    if(!avatarLocalPath)
        throw new ApiError(400,"Avatat file is required")
    
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if(!avatar)
    throw new ApiError(400,"Avatar file is required")

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



export {registerUser}