const mongoose = require('mongoose');
const postSchema = mongoose.Schema({
    description: { type: String, required: false },
    images: [String],
    isAccepted: { type: Boolean, default: false },
    status: { type: String, default: "Pending" },
    date: { type: Date, required: true, default: new Date() },
    userSaved: [
        {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"},
    ],
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"
        }
    ]
    ,
    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Like"
        }
    ],
},
    { timestamps: true }

);
postSchema.pre('findByIdAndDelete', async function (next) {
    try {
        const Comments = mongoose.model('Comment');
        const Likes = mongoose.model('Like');

        await Comments.deleteMany({ post: this._id });
        await Likes.deleteMany({ post: this._id });
        next(); 
    } catch (error) {
        next(error); 
    }
});

module.exports = mongoose.model("Post", postSchema);