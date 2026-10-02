const { ObjectId } = require("mongodb");
const User = require("../models/user");
const Comment = require("../models/comment");
const Post = require("../models/post")

module.exports.getPostComments =async function  (req, res, next) {
    try {
        const comments = await Comment.find({post:req.params.id}).populate('user post');
        res.status(200).json(comments);

    }catch (err) {
        console.error(err);
        res.status(500).json({error:err});
    }
}
module.exports.getCommentById = async function (req,res,next){
    const ID = req.params.id;
    if (!ObjectId.isValid(ID)) {
        return res.status(404).json("ID is not valid");
    }
    try {
        const comment = await Comment.findById(ID).populate('user');
        res.status(200).json(comment);
    }catch (err) {
        res.status(500).json({error:err});
    }
}
module.exports.deletComment = async function (req,res,next){
    const ID = req.params.id;
    if (!ObjectId.isValid(ID)) {
        return res.status(404).json("ID is not valid");
    }
    try {
        const post = await Post.findByIdAndUpdate(
          ID,
          {
            $pull: { comments: req.params.comment_id },
          },
          { new: true }
        );
        await Comment.findByIdAndDelete(req.params.comment_id);
       res.status(200).json(post);  
    } catch (err) {
        res.status(500).json({ error: err });
    }
}
module.exports.updateComment = async function (req,res,next){
    const ID = req.params.comment_id;
    if (!ObjectId.isValid(ID)) {
        return res.status(404).json("ID is not valid");
    }
    try {        
        const comment = await Comment.findByIdAndUpdate(
            ID, 
            {
                text:req.body.text,
            }
        )
        const newComment = await Comment.findById(ID).populate('user post')
        return res.status(200).json(newComment)

    } catch (err) {
        res.status(500).json({ error: err });
    }
}
module.exports.addComment = async function (req,res,next){ 
    try {
        const post= await Post.findById(req.params.id).populate('user comments')
        const comment=new Comment({
                text: req.body.text,
                user: req.body.user,          
                post: req.body.post     
            })
            const c = await comment.save();
            post.comments.push(c._id);
            const updated = await post.save();
            res.status(201).json(updated);
    }
    catch (error) {
        return res.status(500).json(error);
    }
}


