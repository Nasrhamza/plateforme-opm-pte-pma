var mongoose  = require("mongoose"),
commentSchema = mongoose.Schema({
    text:String,
    user :{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
    },
    post :{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Post"
    }
},
{ timestamps: true }
);
commentSchema.pre('remove', function (next) {
    const Posts = mongoose.model('Post');
    Posts.deleteMany({ comments: this._id }).then(() => {
        next()
    })
})
module.exports = mongoose.model("Comment",commentSchema);