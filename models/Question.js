const mongoose=require('mongoose');

const questionSchema=new mongoose.Schema(
    {
        question:{type:String},
        option:[String],
        correctAnswer:String,
        type: String, //"MCQ"
        difficulty: String,
        tags:[String],
    });

module.exports=mongoose.model("Question" ,questionSchema);