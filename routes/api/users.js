const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const keys = require('../../config/keys');
const passport = require('passport');


//load input validation
const validateRegisterInput = require('../../validation/register');

//load user model
const User = require('../../models/User');

// @route   GET api/users/test
// @desc    Tests users route
// @access  public
router.get('/test', (req, res) => res.json({msg: "users works"}));

// @route   GET api/users/register
// @desc    register user
// @access  public
router.post('/register', (req, res) => {

    const {errors, isValid} = validateRegisterInput(req.body);

    //check validation
    if(!isValid) {
        return res.status(400).json(errors);
    }

    User.findOne({ email: req.body.email})
        .then(user => {
            if(user){
                errors.email = 'email already exists'
                return res.status(400).json({errors})
            }else{
                const newUser = new User({
                    name: req.body.name,
                    email: req.body.email,
                    password: req.body.password
                });

                bcrypt.genSalt(10, (err,salt) =>{
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if(err) throw err;
                        newUser.password = hash;
                        newUser.save()
                            .then(user => res.json(user))
                            .catch(err => console.log);
                    })
                })
            }
        })
});

// @route   GET api/users/login
// @desc    login user/return jwt token
// @access  public
router.post('/login', (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    //find user by email
    User.findOne({email})
        .then(user => {
            //check for user
            if(!user){
                return res.status(404).json({email: 'user not found'});
            }

            //check password
            bcrypt.compare(password, user.password)
                .then(isMatch => {
                    if(isMatch){
                        //user matched
                        
                        //create jwt payload
                        const payload = {id: user.id, name: user.name}

                        //sign token
                        jwt.sign(
                            payload, 
                            keys.secretOrKey, 
                            {expiresIn: 3600}, 
                            (err, token) =>{
                                res.json({
                                    success: true,
                                    token: 'Bearer ' + token
                                })
                                
                            } );
                    }else{
                        return res.status(400).json({password: 'password incorrect'});
                    }
                });
        });
});

// @route   GET api/users/current
// @desc    return current user
// @access  private
router.get('/test', (req, res) => res.json({msg: "users works"}));


router.get(
    '/current', 
    passport.authenticate('jwt', {session: false}), 
    (req, res) => 
    res.json({
        id: req.user.id,
        name: req.user.name,
        email: req.user.email
    })
);

module.exports = router;