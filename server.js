const express = require('express'); // Import express
const bodyParser = require('body-parser');
const app = express();
const bcrypt = require("bcrypt");
const session = require("express-session");
const flash = require("express-flash");
const passport = require("passport");
const { exec } = require('child_process');
const { spawn } = require('child_process');

const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // Set to true if using TLS
    auth: {
        user: 'rtgamwo@gmail.com',
        pass: 'pqda mezc iwer rrrq '
    }
});

console.log("Live!")

const {pool} = require("./dbConfig");


const initializePassport = require("./passportConfig");
const { type } = require('os');
initializePassport(passport);

const port = process.env.PORT || 4000; // Default port

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(express.static('public')); // Serve static files from the 'public' directory

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

app.get("/users/dashboardcopy", (req, res) => {
    pool.query("SELECT * FROM vault", (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).send("Error fetching items from database");
            return;
        }
        // console.log({vault_data: results.rows})
         var vault_data = [];
        

        for(let item of results.rows){
            let plain_pass = '';
            console.log({item: item.password})
            console.log("Pass length is: " + item.password.length)
            const args = ['decrypt', item.password, item.key, item.iv];

// Spawn the Python script process
        const pythonProcess = spawn('python3', ['./aescrypter.py', ...args]);

        // Handle stdout data
        pythonProcess.stdout.on('data', (data) => {
            console.log(`Python script output: ${data}`);
            // You can manipulate the output here as needed
        });

        // Handle stderr data
        pythonProcess.stderr.on('data', (data) => {
            console.error(`Error executing Python script: ${data}`);
        });

        // Handle process exit
        pythonProcess.on('close', (code) => {
            console.log(`Python script process exited with code ${code}`);
        });

            item = {...item, plain_password: plain_pass};
            vault_data.push(item);
        }   
        console.log({decrypt_vault_data: vault_data})
        res.render("dashboardcopy.ejs", { items: vault_data.map(item => ({...item,masked_password: '•'.repeat(item.password.length)}) ) });
    });
});


app.get("/:id/email2FA", (req, res) => {
    
    console.log("Email 2FA page")
    id = req.params.id;
    const sendOTPVerificationEmail = async (id, res) => {
        try {
            // Query email based on user ID
            const { rows } = await pool.query('SELECT email FROM users WHERE id = $1', [id]);
            const user_email = rows[0].email;
            console.log({user_email: user_email});
    
            // Generate OTP
            const otp = `${Math.floor(100000 + Math.random() * 900000)}`;
            req.session.otp = otp;
            req.session.email = user_email;
            // const saltRounds = 10;
            // const hashedOTP = await bcrypt.hash(otp, saltRounds);
    
            // Prepare mail options
            const mailOptions = {
                from: 'drickbeats@gmail.com',
                to: user_email,
                subject: 'OTP Verification',
                text: `Your OTP is: ${otp}`
            };
            
            // Send email
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error('Error sending email:', error);
                } else {
                    console.log('Email sent:', info.response);
                }
            });
            res.render("email2FA.ejs");
            
            // Send response
        } catch (error) {
            res.json({
                status: "FAILED",
                message: "Failed to send verification otp email",
                error: error.message
            });
        }
        
    }
    sendOTPVerificationEmail(id, res);
    });
    
    

app.post("/users/logout", (req, res) => {
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
        let salt = bcrypt.genSaltSync(20); //generate salt
        // if(salt.charAt(0) === '$'){
        //     salt = generateRandomLetter() + salt.slice(1);
        // }
        let hashedPassword = ''
        

        const child = exec(`python3 ./crypter.py 'register' ${password} ${salt} ''`, (error, stdout, stderr) => { //send pass to python to encrypt
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
                        console.log({register_user: {name:name, email:email, password:hashedPassword, salt:salt}})
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



app.post("/", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
        if (err) { return next(err); }
        if (!user) { 
            // Authentication failed, redirect to failureRedirect
            return res.redirect("/?loginFailed=true");
        }
        
        // Successful authentication, query vault table to find user ID by email
        pool.query('SELECT id FROM users WHERE email = $1', [req.body.email], (err, result) => {
            if (err) { 
                return next(err); 
            }
            
            if (result.rows.length === 0) {
                // User not found in vault table, handle accordingly
                return res.redirect("/?userNotFound=true");
            }
            
            // Found user in vault table, redirect to successRedirect with user ID
            res.redirect(`/${result.rows[0].id}/email2FA`);
        });
    })(req, res, next);
});

// function resendOTP(){
//     try {
//     const email = req.session.email;
//     const mailOptions = {
//         from: 'drickbeats@gmail.com',
//         to: user_email,
//         subject: 'OTP Verification',
//         text: `Your OTP is: ${otp}`
//     };
    
//     // Send email
//     transporter.sendMail(mailOptions, (error, info) => {
//         if (error) {
//             console.error('Error sending email:', error);
//         } else {
//             console.log('Email sent:', info.response);
//         }
//     });
//     res.render("email2FA.ejs");
    
//     // Send response
// } catch (error) {
//     res.json({
//         status: "FAILED",
//         message: "Failed to send verification otp email",
//         error: error.message
//     });
// }

// }


app.post('/users/dashboardcopy', async (req, res) => {
    let{account,username,pass} = req.body;
    console.log({
        account, username, pass
    });

    let errors = [];

    if(!account || !username || !pass){
        errors.push({message: "Please enter all fields"});
    }
    else{
        let hashed_pass = '';
        const child = exec(`python3 ./aescrypter.py 'encrypt' ${pass}''`, (error, stdout, stderr) => { //send pass to python to encrypt
            if (error) {
                console.error(`Error executing Python script: ${error}`);
                return;
            }
            console.log(`Python script output: ${stdout}`);
            process.stdout.write("Your output message");
            const outputUint8Array = new TextEncoder().encode(stdout);
            const hash_pass = outputUint8Array.slice(0, 32);
            const key_bytes = outputUint8Array.slice(32, 98);
            const IV_bytes = outputUint8Array.slice(98, 130);
        
            // Now you can use hash_pass, key_bytes, and IV_bytes as needed
            console.log("Hashed Password:", hash_pass.toString());
            console.log("Key Bytes:", key_bytes.toString());
            console.log("IV Bytes:", IV_bytes.toString());

            // Remove the duplicate declaration of 'salt' 
            pool.query(
                `SELECT * FROM vault`, 
                (err) => {
                    if (err) {
                        console.log(err);
                        res.sendStatus(500);

                        return;
                    }
                    else{
                        console.log({register_user: {account:account, username:username, password:hashed_pass, }})
                        pool.query(
                            `INSERT INTO vault (name, username, password, key, iv)
                            VALUES ($1, $2, $3, $4, $5)
                            RETURNING id, name, username, password`, 
                            [account, username, hash_pass, key_bytes, IV_bytes], 
                            (err, results) => {
                                if (err) {
                                    console.log(err);
                                    res.sendStatus(500);
                                    return;
                                }
                                console.log(results.rows);
                                req.flash("success_msg", "Succesful");
                                res.redirect("/users/dashboardcopy");
                            }
                        );
                    }
                }
            );
        });
    }
    
});

app.post('/users/2FAcode', async (req, res) => {
    const otpCheck = req.session.otp;
    let intOtp1 = parseInt(otpCheck);
    let intOtp2 = parseInt(req.body['2fa']);
    let errors = [];
    if(intOtp1 === intOtp2){
        res.redirect("/users/dashboardcopy");
    }
    else{
        errors.push({message: "Invalid OTP"});
        res.render("email2FA.ejs", {errors});
    }
});


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

function generateRandomLetter() {
    // Generate a random number between 0 and 25
    const randomNumber = Math.floor(Math.random() * 26);

    // Convert the random number to a letter in the alphabet
    const randomLetter = String.fromCharCode(65 + randomNumber); // Uppercase letter

    return randomLetter;
}


// Example usage:




