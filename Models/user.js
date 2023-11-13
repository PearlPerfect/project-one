const mongoose = require('mongoose')
const schema = mongoose.Schema

const userSchema = new schema({
    fullname:{
        type: String,   
        required: true
    },
    username:{
        type: String,   
        required: true
    },
    email:{
        type: String,
        required: true,
        unique: true
    },
    profile:{
        type: String,
        required: true,
    },
    password:{
        type: String,
        required: true
    },
    role:{
        type :String,
        required: true  
    },
}, {timestamps:true});



const postSchema = new schema({
    user:{
        type: schema.Types.ObjectId, ref: "User"
    },
    title:{
        type: String,   
        required: true
    },
    body:{
        type: String,   
        required: true
    }
}, {timestamps:true});

const commentSchema = new schema({
    user:{
        type: schema.Types.ObjectId, ref: "User"
    },
    post:{
        type: schema.Types.ObjectId, ref: "Post"
    },
    comment:{
        type: String,   
        required: true
    }
}, {timestamps:true})

const User = mongoose.model("User", userSchema);
const Post = mongoose.model("Post", postSchema);
const Comment = mongoose.model("Comment", commentSchema);

module.exports = {User, Post, Comment}