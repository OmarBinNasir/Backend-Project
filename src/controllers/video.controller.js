import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description, isPublished } = req.body
    // TODO: get video, upload to cloudinary, create video
    if( [title, description].some((field)=> field.trim() === "") )
        throw new ApiError(400, "all fields are required")
        
    const videoFilePath = req.files?.videoFile[0].videoFilePath
    
    let thumbnailPath;
    if(req.files && Array.isArray(req.files.thumbnail) && req.files.thumbnail.length > 0)
         thumbnailPath = req.files.thumbnail[0].path

    const videoFile = await uploadOnCloudinary(videoFilePath)
    const thumbnail = await uploadOnCloudinary(thumbnail)

    if(!videoFile)
        throw new ApiError(500,"Uploading video on cloud failed")
    console.log(videoFile)
    })
    if(!thumbnail)
        throw new ApiError(500,"thumbnail failed uploading")

    const video = await Video.create({
        title : title,
        videoFile : videoFile.url,
        thumbnail : thumbnail.url,
        description : description,
        isPublished,
        duration : videoFile.duration,
        owner : req.user._id

    })

    const publishedVideo = await Video.findById(video._id)

    if(!publishedVideo)
        throw new ApiError(500,'something went wrong')

    return res
    .status(201)
    .json(
        new ApiResponse(200, publishedVideo, "video published successfully" )
    )

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if(!videoId){
        throw new ApiError(400,"videoId is not provided")
    }

    const video = Video.aggregate([
        {
            $match:{
                _id:videoId
            }
        },
        {
            $lookup:{
                from:"users",
                localField:"owner",
                foriegnField:"_id",
                as:"owner",
                pipeline:[
                    {
                        $project:{
                            username:1,
                            avatar:1,
                            fullName:1
                        }
                    },
                    {
                        $addField:{
                            owner:{
                                $first:"$owner"
                            }
                        }    
                    },
                    {
                        $lookup:{
                            
                        }
                    }
                ]
            }
        },
       
    ])

    //TODO: get video by id
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}