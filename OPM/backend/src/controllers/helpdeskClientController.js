const { SERVER_URL } = require('../config/config');
const HelpdeskClient = require('../models/helpdeskClient');
const File = require('../models/fileModel');


exports.createUser = async (req, res) => {
    try {
        const { email, firstName, lastName, phoneNumber, location, company } = req.body;

        const client = await HelpdeskClient.findOne({ email });
        if (client) {
            return res.status(400).json({ message: 'Email is already registered' });
        }
        const files = req.file;
        const newFile = new File({
            fileName: files.filename,
            path: `${SERVER_URL}${files.destination}/${files.filename}`,
            title: files.originalname.toString(),
        });

        await newFile.save();
        const userImage = newFile._id.toString();

        const user = new HelpdeskClient({
            email,
            firstName,
            lastName,
            location,
            company,
            phoneNumber,
            valid: true,
            image: userImage
        });

        await user.save();

        res.status(201).json({ message: 'User created successfully', user });
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Error creating user', error });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const { email, firstName, lastName, phoneNumber, location, company } = req.body;
        const user = await HelpdeskClient.findById(req.params.id).populate('image');
        const image = req.file;

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (firstName) user.firstName = firstName;
        if (lastName) user.lastName = lastName;
        if (company) user.company = company;
        if (location) user.location = location;
        if (email) user.email = email;
        if (phoneNumber) user.phoneNumber = phoneNumber;
        // Update profile picture if a new one is uploaded
        if (image) {
            // Create a new file for the uploaded image
            const newFile = new File({
                fileName: image.filename,
                path: `${SERVER_URL}uploads/${image.filename}`,
                title: image.originalname
            });
            await newFile.save();
            user.image = newFile._id;
        }
        await user.save();

        // Fetch the updated technician with populated image
        const payload = await HelpdeskClient.findById(req.params.id).populate('image');
        res.status(200).json({ message: 'Account updated successfully', data: payload });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error updating User', error });
    }
};

exports.getListHelpdeskUser = async (req, res) => {
    try {
        const helpdeskClients = await HelpdeskClient.find({ authority: 'helpdeskUser' }).populate('image');

        res.status(200).json({ message: 'Succeffully', rows: helpdeskClients });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching helpdeskUser', error });
    }
};