const mongoose = require('mongoose')
const mongooseDelete = require('mongoose-delete')

const Schema = mongoose.Schema

const User = new Schema({
    fullname: { type: String, maxLength: 30, require: true,},
    email: { type: String, maxLength: 100, require: true },
    password: { type: String, minLength: 6, maxLength: 100, require: true },
    image: { type: String, maxLength: 255 },
    favorite_songs:{type:Array},
    admin:{type: Boolean, default:false},
}, {
    timestamps: true,
})

// mongoose.plugin(slug)
User.plugin(mongooseDelete, {
    deletedAt: true,
    overrideMethods: 'all',
})

module.exports = mongoose.model('User', User)