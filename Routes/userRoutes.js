// userRoute.js
const express = require('express');
const router = express.Router();
const User = require('../Models/userModel');
const bcrypt = require('bcrypt');
const {generateJwt, verifyJwt} = require('../services/jwt');
const sendMail = require('../services/nodemailer');



router.post('/signup', async(req, res) => {
    try {
        const data = req.body;
        if(data.role === 'admin') {
            const adminExists = await User.findOne({role: 'admin'});
            if(adminExists) {
                return res.status(403).json({message: "admin is already present only one admin is allowed in database"});
            }
        }


        const hashedPassword = await bcrypt.hash(data.password, 10);
        const userData = new User({
            name: data.name,
            age: data.age,
            email: data.email,
            mobile: data.mobile,
            aadharNumber: data.aadharNumber,
            address: data.address,
            password: hashedPassword,
            role: data.role,
            isVoted: data.isVoted
        });
        const payload = {
            aadharNumber: data.aadharNumber,
        }
        const token = generateJwt(payload);
        const response = await userData.save();
        console.log("Data saved in the DataBase successfully!");
        sendMail(data.email, 'Welcome to voter database', 'Thank you for registering!');
        res.status(200).json({response, token});

    } catch (error) {
        console.log(error);
        res.status(500).send("Internal server error");
    }
});

router.post('/signin', async(req, res) => {
    try {
        const {aadharNumber, password} = req.body;
        const user = await User.findOne({aadharNumber: aadharNumber});

        if(!user) {
            return res.status(401).json({error: 'Invalid Details'});
        }

        const isMatchPass = await bcrypt.compare(password, user.password);
        if(!isMatchPass) {
            return res.status(401).json({error: 'passowrd not match'});
        }

        const payload = {
            id: user._id,
        }
        const token = generateJwt(payload);
        return res.status(200).json({ token });

    } catch (error) {
        console.log(error);
        return res.status(500).send("Internal server error");
    }
});

router.get('/profile', verifyJwt, async(req, res) => {
    try {
        const userData = req.user;
        console.log(userData, "userData");
        const userId = userData.id;
        const user = await User.findById(userId).select('-password');
        res.status(200).json({user});
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal server error");
    }
});

router.put('/profile/password', verifyJwt, async(req, res) => {
    try {
        const userData = req.user; // extracting id from the token
        const userId = userData.id;
        const {password, newPassword} = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        const isMatchPassword = await bcrypt.compare(password, user.password);
        console.log(isMatchPassword, "isMatchPassword");

        if(!isMatchPassword) {
            return res.status(401).json({error: "Invalid Password please check once!"});
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedNewPassword;
        await user.save();

        console.log("Password Updated!");
        return res.status(200).json({message: "Password Updated Successfully!"});
        

    } catch (error) {
        console.log(error);
        return res.status(500).send("Internal server error");
    }
});

module.exports = router;