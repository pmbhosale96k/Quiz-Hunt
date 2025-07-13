const mongoose=require('mongoose');
const bcrypt=require('bcrypt');

const userSchema=new mongoose.Schema({
    username:{ type: String, required: true, unique: true },
    email:{type:String,required:true,unique:true},
    password:{ type: String, required: true },
    role: {type:String ,enum:['user', 'admin'] ,default:'user'}  
})

    // Step 1: Hash password before saving the user
userSchema.pre('save' , async function (next) {
     // Check if password was changed or newly added
    if(!this.isModified('password')){
        return next();
    }

    try {
        const salt=await bcrypt.genSalt(10)  //generate salt
        this.password=await bcrypt.hash(this.password,salt);
        next();
    } catch (error) {
        next(error) 
    }
})

// userSchema.method.comparePassword=async (enterPass)=>{
//     return await bcrypt.compare(enterPass,this.password);
// };

const User=mongoose.model('User',userSchema)
module.exports=User;