const LocalStrategy = require('passport-local').Strategy;
const { authenticate } = require('passport');
const { pool } = require('./dbConfig');
const bcrypt = require('bcrypt');

function initialize (passport) {
    const authenticateUser = (email, password, done) => {

        console.log(email, password);
        pool.query(
            `SELECT * FROM users WHERE email = $1`,
            [email],
            (err, results) => {
                if(err){
                    console.log(err);
                    res.sendStatus(500);
                    return;
                }

                console.log(results.rows);

                if(results.rows.length > 0){
                    const user = results.rows[0];

                    bcrypt.compare(password, user.password, (err, isMatch) => {
                        if(err){
                            console.log(err);
                        }
                        if(isMatch){
                            console.log("Password matched");
                            return done(null, user);
                        } else {
                            console.log("Password is not matched");
                            return done(null, false, {message: "Password is not correct"});
                        }
                    });
                }else{
                    return done(null, false, {message: "Email is not registered"});
                
                }
            }
        );
            }
    passport.use(
        new LocalStrategy({
            usernameField: 'email',
            passwordField: 'password'
        },
        authenticateUser
        )
    )
    passport.serializeUser((user, done) => done(null, user.id));
    passport.deserializeUser((id, done) => {
        pool.query(
            `SELECT * FROM users WHERE id = $1`,
            [id],
            (err, results) => {
                if(err){
                    throw err;
                }
                return done(null, results.rows[0]);
            });
    }); // Add closing parenthesis here
}

module.exports = initialize;