const mongoose = require('mongoose')
const slug = require('mongoose-slug-generator')
const mongooseDelete = require('mongoose-delete')

const Schema = mongoose.Schema

const Song = new Schema({
    name: { type: String, require: true, },
    type: { type: String, maxLength: 100 },
    image: { type: String, maxLength: 255 },
    singer: { type: String, maxLength: 255 },
    path: { type: String, require: true, },
    slug: { type: String, slug: 'name', unique: true },
    comments: [{name:String,email:String,comment:String,cmtdate:{type:Date}}],
}, {
    timestamps: true,
})

// Add plugins
mongoose.plugin(slug)
Song.plugin(mongooseDelete, {
    deletedAt: true,
    overrideMethods: 'all',
})

module.exports = mongoose.model('Song', Song)