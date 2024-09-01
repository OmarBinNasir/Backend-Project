import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    const existedLike = await Like.findOne({
        likedBy : req.user._id,
        video : videoId
    },{new : true})
    if(!existedLike) {
    const like = await Like.create({
        video : videoId,
        likedBy : req.user._id,
        comment :null,
        tweet : null
    })
    return res
    .status(200)
    .json(
        new ApiResponse(200,like,"user liked the video")
    )
    }
    else{
      const deletedLike = await Like.findByIdAndDelete(
            existedLike.id
        ,{new : true})
        return res
        .status(200)
        .json(
            new ApiResponse(200,deletedLike,"like removed")
        )
    }

    
    //TODO: toggle like on video
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params

    //TODO: toggle like on comment

    const existedLike = await Like.findOne({
        likedBy : req.user._id,
        comment : commentId
    },{new : true})
    if(!existedLike) {
    const like = await Like.create({
        comment : commentId,
        likedBy : req.user._id,
    })
    return res
    .status(200)
    .json(
        new ApiResponse(200,like,"user liked the comment")
    )
    }
    else{
      const deletedLike = await Like.findByIdAndDelete(
            existedLike.id
        ,{new : true})
        return res
        .status(200)
        .json(
            new ApiResponse(200,deletedLike,"like removed")
        )
    }

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet

    const existedLike = await Like.findOne({
        likedBy : req.user._id,
        tweet : tweetId
    },{new : true})
    if(!existedLike) {
    const like = await Like.create({
        tweet : tweetId,
        likedBy : req.user._id,
    })
    return res
    .status(200)
    .json(
        new ApiResponse(200,like,"user liked the tweet")
    )
    }
    else{
      const deletedLike = await Like.findByIdAndDelete(
            existedLike.id
        ,{new : true})
        return res
        .status(200)
        .json(
            new ApiResponse(200,deletedLike,"like removed")
        )
    }
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    const likedVideos =  await Like.aggregate([
        {
            $match : {
                likedBy : new mongoose.Types.ObjectId(req.user._id),
                tweet : null,
                comment : null
            }
        },
        {
            $lookup : {
                from : "videos",
                localField : "video",
                foreignField : "_id",
                as : "videoData",
                pipeline :[
                    {
                        $lookup : {
                            from : "users",
                            localField : "owner",
                            foreignField : "_id",
                            as : "ownerDetails",
                            pipeline :[
                                {
                                    $project :{
                                        fullName : 1,
                                        username : 1,
                                        avatar : 1,
                                        _id : 1
                                    }
                                }
                            ]
                        }
                    },
                    
                    {
                        $addFields : {
                            ownersData : {
                                $first : "$ownersData"
                            }
                        }
                    }
                ]
            },
        },
     ])
     if(!likedVideos)
        throw new ApiError(400,"liked video fetching failed")
     return res
     .status(200)
     .json(
        new ApiResponse(200, likedVideos, "liked videos pulled")
     )

})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}