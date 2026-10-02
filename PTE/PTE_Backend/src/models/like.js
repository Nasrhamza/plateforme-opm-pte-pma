var mongoose  = require("mongoose")
likeSchema = mongoose.Schema({
    user :{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
    },
    post :{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Post"
    },
},
{
        timestamps: true
}

);
module.exports = mongoose.model("Like",likeSchema);


