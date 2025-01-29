import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"

// GET /video?sort=title,asc&

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy = "createdAt", sortType = "desc", userId } = req.query
    //TODO: get all videos based on query, sort, pagination
    let sortBy1 = {};
    // { createdAt : asc }
    if(sort[1]){
        sortBy1[sort[0]] = sort[1]  // sortBy1["title"] = asc
    }
    else{
        sortBy[sort[0]] = "asc"
    }
    const videos = await Video.find({ title : {$regex:query, $options : 'i'}})
        .sort(sortBy1)
        .skip( ( page-1 ) * limit )
        .limit(limit)
    const videos1 = await Video.aggregate([
        {
            $match : {
                $or : [
                    {
                        title : {
                            $regex : query,
                            $options : "i"
                        }
                    },
                    {
                        description : {
                            $regex : query,
                            $options : "i"
                        }
                    }
                ]
            }
        },
        {
            $match : {
                title : {
                    $regex : query,
                    $options : "i"
                }
            }
        },
        {
            $sort : {
                title : 1 
            }
        },
        {
            $skip : (page - 1) * limit
        },
        {
            $limit : limit
        }
    ])
    const sortedByDate = await Video.find().sort({createdOn : 1})
    const sortByDate = await Video.aggregate([
        {
            $sort : {createdOn : -1}
        },
    ])
    const result = await Video.updateMany(
        {}, // Match all documents or apply some filter
        {
          $set: {
            newField: "This is a new field" // adding newField in document
          }
        }
      );
    const total = await Video.countDocuments({title : {$regex:query, $options : "i"}})
    const videosMulti = await Video.find({
        "$or":[
            {title:{$regex : search, options : "i"}, views : {$gt : 100}},
            {description : {$regex : search, options : "i"}}
        ]
    })    // if used and it will only show documents that matches this both quality muplti field search
    const countVideosMulti = await Video.find({
        "$or":[
            {title:{$regex : search, options : "i"}, views : {$gt : 100}},
            {description : {$regex : search, options : "i"}}
        ]
    }).countDocuments(); 
    // sort 
    let sort = req.query.sort || "createdBy"
    req.query.sort ? ( sort = req.query.sort.split(",") ) : (sort = [sort])
    
})
// GET /videos?page=2&limit=5&query=tutorial&sortBy=title&sortType=asc&userId=605c72aef1d1c234567890ab
const getAllVideos1 = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query = '', sortBy = 'createdAt', sortType = 'desc', userId } = req.query;

    // Define filters
    const filters = {};
    if (query) {
        filters.title = { $regex: query, $options: 'i' }; // Search by title with case-insensitivity
    }
    if (userId) {
        filters.userId = userId; // Filter by user ID
    }

    // Define sorting
    const sortOptions = {};
    sortOptions[sortBy] = sortType === 'asc' ? 1 : -1;

    // Fetch videos with pagination and sorting
    const videos = await Video.find(filters)
        .sort(sortOptions)
        .skip((page - 1) * limit)
        .limit(parseInt(limit));

    // Total count for pagination
    const totalVideos = await Video.countDocuments(filters);

    res.status(200).json({
        success: true,
        data: videos,
        pagination: {
            total: totalVideos,
            page: parseInt(page),
            limit: parseInt(limit),
        },
    });
});

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description, isPublished } = req.body
    // TODO: get video, upload to cloudinary, create video
    if( [title, description].some((field)=> field.trim() === "") )
        throw new ApiError(400, "all fields are required")
        
    const videoFilePath = req.files?.videoFile[0].path
    
    let thumbnailPath;
    if(req.files && Array.isArray(req.files.thumbnail) && req.files.thumbnail.length > 0)
         thumbnailPath = req.files.thumbnail[0].path

    const videoFile = await uploadOnCloudinary(videoFilePath)
    const thumbnail = await uploadOnCloudinary(thumbnailPath)

    if(!videoFile)
        throw new ApiError(500,"Uploading video on cloud failed")
    console.log(videoFile)
    
    if(!thumbnail)
        throw new ApiError(500,"thumbnail failed uploading")


    const video = await Video.create({
        title : title,
        videoFile : videoFile.url,
        thumbnail : thumbnail.url,
        description : description || "" ,
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
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if(!videoId){
        throw new ApiError(400,"videoId is not provided")
    }

    const video = await Video.aggregate([
        {
            $match:{
                _id: mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup:{
                from:"users",
                localField:"owner",
                foreignField:"_id",
                as:"channelOwner",
                pipeline:[
                    {
                        $project:{
                            _id : 1,
                            username:1,
                            avatar:1,
                            fullName:1,
                        }
                    },
                    
                ]
            }
        },
        {
            $addFields :{
                channelOwner:{
                $first : "$channelOwner"
                }
            }
        }
       
    ])
    
    if(!video){
        throw new ApiError(400,"video cannot be fetched aur deleted")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,channel,"video fetched successfully")
    )
    //TODO: get video by id
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail
    const {title, description} = req.body
    
    const thumbnailPath = req.files?.thumbnail[0].path
    let thumbnailCloud;
    if(thumbnailPath)
     thumbnailCloud = await uploadOnCloudinary(thumbnailPath)

    const thumbnail = thumbnailCloud.url
    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        {
            $set :{
                title,
                description,
                ...( thumbnail && {thumbnail} )
            }
        },
        {new : true}
    )

    return res
    .status(200)
    .json(
        new ApiResponse(200, updatedVideo, "video fields updated")
    )

})
 //TODO: delete video
const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    const deletedVideo = await Video.findByIdAndDelete(
        videoId
    )
   return res
   .status(200)
   .json(
    new ApiResponse(200,deletedVideo, "video deleted")
   )
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
  
  const video = await Video.findByIdAndUpdate(
    videoId,
    {
        $set :{
            isPublished : !isPublished
        }
    }
  )
    
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}