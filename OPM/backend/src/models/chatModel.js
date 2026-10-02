const mongoose = require('mongoose');
const User = require('./userModel');

const chatSchema = new mongoose.Schema({
    messages: [{ type: mongoose.Types.ObjectId, ref : 'ChatMessage' }],
    

});

const Chat = mongoose.model('Chat', chatSchema);

const chatMessageSchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref : 'User', required: true },
    message: {type : String},
    listOfFiles: [{ type: mongoose.Schema.Types.ObjectId, ref:'File' }],  
},
{
    timestamps : true
});

const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);

module.exports = {ChatMessage, Chat};




