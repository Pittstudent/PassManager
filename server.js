const express = require('express'); // Import express
const bodyParser = require('body-parser');
const app = express();
const bcrypt = require("bcrypt");
const session = require("express-session");
const flash = require("express-flash");
const passport = require("passport");
const { exec } = require('child_process');

console.log("Live!")

const {pool} = require("./dbConfig");


const initializePassport = require("./passportConfig");
initializePassport(passport);

const port = process.env.PORT || 4000; // Default port

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
// app.use(express.static('public')); // Serve static files from the 'public' directory

app.use(session({
    secret: "secret",
    resave: false,
    saveUninitialized: false
}));


app.use(passport.initialize());
app.use(passport.session());


app.use(flash());


app.get('/', (req, res) => {
    res.render('index.ejs');
}); // Add closing parenthesis here

app.get("/users/create_account", checkAuthenticated, (req, res) => {
    res.render("create_account.ejs");});

app.get("/", checkAuthenticated, (req, res) => {
    res.render("login.ejs");});

app.get("/users/dashboard", checkNotAuthenticated, (req, res) => {
    res.render("dashboard.ejs", {user: req.user.name});});


app.get("/users/create_account", (req, res) => {
    res.render("create_account.ejs");});

app.get("/users/login", (req, res) => {
    res.render("login.ejs");});

app.get("/users/dashboard", (req, res) => {
    res.render("dashboard.ejs", {user: req.user.name});});

app.get("/users/logout", (req, res) => {
    req.logout(req.user, err => {
        if(err) return next(err);
        req.flash("success_msg", "You have been logged out");
        res.redirect("/");
    });
});


      
app.post('/users/create_account', async (req, res) => {
    
    let{name, email, password, password2} = req.body;


    console.log({
        name,email,password,password2
    });

    let errors = [];

    if(!name || !email || !password || !password2){
        errors.push({message: "Please enter all fields"});
    }
    if(password.length < 8){
        errors.push({message: "Password must be at least 8 characters long"});
    }
    if(password.length > 50){
        errors.push({message: "Password must be less than 50 characters long"});
    }
    if(password === password.toLowerCase()){
        errors.push({message: "Password must contain at least one uppercase letter"});
    }
    if(password === password.toUpperCase()){
        errors.push({message: "Password must contain at least one lowercase letter"});
    }
    if(!containsNumber(password)){
        errors.push({message: "Password must contain at least one number"});
    }
    if(!containsSpecialCharacter(password)){
        errors.push({message: "Password must contain at least one special character"});
    }
    if(password !== password2){
        errors.push({message: "Passwords do not match"});
    }

    if(errors.length > 0){
        res.render("create_account.ejs", {errors});
    }
    else{
        // Remove the duplicate declaration of 'salt'
        let salt = bcrypt.genSaltSync(10); //generate salt
        let hashedPassword = ''

        const child = exec(`python3 ./crypter.py ${password} ${salt}`, (error, stdout, stderr) => { //send pass to python to encrypt
            if (error) {
                console.error(`Error executing Python script: ${error}`);
                return;
            }
            console.log(`Python script output: ${stdout}`);
            hashedPassword = stdout;

            pool.query(
                `SELECT * FROM users 
                WHERE email = $1`, 
                [email], 
                (err, results) => {
                    if (err) {
                        console.log(err);
                        res.sendStatus(500);
                        return;
                    }
                    console.log(results.rows);
        
                    if(results.rows.length > 0){
                        errors.push({message: "Email already registered"});
                        res.render("create_account.ejs", {errors});
                    }
                    else{
                        pool.query(
                            `INSERT INTO users (name, email, password, salt)
                            VALUES ($1, $2, $3, $4)
                            RETURNING id, password, salt`, 
                            [name, email, hashedPassword, salt], 
                            (err, results) => {
                                if (err) {
                                    console.log(err);
                                    res.sendStatus(500);
                                    return;
                                }
                                console.log(results.rows);
                                req.flash("success_msg", "You are now registered. Please log in");
                                res.redirect("/");
                            }
                        );
                    }
                }
            );
        });
        
        // child.on('exit', (code) => {
        //     console.log(`Python script exited with code ${code}`);
        // });

        // let hashedPassword = await bcrypt.hash(password, 10); //hashing password //replace with python 
        // console.log("Salt: " + salt);
        // console.log(hashedPassword);
    }
});

app.post("/", passport.authenticate("local", { //authenticate user through our database 
    successRedirect: "/users/dashboard",
    failureRedirect: "/",
    failureFlash: true  //failure message
}));

function checkAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return res.redirect("/users/dashboard");
    }
    next();
}

function checkNotAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/");
}

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

function containsNumber(str) {
    return /\d/.test(str);
}

function containsSpecialCharacter(str) {
    // Regular expression to match any special character
    const specialCharRegex = /[!@#$%^&*()\-_=+[\]{};:'"\\|,.<>/?~]/;
    
    // Check if the string contains any special character
    return specialCharRegex.test(str);
}

