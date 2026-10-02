const mongoose = require("mongoose");
const config = require("./config");

mongoose.set("strictQuery", true);
module.exports = db_connect = () => {
    mongoose
        .connect(config.CONNECTION_STRING, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
        .then(() => {
            console.log("CONNECTED TO DB");
        })
        .catch((err) => console.log("error has been occured: ", err));
}
