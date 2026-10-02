const { ObjectId } = require("mongodb");
const Post = require("../models/post");
const Comment = require("../models/comment");
const Like = require("../models/like");
const User = require("../models/user");


module.exports.getAllApprovedPosts = async function (req, res, next) {
    try {
        const posts = await Post.find({
            isAccepted: true,
            status: "Approved",
        }).populate('user comments likes');
        res.status(200).json(posts);

    } catch (err) {
        res.status(500).json({ error: err });
    }
}
module.exports.getAllPosts = async function (req, res, next) {
    try {
        const posts = await Post.find({}).populate('user comments likes');
        res.status(200).json(posts);

    } catch (err) {
        res.status(500).json({ error: err });
    }
}
module.exports.getApprovedPosts = async function (req, res, next) {
    const userID = req.params.id
    try {
        const posts = await Post.find({
            status: "Approved",
            user: userID
        }).populate('user comments likes');
        res.status(200).json(posts);

    } catch (err) {
        res.status(500).json({ error: err });
    }
}
module.exports.getDeclinededPosts = async function (req, res, next) {
    const userID = req.params.id
    try {
        const posts = await Post.find({
            status: "Declined",
            user: userID
        }).populate('user comments likes');
        res.status(200).json(posts);

    } catch (err) {
        res.status(500).json({ error: err });
    }
}
module.exports.getPendingPosts = async function (req, res, next) {
    const userID = req.params.id
    try {
        const posts = await Post.find({
            status: "Pending",
            user: userID
        }).populate('user comments likes');
        res.status(200).json(posts);

    } catch (err) {
        res.status(500).json({ error: err });
    }
}
module.exports.getPostById = async function (req, res, next) {
    const ID = req.params.id;
    if (!ObjectId.isValid(ID)) {
        return res.status(404).json("ID is not valid");
    }
    try {
        const post = await Post.findById(ID).populate('user comments likes');
        res.status(200).json(post);
    } catch (err) {
        res.status(500).json({ error: err });
    }
}
module.exports.deletPost = async function (req, res, next) {
    const ID = req.params.id;
    if (!ObjectId.isValid(ID)) {
        return res.status(404).json("ID is not valid");
    }
    try {
        const post = await Post.findByIdAndDelete({ _id: ID })
        await Comment.deleteMany({post : ID})
        await Like.deleteMany({post : ID})
        return res.status(200).json(post)

    } catch (err) {
        res.status(500).json({ error: err });
    }
}
module.exports.updatePost = async function (req, res, next) {
    const ID = req.params.id;
    if (!ObjectId.isValid(ID)) {
        return res.status(404).json("ID is not valid");
    }
    let post;
    try {
        const images = req.files.map(file => {
            return req.protocol + "://" + req.get("host") + "/postImages/" + file.filename;
        })
        post = await Post.findByIdAndUpdate(
            ID,
            {
                description: req.body.description,
                images: images,
            }
        ).populate('user comments likes')
        return res.status(200).json(post)

    } catch (err) {
        res.status(500).json({ error: err });
    }
}
module.exports.addPost = async function (req, res, next) {
    let post;
    try {
        //const images = req.files;
        const images = req.files.map(file => {
            return file.filename;
        })
            if (Array.isArray(images) && images.length > 0) {
                post = new Post({
                    description: req.body.description,
                    images: images,
                    user: req.body.user,
                })
                if (res.locals.user.roles.includes("ADMIN")) {
                    post = new Post({
                        description: req.body.description,
                        images: images,
                        status : 'Approved',
                        isAccepted: true,
                        user: req.body.user,
                    })
                }
                const p = await post.save();
                res.status(201).json(p);
            } else {
                post = new Post({
                    description: req.body.description,
                    user: req.body.user,
                })
                if (res.locals.user.roles.includes("ADMIN")) {
                    post = new Post({
                        description: req.body.description,
                        status : 'Approved',
                        isAccepted: true,
                        user: req.body.user,
                    })
                }
                const p = await post.save();
                res.status(201).json(p);
            }
        
        }
    catch (error) {
        return res.status(500).json(error);
    }
}
module.exports.getUserPosts = async function (req, res, next) {
    const userId = req.params.id
    if (!ObjectId.isValid(userId)) {
        return res.status(400).json("Invalid User ID")
    }
    try {
        const userPosts = await Post.find({
            user: userId
        }).populate('user likes comments')
        return res.status(200).json(userPosts);
    } catch (err) {
        res.status(500).json(err.message);
    }
}
module.exports.managerAccept = async function (req, res, next) {
    const ID = req.params.id
    if (!ObjectId.isValid(ID)) {
        return res.status(404).json("Invalid Leave ID")
    }
    try {
        const post = await Post.findByIdAndUpdate(
            ID,
            {
                isAccepted: true,
                status: "Approved"
            },
        )
        res.status(200).json(post);

    } catch (err) {
        res.status(500).json(err.message);
    }
}
module.exports.managerDecline = async function (req, res, next) {
    const ID = req.params.id
    if (!ObjectId.isValid(ID)) {
        return res.status(404).json("Invalid Leave ID")
    }
    try {
        const post = await Post.findByIdAndUpdate(
            ID,
            {
                status: "Declined"
            },
        )
        res.status(200).json(post);

    } catch (err) {
        res.status(500).json(err.message);
    }
}
module.exports.savePost = async function (req, res, next) {
    const postID = req.params.id
    try {
        const post = await Post.findById(postID)
        const savings = post.userSaved
        let user;
        for (let i = 0; i <= savings.length; i++) {
            if (savings[i] == req.body.user) {
                user = savings[i]
            }
        }
        let updatedpost;
        if (user) {
            updatedpost = await Post.findByIdAndUpdate(
                postID,
                {
                    $pull: { userSaved: req.body.user }
                })
            res.status(200).json("Post unsaved")
        }
        else {
            updatedpost = await Post.findByIdAndUpdate(
                postID,
                {
                    $push: { userSaved: req.body.user }
                })
            res.status(200).json("Post saved")
        }
    }
    catch (error) {
        return res.status(500).json(error);
    }
}
module.exports.userSavedPosts = async function (req, res, next) {
    const userID = req.params.id
    const posts = await Post.find().populate("user likes comments")
    let postsMatch = []
    try {
        for (let i = 0; i < posts.length; i++) {
            posts[i].userSaved.forEach(element => {
                if (element == userID) {
                    postsMatch.push(posts[i])
                }
            });                
        }
        res.status(200).json(postsMatch)
    }
    catch (error) {
        return res.status(500).json(error);
    }
}
module.exports.getAll = async function (req, res, next) {
    try {
        const posts = await Post.find({
            isAccepted: false,
            status: "Pending",
        }).populate('user comments likes');
        res.status(200).json(posts);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err });
    }
}
module.exports.getPostInteractionCount = async function (req, res, next) {
    const ID = req.params.id;
    if (!ObjectId.isValid(ID)) {
        return res.status(404).json("ID is not valid");
    }
    try {
        const postsInteractionCount = await Post.findById(ID).populate('comments likes');
        const likesCount = postsInteractionCount.likes.length;
        const commentsCount = postsInteractionCount.comments.length;
        res.status(200).json({likesCount,commentsCount});

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err });
    }
}
module.exports.getAllStat = async function (req, res, next) {
    try {
        const posts = await Post.find({}).populate('user comments likes');
        res.status(200).json(posts);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err });
    }
}
// module.exports.getPostLikers = async function (req, res) {
//     const ID = req.params.id;
//     if (!ObjectId.isValid(ID)) {
//         return res.status(404).json("ID is not valid");
//     }
//     try {
//         const post = await Post.findById(ID).populate('user comments likes');
//         res.status(200).json(post.likes);
//     } catch (err) {
//         res.status(500).json({ error: err });
//     }
// }
