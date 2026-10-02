const { ObjectId } = require("mongodb");
const Like = require("../models/like");
const Post = require("../models/post")



module.exports.like =async function  (req, res, next) {
    try {
        const post = await Post.findById(req.params.id).populate('user likes')
        const likes = post.likes
        const like = likes.find(like => like.user == req.body.user)
        let updatedpost;
        if (like) {
            updatedpost = await Post.findByIdAndUpdate(
                req.params.id,
                {
                    $pull: { likes: like._id }
                },
                { new: true }
            ).populate('user likes');
            await Like.findByIdAndDelete(like._id);
        }
        else {
            const like = new Like({
                user: req.body.user,
                post: req.params.id
            })
            const l = await like.save();
            post.likes.push(l._id);
            updatedpost = await post.save();
        }
        res.status(200).json(updatedpost)
    }catch (err) {
        res.status(500).json({error:err});
    }
}
module.exports.getLike = async function (req, res, next) {
    try {
        const like = await Like.findById(req.params.id)
        res.status(200).json(like);
    } catch (err) {
        res.status(500).json({ error: err });
    }
}
module.exports.getLikers = async function (req, res, next) {
    try {
        const like = await Like.findById(req.params.id).populate({ path: "user", select: "firstName lastName image depa title departement linkedin github"});
        res.status(200).json(like);
    } catch (err) {
        res.status(500).json({ error: err });
    }
}