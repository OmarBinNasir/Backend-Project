import mongoose,{Schema} from "mongoose";

const likeSchema = new Schema({
    comment:{
        type:Schema.Types.ObjectId,
        ref:"Comment"
    },
    desciption:{
        type:String,
        required:true
    },
    likedBy:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },
    videos:[
        {
            type:Schema.Types.ObjectId,
            ref:"Video"
        }
    ]
},
{timestamps:true})

//likeSchema.plugin(mongooseAggregatePaginate);

export const Like = mongoose.model("Like",likeSchema)