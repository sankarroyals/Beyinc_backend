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


exports.addCommentsToAPitch = async (req, res, next) => {
    try {
        const pendingPitches = await Pitch.findOne({ _id: req.body.pitchId })
        if (pendingPitches) {
            await Pitch.updateOne({ _id: req.body.pitchId }, { email: req.body.email, comments: req.body.comments})
            return res.status(200).json(pendingPitches)
        }
        return res.status(400).json('No Pitch Found')
    } catch (err) {
        return res.status(400).json(err)
    }
}

exports.fetchLivePitch = async (req, res, next) => {
    try {
        const livePitches = await Pitch.find({ status: 'approved' })
        return res.status(200).json(livePitches)
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