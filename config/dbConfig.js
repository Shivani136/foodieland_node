const mongooes = require("mongoose");
const URL =
    "mongodb+srv://dbUser:foodielandPwd@frecluster.zu9n7.mongodb.net/foodieland?retryWrites=true&w=majority";
const db = async () => {
    await mongooes.connect(URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

    console.log("db connect");

};

module.exports = db;