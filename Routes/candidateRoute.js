const express = require('express');
const router = express.Router();
const {verifyJwt} = require('../services/jwt');
const sendMail = require('../services/nodemailer');


const User = require('../Models/userModel');
const Candidate = require('../Models/candidateModel');

// function for checking the user role -> voter/admin
const checkRole = async(userId) => {
    try {
        const userRole = await User.findById(userId);
        return userRole.role === 'admin';
    } catch (error) {
        return false;
    }
}


// candidate data post
router.post('/', verifyJwt, async(req, res) => {
    try {

        if(!( await checkRole(req.user.id))) {
            return res.status(403).json({message: "user does not have admin role"});
        }


        const candidateData = req.body;
        // const newCandidate = new Candidate({
        //     name: candidateData.name,
        //     age: candidateData.age,
        //     party: candidateData.party,
        //     votes: candidateData.votes,
        //     voteCount: candidateData.voteCount
        // });

        const newCandidate = new Candidate(candidateData);
        const response = await newCandidate.save();

        console.log("candidate data saved in database Successfully!");
        sendMail(candidateData.email, 'you are nominated for election', "best wishes for Election!");

        res.status(200).json({response});

    } catch (error) {
        console.error("error : ", error);
        res.status(500).json({error: "Internal Server Error"});
    } 
});

// candidate data updation
router.put('/:_candidateId', verifyJwt, async(req, res) => {
    try {
        if(! (await checkRole(req.user.id))) {
            return res.status(403).json({message: "user does not have admin role"});
        }
        const candidateId = req.params._candidateId;
        const updatedCandidateData = req.body;
        const response = await Candidate.findByIdAndUpdate(candidateId, updatedCandidateData, {
            new: true,
            runValidators: true
        });

        if(!response) {
            return res.status(404).json({message: "candidate not found"});
        }

        console.log("data updated successfully");
        return res.status(200).json({response});   

    } catch (error) {
        console.error("error : ", error);
        res.status(500).json({error: "Internal Server Error"});
    }
});

// candidate data deletion
router.delete('/:_candidateId', verifyJwt, async(req, res) => {
    try {
        if(! (await checkRole(req.user.id))) {
            return res.status(403).json({message: "user does not have admin role"});
        }

        const candidateId = req.params._candidateId;
        console.log(candidateId, "candidateId");
        
        const response = await Candidate.findByIdAndDelete(candidateId);
        console.log(response, "response");

        if(!response) {
            return res.status(403).json({message: "Candidate not found"});
        }

        console.log("Candidate Deleted!");
        return res.status(200).json({message: "Candidate deleted!"});


    } catch (error) {
        console.error("error : ", error);
        res.status(500).json({error: "Internal Server Error"});
    }
});


// logic for voting
router.get('/candidateList', async(req, res) => {
    try {
        const list = await Candidate.find();
        const CandidateList = list.map((data) => {
            return {
                name: data.name,
                email: data.email,
                party: data.party
            }
        })
        res.status(200).json({CandidateList});
    } catch (error) {
        console.error("error : ", error);
        res.status(500).json({error: "Internal Server Error"});
    }
});


// for vote
router.post('/vote/:_candidateId', verifyJwt, async(req, res) => {
    // admin should not vote // user only vote only once
    const candidateId = req.params._candidateId;
    const userId = req.user.id;
    try {
        const candidate = await Candidate.findById(candidateId);
        if(!candidate) {
            return res.status(403).json({message: "candidate not found!"});
        }
        const user = await User.findById(userId);
        if(!user) {
            return res.status(403).json({message: "user not found!"});
        }

        if(user.isVoted) {
            return res.status(400).json({message: "user already voted!"});
        }
        if(user.role == 'admin') {
            return res.status(403).json({message: "Admin is not allowed to Vote!"});
        }

        // updating the voteCount and the voter info
        candidate.votes.push({user: userId});
        candidate.voteCount++;
        await candidate.save();

        // updating the user if voted
        user.isVoted = true;
        await user.save();

        console.log(user.email, "mail");
        // sendMail(user.email)

        return res.status(200).json({message: "vote record success!"});

    } catch (error) {
        console.error("error : ", error);
        res.status(500).json({error: "Internal Server Error"});
    }

});


router.get('/vote/count', async(req, res) => {
    try {
        const candidate = await Candidate.find().sort({voteCount: 'desc'});
        //  returnring only the votecount and the party
        const record = candidate.map((data) => {
            return {
                party: data.party,
                voteCount: data.voteCount
            }
        })
        return res.status(200).json({record});
    } catch (error) {
        console.error("error : ", error);
        res.status(500).json({error: "Internal Server Error"});
    }
})


module.exports = router;