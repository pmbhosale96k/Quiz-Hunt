const mongoose = require('mongoose');

const connectDB =async ()=>{
    try{
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Db is connect');
    }
    catch(err){
        console.error("Error is  --->" + err);
        process.exit(1);
    }
};

module.exports = connectDB;