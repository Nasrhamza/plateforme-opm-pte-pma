const jwt = require("jsonwebtoken");
const User = require("../models/user");

const authMiddleware = async(req, res, next) => {
    let token;
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        try {
            token = req.headers.authorization.split(" ")[1];
            const decoded = jwt.verify(token, "secret_this_should_be_longer");

            currentUser = await User.findById(decoded.id);
            res.currentUser = currentUser._id.toString();
            next();
        } catch (error) {
            return res.status(401).send({ message : "You are not authorized to perform this action" });
        }
    }

    if (!token) {
        return res.status(401).send({ message : "You have to be authenticated to perform this action" });
    }
};

module.exports = { authMiddleware };