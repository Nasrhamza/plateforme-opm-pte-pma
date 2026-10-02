const { sendEmailWithTemplate } = require("../config/mailer_config");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const { findUsers } = require("../../src/helpers/users.helpers")
// --------------------------------- new methods ------------------------

module.exports.updatePassword1 = async function(req, res, next) {
    const { newPassword, confirmPassword, oldPassword } = req.body;
    
    try {
        if(!oldPassword) throw Error("Old password is required");
        if(!newPassword) throw Error("New password is required");
        if(!confirmPassword) throw Error("Confirm password is required");
        if(confirmPassword !== newPassword) {
            throw Error("Please verify your new password : password missmatch error")
        }
        const user = await User.findById(req.params.id);

        if(!user) throw new Error("User with this id not found");
        
        const isPasswordCorrect = await bcrypt.compare(oldPassword, user.password);
        
        if(!isPasswordCorrect){
            throw Error("Password missmatch, try again");
        }
        const updatedpassword = await bcrypt.hash(newPassword, 10);
        
        await User.findOneAndUpdate({ _id: user._id }, { $set: { password : updatedpassword } });

        return res.status(200).send({message : "Password updated successfully"});
    } catch (error) {
        next(error)
    }
};

module.exports.createUser = async function(req, res, next) {
    try {
        const body = req.body;
        if (req.file && req.file.filename  ) {
            body.image = req.file.filename;
        }
        if(!body.email){
            throw Error("Email is required");
        }
        if(!body.password){
            throw Error("Password is required");
        }
        if(!body.fullName){
            throw Error("Name is required");
        }
        if(body.password !== body.confirmPassword){
            throw Error("Confirm password doesnt match");
        }
        const existEmail = await User.findOne({ email : body.email });
        if(existEmail){
            throw Error("This email is already in use")
        }
        hashedPassword = await bcrypt.hash(body.password, 10);
        body.password = hashedPassword;

        const user = await User.create({...body, isEnabled : true});
        const { users } = await findUsers({ id : user._id });

        return res.status(200).send({message: "User account created successfully", data : users});
    } catch (error) {
        next(error)
    }
};

module.exports.updateUserDetails = async function(req, res, next) {
    try {
        const obj = req.body;
        if(req.file && req.file.filename){
            obj.image = req.file.filename
        }
        if(!obj.password){
            delete obj.password;
            delete obj.confirmPassword;
        }else{
            const hashedPassword = await bcrypt.hash(obj.password, 10);
            obj.password = hashedPassword;
        }


        const existUser = await User.findById(req.params.id);
        if(!existUser){
            throw Error("User not found");
        }
        const a = await User.findByIdAndUpdate(req.params.id, { $set : obj }, { new : true });
        const { users } = await findUsers({ id : a._id }, false);
        return res.status(200).send({ message : 'User updated successfully', data : users });
    } catch (error) {
        next(Error("Error while updating user details"))
    }
}
module.exports.updateUserAvatar = async function(req, res, next) {
    try {
        if(!req.file && !req.file.filename){
            throw Error("Invalid image");
        }

        await User.findByIdAndUpdate(req.params.id, { $set : { image : req.file.filename } });
        return res.status(200).send({ message : 'User avatar updated successfully', data : req.file.filename });
    } catch (error) {
        next(Error("Error while updating user avatar"))
    }
}

module.exports.updateProfile = async function(req, res, next) {
    try {
        const a = await User.findByIdAndUpdate(req.params.id, { $set : req.body }, { new : true });
        const { users } = await findUsers({ id : a._id }, false);
        return res.status(200).send({ message : 'User profile updated successfully', data : users });
    } catch (error) {
        next(Error("Error while updating user details"))
    }
}

module.exports.findById = async function(req, res, next) {
    try {
        const { users } = await findUsers({ id : req.params.id }, false);
        if(!users) throw Error("Cannot find user with this id");
        return res.status(200).send({ message : 'User retrieved successfully', data : users });
    } catch (error) {
        next(error)
    }
}

module.exports.enableUser = async function(req, res, next) {
    try {
        const user = await User.findById(req.params.id);
        user.isEnabled = !user.isEnabled;
        await user.save();
        sendEmailWithTemplate(user.email, "Account activation", 'enable_account', { name : user.fullName });
        const { users } = await findUsers({ id : user._id.toString() }, false);
        return res.status(200).send({ message : 'User activated successfully', data : users });
    } catch (error) {
        next(error)
    }
}

module.exports.changeRole = async function(req, res, next) {
    try {
        if (!req.body.role || !['Client', 'Engineer', 'Team Leader', 'Admin'].includes(req.body.role)){
            throw Error("Invalid role");
        }
        const user = await User.findById(req.params.id);
        if(!user) throw Error("User not found");
        user.roles = [req.body.role];
        await user.save();
        const { users } = await findUsers({ id : user._id.toString() }, false);
        return res.status(200).send({ message : 'User role changed successfully', data : users });
    } catch (error) {
        next(error)
    }
}

module.exports.findAll = async function(req, res, next) {
    try {
        const { users, total } = await findUsers(req.query, true);
        return res.status(200).send({ message : 'Users retrieved successfully', data : {users, total} });
    } catch (error) {
        next(error)
        // next(Error("Error while getting users"))
    }
}

module.exports.getUsersOverview = async function(req, res, next) {
    try {
        const clients = await findUsers({ roles : 'Client' }, true);
        const leaders = await findUsers({ roles : 'Team Leader' }, true);
        const engineers = await findUsers({ roles : 'Engineer' }, true);
        return res.status(200).send({ message : 'Users overview retrieved successfully', data : {
            engineers : engineers.total,
            clients : clients.total,
            leaders : leaders.total,
        } });
    } catch (error) {
        next(Error("Error while getting users overview"))
    }
}