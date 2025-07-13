require('dotenv').config(); 
const bcrypt=require('bcrypt');
const User=require('./models/User');
const connectDB=require('./config/db');

connectDB();

const createAdmin =async ()=>{
    try {
        const hashedPassword=await bcrypt.hash('123' ,10);

        const adminUser=new User({
            username:'admin123',
            email:'admin@123gmail.com',
            password:hashedPassword,
            role:'admin'
        });
        await adminUser.save();
        console.log('✅ Admin user created successfully!');

    } catch (err) {
         console.error('❌ Error creating admin:', err.message);
    }finally {
    process.exit(); // Disconnect after done
  }
}

createAdmin();