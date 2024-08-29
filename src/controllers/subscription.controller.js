import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subcription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

 
const toggleSubscription = asyncHandler(async (req, res) => {
    // TODO: toggle subscription
    const { channelId } = req.params
    const  userId  = req.user._id
    const subscription = await Subscription.findOne({
    subscriber : userId ,
    channelId : channelId

    })
if(!subscription){
   const subscribed = await Subscription.create({
        subscriber : userId,
        channel : channelId
   })
    if(!subscribed)
        throw new ApiError(500, 'something went wrong')
    
    return res
    .status(200)
    .json(
        new ApiResponse(200, subscribed, "User subscribed Successfully")
    )
    }
else {
    const unsubscribed = await Subscription.findByIdAndDelete(subscription._id)
    if(!unsubscribed)
        throw new ApiError(500,"unsubscribe failed")
    return res
    .status(200)
    .json( new ApiResponse(200,unsubscribed,'subscription envoked' ) )
  }

})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params
   const channelSubscribers = await Subscription.aggregate([
    {
        $match : {
            channel : new mongoose.Types.ObjectId( channelId )
        }
    },
    {
        $lookup : {
            from : "users",
            localField : "subscriber",
            foreignField : "_id",
            as : "subscribers",
            pipeline:[
                {
                    $project : {
                        _id : 1,
                        fullName : 1,
                        username : 1,
                        avatar : 1
                    }
                }
            ]
        }
    },
    {
        $addFields:{
            subscribers :{
                $first : "$subscribers"
            }
        }
    },
    {
        $project : {
            subscribers : 1,

        }
    }
   ])
    if(channelSubscribers.length < 1)
        throw new ApiError(500,"server error, subscriber fetching failed")
    return res
    .status(200)
    .json(
        new ApiResponse(200, channelSubscribers, "subscribers fetched successfully")
    )
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
    // const subscribersList = await Subscription.find({
    //    subscriber : subscriberId
    // })
   const subscribersList = await Subscription.aggregate([
    {
        $match:{
            subscriber : new mongoose.Types.ObjectId(subscriberId)
        }
    },
    
    {
        $lookup :{
            from : "users",
            localField : "channel",
            foreignField : "_id",
            as : "subscribedTo",
            pipeline:[
                
                {
                    $project : {
                        fullName : 1,
                        username : 1,
                        avatar : 1,
                        _id : 1

                    }
                },
            ]
        }
    },
    {
        $project :{ 
            subscribedTo : 1
        }
    },
    {
        $addFields:{
           subscribedTo : {
            $first : "$subscribedTo"
           }
        }
    }
    
        
   ])

    if( subscribersList.length < 1)
        throw new ApiError(500, " subscribers couldnt be fetched")
    
    return res
    .status(200)
    .json(
        new ApiResponse(200, subscribersList, "subscribers fetched")
    )
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}