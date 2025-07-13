const mongoose=require('mongoose');

const testResultSchema=new mongoose.Schema(
    {
        userId: {type: mongoose.Schema.Types.ObjectId,ref:"User",
            required:true
        },
        score:{type:Number,required:true},
        total:{type:Number,required:true},
        answer: [
            {
                questionId:{type: mongoose.Schema.Types.ObjectId,
                    ref:"Question"
                },
                selected: String,
                corrected:String
            }
        ],

        testDate:{type:Date,default:Date.now}
    });

module.exports=mongoose.model("TestResult",testResultSchema);