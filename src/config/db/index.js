const mongoose = require('mongoose')

async function connect() {
    try {
        await mongoose.connect('mongodb+srv://levinguyen:duthanhhuy@cluster0.xu69k7k.mongodb.net/Mesic', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
        console.log('Connect Successfully!!!')
    } catch (error) {
        console.log('Connect Failure!!!')
    }
}

module.exports = { connect }