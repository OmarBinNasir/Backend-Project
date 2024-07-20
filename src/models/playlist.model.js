import mongoose,{Schema} from "mongoose";

const playlistSchema = new Schema({
    name:{
        type:String,
        required:true,
    },
    desciption:{
        type:String,
        required:true
    },
    owner:{
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

playlistSchema.plugin(mongooseAggregatePaginate);

export const Playlist = mongoose.model("Playlist",playlistSchema)