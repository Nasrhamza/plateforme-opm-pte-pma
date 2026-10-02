const checkTeamLeaderMiddleware = async(req, res, next) => {
    try {
        const user = res.locals.user;
        if (user.roles.includes("Team Leader")) {
            next();
        } else {
            return res.status(401).send({ message : "You are not authorized to perform this action" });
        }
    } catch (error) {
        return res.status(401).send({ message : "You are not authorized to perform this action" });
    }
}


module.exports = { checkTeamLeaderMiddleware };