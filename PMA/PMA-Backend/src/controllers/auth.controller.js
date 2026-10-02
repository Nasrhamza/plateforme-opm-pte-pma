const bcrypt = require("bcrypt");
const User = require("../models/user");
const ForgetPassword = require("../models/forgotPassword");
const jsonwebtoken = require("jsonwebtoken");
const { validateEmail } = require("../config/helpers");
const { NODE_ENV } = require("../config/config")

module.exports.login = async function(req, res, next) {
    try {
        if(!req.body.email || !req.body.password) throw Error("Invalid email/password");
        if(!validateEmail(req.body.email)) throw Error("Invalid email, please enter a valid email");
        
        let fetchedUser = await User.findOne({ email: req.body.email });
        
        if (!fetchedUser) {
            throw Error("User with this email not found");
        }

        if (!fetchedUser.isEnabled) {
            throw Error("Unauthorised login. your account is not activated yet");
        }
        var result = await bcrypt.compare(req.body.password, fetchedUser.password);
        if (!result) {
            throw Error("Wrong email or password")
        }
        const token = jsonwebtoken.sign({
                email: fetchedUser.email,
                id: fetchedUser._id,
            },
            "secret_this_should_be_longer", { expiresIn: "24h" }
        );
        return res.status(200).send({
            message : 'Authenticated Successfully',
            data : {
                token: token,
                expiresIn: "24h",
                fullName: fetchedUser.fullName,
                image: fetchedUser.image,
                id: fetchedUser._id,
                email: fetchedUser.email,
                roles: fetchedUser.roles,
                department: fetchedUser.department,
            }
        });
    } catch (error) {
        next(error)
    }   
}

module.exports.signUp = async function(req, res, next) {
    try {
        const body = req.body;
        if (req.file && req.file.filename  ) {
            body.image = req.file.filename;
        }
        if(!body.fullName || !body.email|| !body.password || !body.confirmPassword) throw Error("Invalid/missing details");
        if(body.password !== body.confirmPassword) throw Error("Please confirm your password");
        const existEmail = await User.findOne({ email : body.email });
        if(existEmail){
            throw Error("This email is already in use")
        }
        hashedPassword = await bcrypt.hash(body.password, 10);
        body.password = hashedPassword;

        const user = await User.create(body);

        return res.status(200).send({message: "Signup request sent succefully , waiting for admin confirmation"});
    } catch (error) {
        next(error)
    }
};
module.exports.forgotPassword = async function (req, res, next) {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
        throw new Error("User with this email doesn't exist");
        }

        await ForgetPassword.deleteMany({ email: req.body.email });
        
        const code = Math.floor(Math.random() * 111111);
        
        const expiration = Date.now() + 60000;

        let forgetPassword = new ForgetPassword({
            email: req.body.email,
            code: code,
            expiration
        });
        if(NODE_ENV == 'production'){
            sendEmailWithTemplate(user.email, 'Reset password', 'reset_code', { name : `${user.firstName} ${user.lastName}`, code, expiration : Utils.getExpirationDate(expiration) });
        }else{
            console.log("----- reset code = ", forgetPassword.code);
        }
            
        const saved = await forgetPassword.save();
        return res.status(200).send({ message : "A Verification code was sent to your email address", data : { email : user.email, expiration, code } });
    } catch (error) {
        next(error)
    }
}
module.exports.resetPassword = async function (req, res,next) {
    try {
        const { code, newPassword, confirmNewPassword } = req.body;
        const exist_forget = await ForgetPassword.findOne({ code });
        if(!exist_forget){
        throw new Error("Invalid/Missing code, you're not authorized to perform this action, please try again")
        }

        if(newPassword.trim() !== confirmNewPassword.trim()){
        throw Error("New Password missMatch, please try again");
    }
        const hashed_pwd = await bcrypt.hash(newPassword, 10);
    
        const exist_user = await User.findOne({ email: exist_forget.email });

        exist_user.password = hashed_pwd;

        const u = await exist_user.save();
        await ForgetPassword.deleteMany({ email : u.email });
        if(NODE_ENV == 'production'){
            sendEmailWithTemplate(u.email, 'Reset password', 'reset_password_success', { name : `${u.firstName} ${u.lastName}`, date : getExpirationDate(Date.now()) });
        }

        return res.status(200).send({message : "Password reset successfully"});
    } catch (error) {
        next(error);
    }
};

module.exports.validateCode = async function (req, res, next) {
    try {
        let forgetPassword = await ForgetPassword.findOne({
        code: req.body.code,
        });
        if(!forgetPassword){
        throw new Error("Invalid/Missing code, please try again");
        }
        
        if(Date.now() > forgetPassword.expiration){
        throw new Error("The code you provided is expired, please try again");
        }

        return res.status(200).send({ message: "Code verification is completed", data : { code : forgetPassword.code } });
    } catch (error) {
        next(error);
    }
};
