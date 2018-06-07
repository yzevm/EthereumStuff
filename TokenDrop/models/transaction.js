const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// create schema
const txSchema = new Schema({
    addresses: {
        type: [String],
        required: true
    },
    amounts: {
        type: [Number],
        required: true
    },
    hash: {
        type: String
    }
}, {
    versionKey: false
});

// create model
const Transaction = mongoose.model('transaction', txSchema)

// export model
module.exports = Transaction;