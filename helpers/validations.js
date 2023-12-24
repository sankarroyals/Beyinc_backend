const joi = require('@hapi/joi')

const authSchema = joi.object({
    userName: joi.string(),
    email: joi.string().email(),
    password: joi.string().min(2).required(),
    phone: joi.string().min(10),
    role: joi.string(),
})

module.exports={
    authSchema
}