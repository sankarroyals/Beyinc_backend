const Pitch = require("../models/PitchModel")

exports.fetchPendingPitch = async (req, res, next) => {
    try {
        const pendingPitches = await Pitch.find({ status: 'pending' })
        return res.status(200).json(pendingPitches)
    } catch (err) {
        return res.status(400).json(err)
    }
}

exports.fetchSinglePitch = async (req, res, next) => {
    try {
        const pendingPitches = await Pitch.findOne({_id: req.body.pitchId})
        return res.status(200).json(pendingPitches)
    } catch (err) {
        return res.status(400).json(err)
    }
}


exports.updateSinglePitch = async (req, res, next) => {
    try {
        const pitch = await Pitch.findOne({ _id: req.body.pitchId })
        if (pitch) {
            await Pitch.updateOne({ _id: req.body.pitchId }, { $set: { status: 'pending', pitchRequiredStatus: req.body.status } })
            return res.status(200).json('Pitch updated')
        }
        return res.status(400).json('No Pitch Found')
    } catch (err) {
        return res.status(400).json(err)
    }
}



exports.fetchUserPitches = async (req, res, next) => {
    try {
        const { email } = req.body;
        const result = await Pitch.find({ email: email })
        return res.status(200).json(result)
    } catch (err) {
        return res.status(400).json(err)
    }
}




exports.fetchLivePitch = async (req, res, next) => {
    try {
        const livePitches = await Pitch.find({ status: 'approved', pitchRequiredStatus: 'show' })
        return res.status(200).json(livePitches)
    } catch (err) {
        return res.status(400).json(err)
    }
}

exports.addPitchComment = async (req, res, next) => {
    try {
        const pitch = await Pitch.findOne({ _id: req.body.pitchId })
        if (pitch) {
            await Pitch.updateOne({ _id: req.body.pitchId }, { $push: { 'comments': req.body.comment }  })
            return res.status(200).json('Comment added')

        }
        return res.status(400).json('No Pitch Found')
    } catch (err) {
        return res.status(400).json(err)
    }
}

exports.addIntrest = async (req, res, next) => {
    try {
        const pitch = await Pitch.findOne({ _id: req.body.pitchId })
        if (pitch) {
            const userExist = await Pitch.findOne({ _id: req.body.pitchId, intrest: { $in: [req.body.email] } })
            if (userExist) {
                return res.status(400).json('user already in the intrest list')
            }
            await Pitch.updateOne({ _id: req.body.pitchId }, { $push: { 'intrest': req.body.email } })
            return res.status(200).json('Intrest added')

        }
        return res.status(400).json('No Pitch Found')
    } catch (err) {
        return res.status(400).json(err)
    }
}


exports.removeFromIntrest = async (req, res, next) => {
    try {
        const pitch = await Pitch.findOne({ _id: req.body.pitchId })
        if (pitch) {
            const userExist = await Pitch.findOne({ _id: req.body.pitchId, intrest: { $in: [req.body.email] } })
            if (userExist) {
                await Pitch.updateOne({ _id: req.body.pitchId }, { $pull: { 'intrest': req.body.email } })
                return res.status(200).json('User removed from intrest list')
            }
            return res.status(400).json('user not in the intrest list')

        }
        return res.status(400).json('No Pitch Found')
    } catch (err) {
        return res.status(400).json(err)
    }
}



exports.addReviewStars = async (req, res, next) => {
    try {
        const pitch = await Pitch.findOne({ _id: req.body.pitchId })
        if (pitch) {
            const userExists = await Pitch.findOne({ '_id': req.body.pitchId, 'review.email': req.body.review.email })
            if (userExists) {
                await Pitch.updateOne({ '_id': req.body.pitchId, 'review.email': req.body.review.email }, { 'review.$.review': req.body.review.review})
                return res.status(200).json('Review updated')

            }
            await Pitch.updateOne({ _id: req.body.pitchId }, { $push: { 'review': req.body.review } })
            return res.status(200).json('Review added')

        }
        return res.status(400).json('No Pitch Found')
    } catch (err) {
        return res.status(400).json(err)
    }
}


exports.fetchAllPitch = async (req, res, next) => {
    try {
        const AllPitches = await Pitch.find()
        return res.status(200).json(AllPitches)
    } catch (err) {
        return res.status(400).json(err)
    }
}

exports.changePitchStatus = async (req, res, next) => {
    try {
        const { pitchId , status} = req.body; 
        const changedPitch = await Pitch.updateOne({ _id: pitchId }, { $set: { status: status } })
        return res.status(200).json(changedPitch)
    } catch (err) {
        return res.status(400).json(err)
    }
}


exports.recentPitchOfUser = async (req, res, next) => {
    try {
        const { email } = req.body;
        const recentPitch = await Pitch.find({ email: email }).sort({ _id: -1 }).limit(1)
        return res.status(200).json(recentPitch)
    } catch (err) {
        return res.status(400).json(err)
    }
}