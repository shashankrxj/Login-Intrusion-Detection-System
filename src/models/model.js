const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "Username is required"],
        unique: true,
        trim: true,
        minlength: [3, "Username must be at least 3 characters long"],
        maxlength: [30, "Username cannot exceed 30 characters"],
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        trim: true,
        lowercase: true,
        validate: {
            validator: function (value) {
                return /^[\w-]+(?:\.[\w-]+)*@(?:[\w-]+\.)+[a-zA-Z]{2,7}$/.test(value);
            },
            message: "Please enter a valid email address",
        },
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: [6, "Password must be at least 6 characters long"],
        maxlength: [100, "Password cannot exceed 50 characters"],
    },
    failedAttempts: {
        type: Number,
        default: 0, // Track failed login attempts
    },
    lockUntil: {
        type: Date, // Track when the user can try to login again
        default: null,
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
}, { timestamps: true });

//generating tokens
userSchema.methods.generateAuthToken = async function(){
    try{
      const token = jwt.sign({_id:this._id.toString()}, process.env.SECRET_KEY);
      this.tokens = this.tokens.concat({token:token});
      await this.save();
      return token;
    }
    catch(error){
        res.send("the eroor part " + error);
        console.log("the error part" + error);

    }
}

userSchema.pre("save", async function(next){
    if(this.isModified("password")){
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
})

const User = mongoose.model("signup", userSchema);

module.exports = User;
