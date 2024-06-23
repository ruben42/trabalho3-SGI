require('dotenv').config();
const mongoose = require('mongoose');

const dbString = process.env.DB_STRING;

async function dbConnect() {
    try {
        mongoose.set('strictQuery', false);
        await mongoose.connect(dbString);
        console.log('Connected to MongoDB');
    } catch (err) {
        console.error(err);
    }
}

dbConnect().catch(err => console.error(err));

const itemSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    creationDate: { 
        type: Date, 
        default: Date.now 
    },
    userID: { // New field to associate item with the user
        type: mongoose.Schema.Types.ObjectId,
        ref: 'googleusers',
        required: true
    }
});

const Item = mongoose.model('googleitems', itemSchema);

module.exports = Item;