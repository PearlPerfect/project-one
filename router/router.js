const express = require('express');
const {validationResult, checkSchema, matchedData } = require("express-validator");
const bcrypt = require('bcrypt');
const session = require('express-session');
const mongodbSession = require('connect-mongodb-session')(session);
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
const Router = express.Router();
const {User, Post, Comment} = require('../Models/user');
const multer = require("multer");

var storage = multer.diskStorage({
    destination: function(req, file, cb){
       cb(null, "./Pictures")
    },
    filename: function(req, file, cb){
        cb(null, file.fieldname+Date.now()+file.originalname)
    },
});

var upload = multer({
    storage:storage,
}).single('profile')



const mongodbURL= "mongodb+srv://perfectpearl2030:FutureHQ@futurehq.rn8lgci.mongodb.net/";

mongoose.connect(mongodbURL, {})
.then(() => {
    console.log('Database Is up and connected successfully')
}).catch(() => {
    console.log('connection fail')
});
const Store = new mongodbSession({
    uri: mongodbURL,
    collection: 'allSessions'
});

Router.use(cookieParser("cookieParserSecrets"))
Router.use(session({
    secret: 'authentication',
    saveUninitialized: false,
    resave: false,
    store: Store
}));
Router.use(flash())
Router.use((req, res, next) => {
    res.locals.message = req.flash();
    next()
})
const isAuthorized = (req, res, next) => {
    if (req.session.isAuth) {
        res.redirect("/dashboard")
        next()
    }

    else {
        res.redirect("/login")
    }
}

const schema = {
    fullname:{
        notEmpty: true,
        trim: true, 
        isAlpha: {
             options: ['en-US', { ignore: [" "] }], 
             errorMessage: '**Number Input Not Needed**' }
         
    },
    username:{
        notEmpty: true,
        trim: true,
        isAlpha: {   options: ['en-US', { ignore: ["_ -"] }], 
             errorMessage: '**Number Input Not Needed**'
        },
        
         
    },
    email: {
        trim: true,
        isEmail: true,
        errorMessage: '**Enter A Valid Email**'
    },
    password: {
        notEmpty: true,
        trim: true, 
        isStrongPassword: { 
            errorMessage: '**Must contain Upper and lowercases with Number and Special Character**' } },
}
Router.get('', isAuthorized, (req, res)=>{
    res.render("index", {title: "Home"})
}),


Router.get('/signup', (req, res)=>{
    const data = " ";
    let err = " "
    res.render("signup", {title:"sign up", err, data});
}),


//post request for signup route
Router.post("/signup",  upload,[checkSchema(schema)], async function(req, res){
     const result = validationResult(req);
          const Error = result.errors
        let err = {};
        Error.forEach(item => {
            err[item.path] = item.msg
        });
            const data = req.body;
        // console.log(data)
        const x = matchedData(req);
        //  console.log(result.isEmpty(), x);

         if(!result.isEmpty()) {
             res.render("signup", { title: "Signup", err, data });
        }
        else{
        try{
            const { firstname, username, email, password, roles } = req.body
            let user = await User.findOne({email });
            if (user) {
                req.flash('error', 'E-mail already in use')
                return res.redirect('/signup');
            }
            else{
            const hashedpassword = await bcrypt.hash(req.body.password, 16);
           user = new User({
                            fullname: req.body.fullname,
                            username: req.body.username,
                            email: req.body.email,
                            password: hashedpassword,
                            role: req.body.roles,
                            profile: req.file.filename,
                        });
                    }
                    await user.save()
                .then(result =>{
                    // console.log(result)
                })
                .catch(err=>{
                    console.log(err)
                })
                req.session.user ={
                    user: user
                
                }
                
                return res.redirect('/login');
    
                        // console.log(req.session)
                        } 
        catch(err){
            res.redirect('/signup')
        }
    }
   })
Router.get('/login', (req, res)=>{
    let err = " "
    res.render("login", {title:"Login", err });
})

Router.post('/login', async function(req, res){
    const { username, email, password } = req.body
    // console.log(req.body)
    let user = await User.findOne({ email });
    if (!user) {
        req.flash('error', 'Invalid Email, Use a registered email or click on register to signup')
        return res.redirect('/login');
    }
    const data = req.body;
    // console.log(data)
    const samePassword = await bcrypt.compare(password, user.password);
    if (!samePassword ){
        req.flash('error', 'Invalid Password')
        return res.redirect('/login')
    }
    else {
        req.session.user ={
            user: user
        }
        req.session.isAuth = true
        // console.log(req.session)
        req.flash('success', 'Successfully signed in')
        res.redirect("/dashboard")
    }
})

Router.get('/dashboard', (req, res)=>{
    // const session = req.session;
    // console.log(session)
    Post.find().populate('user')
    // .populate([{ path: 'user', select: ['fullname'] } ])
    .then((result)=>{
    //    console.log(result);
        res.render('dashboard',{title: "Dashboard", posts: result, session})
    })
})

Router.get("/create", (req, res)=>{
    res.render("addpost", {title: "Add Post"});  // render the create post page
});

Router.post("/create", (req, res)=>{
    
    // const { title, body } = req.body
// const session = req.session.user;
// console.log(session)
const userId = session.user._id

console.log(userId)

    const newPost = new Post({
        user: userId,
        title: req.body.title,
        body: req.body.body,
    });

    newPost.save()
    .then((result)=> {
        // console.log(result)
        // res.redirect("/dashboard");
        res.json({text:"post created"});

    })
    .catch((err) => {
        // console.log(err)
        res.json({})
    })  
})

//single post
Router.get("/:id", (req,res)=>{
    const Id = req.params.id;
 
    Post.findById(Id).populate('user')
    .then(result =>{
      Comment.find({post:result.id}).populate('user')
      .then(comments =>{
        // console.log(comments)
        res.render('eachpage', {title: 'Posts', posts: result, comments})
      }).catch(err=>{
        console.log(err)
      })
        
    })
    .catch(err =>{
        console.log(err)
        res.render('error', {title:"error", err})
    })
})

//comment

Router.get('/comment/:id', (req, res)=>{
    const Id = req.params.id;
 
  res.render('comment', {title: 'Add comment', post: Id})
}),

Router.post('/comment/:id', (req, res)=>{
    const Id = req.params.id;
    // console.log(Id)
    const { user,post, body } = req.body
    const session = req.session.user;
    // console.log(session)
    const userId = session.user._id

    const newComment = new Comment({
        user: userId,
        post: Id,
        comment: req.body.body,
    });

    newComment.save()
    .then((result)=> {
        console.log(result)
        res.redirect("/dashboard");
    })
    .catch((err) => {
        console.log(err)
    })  

}),


//edit

Router.get("/edit/:id", function(req, res){
    Id = req.params.id
   Post.findByIdAndUpdate(Id)
       .then((result)=>{
        console.log(result)
           res.render('Edit',{post: result , title:"Update"})
        
        })
        .catch((error)=>console.log(error))
    
    
})

Router.post("/edit/:id", function(req, res){
    const Id=  req.params.id ;
        console.log(Id)

        Post.findByIdAndUpdate(Id,{...req.body},{new:true})
        .then((result)=>{
            console.log(result)
            // res.render('eachpage', {title: "updated", posts:result })
            res.redirect(`/${Id}`)
        })
        .catch((error)=>console.log(error))   
})


//delete
Router.post("/delete/:id", (req, res)=>{
    const Id = req.params.id;
    Post.findByIdAndDelete(Id)
    .then((result)=>{
    }).catch((err) =>{
        console.log(err)
    }).finally(()=>{
        res.redirect("/")
    })

});


//logout

Router.post("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.log(err)
        }

        else {
            res.redirect("/");
        }
    })

})
 
module.exports = Router