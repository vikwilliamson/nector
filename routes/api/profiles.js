const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

//load profile model
const profile = require('../../models/Profile');
//load user profile
const User = require('../../models/User');
//load input validation
const validateProfileInput = require('../../validation/profiles');
const validateExperienceInput = require('../../validation/experience');

router.get('/test', (req, res) => res.json({msg: "profile works"}));

// @route   GET api/profile
// @desc    get current users profile
// @access  private
router.get('/', passport.authenticate('jwt', {session: false}), (req, res) => {
    const errors = {};
    profile.findOne({ user: req.user.id })
        .populate('user','name')
        .then(profile => {
            if(!profile){
                errors.noprofile = 'there is no profile for this user'
                return res.status(400).json(errors);
            }
            res.json(profile);
        })
        .catch(err=> res.status(404).json(err));
});



// @route   GET api/profile/all
// @desc    get all profiles
// @access  public
router.get('/all', (req,res) => {
    const errors = {};
    Profile.find()
    .populate('user','name')
    .then(profiles => {
        if(!profiles) {
            errors.noprofile = 'there are no profiles'
            return res.status(404).json();
        }

        res.json(profiles);
    
    })
    .catch(err =>
        res.status(404).json({profile: 'there are no profiles'})    
    )

});




// @route   GET api/profile/handle/:handle
// @desc    get profile by handle
// @access  public

router.get('/handle/:handle', (req, res) => {
    const errors = {};

    Profile.findOne({handle: req.params.handle})
        .populate('user','name')
        .then(profile => {
            if(!profile){
                errors.noprofile = 'there is no profile for this user';
                res.status(404).json(errors);
            }

            res.json(profile);
        })
        .catch(err => res.status(404).json(err));
});


// @route   GET api/profile/user/:user_id
// @desc    get profile by user id
// @access  public

router.get('/user/:user_id', (req, res) => {
    const errors = {};

    Profile.findOne({user: req.params.user_id})
        .populate('user','name')
        .then(profile => {
            if(!profile){
                errors.noprofile = 'there is no profile for this user';
                res.status(404).json(errors);
            }

            res.json(profile);
        })
        .catch(err => res.status(404).json(err));
});


// @route   POST api/profile
// @desc    create or edit user profile
// @access  private
router.post(
    '/', 
    passport.authenticate('jwt', {session: false}), 
    (req, res) => {

        const {errors, isValid} = validateProfileInput(req.body);

        //check validation

        if(!isValid){
            //return errors
            return res.status(400).json(errors);

        }
        //get fields
        const profileFields = {};
        profileFields.user = req.user.id;
        if(req.body.handle) profileFields.handle = req.body.handle;
        if(req.body.company) profileFields.company = req.body.company;
        if(req.body.website) profileFields.website = req.body.website;
        if(req.body.location) profileFields.location = req.body.location;
        if(req.body.status) profileFields.status = req.body.status;
        //skills split into array
        if(typeof req.body.skills !== 'undefined'){
            profileFields.skills = req.body.skills.split(',');
        }

        
        profile.findOne({ user: req.user.id})
            .then(profile => {
                if(profile){
                    //update
                    Profile.findOneAndUpdate(
                        { user: req.user.id}, 
                        { $set: profileFields},
                        { new: true}
                    )
                    .then(profile => res.json(profile));
                }else{
                    //create

                    //check if handle exists
                    Profile.findOne({handle: profileFields.handle})
                        .then(profile => {
                            if(profile){
                                errors.handle = 'that handle already exists';
                                res.status(400).json(errors);
                            }

                            // save profile
                            new Profile(profileFields).save().then(profile => res.json(profile));
                        });
                        
                }
            })
    }
    
);



// @route   POST api/profile/experience
// @desc    add experience to profile
// @access  private

router.post('/experience', passport.authenticate('jwt', {session: false}), (req, res) => {
    const {errors, isValid} = validateExperienceInput(req.body);
    

    if(!isValid){
        //return errors
        return res.status(400).json(errors);

    }

    Profile.findOne({ user: req.user.id})
        .then(profile => {
            const newExp = {
                title: req.body.title,
                company: req.body.company,
                location: req.body.location

            }

            //add to exp array
            profile.experience.unshift(newExp);

            profile.save().then(profile => res.json(profile));
        })
});


// @route   DELETE api/profile/experience/:exp_id
// @desc    delete experience from profile
// @access  private

router.delete('/experience/:exp_id', passport.authenticate('jwt', {session: false}), 
    (req, res) => {
    
    

    

    Profile.findOne({ user: req.user.id})
        .then(profile => {
            //get remove index
            const removeIndex = profile.experience
                .map(item => item.id)
                .indexOf(req.params.exp_id);

            //splice out of array
            profile.experience.splice(removeIndex, 1);

            //save
            profile.save().then(profile => res.json(profile));
        })
        .catch(err => res.status(404).json(err));
});


// @route   DELETE api/profile/
// @desc    delete profile
// @access  private

router.delete('/', passport.authenticate('jwt', {session: false}), 
    (req, res) => {
    
    
    Profile.findOneAndRemove({ user: req.user.id})
        .then(() => {
            User.findOneAndRemove({_id: req.user.id})
                .then(() => {
                    res.json({success: true})
                })
        })
        
});

module.exports = router;