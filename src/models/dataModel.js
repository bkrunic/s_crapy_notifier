const mongoose = require('mongoose');

const schema1 = new mongoose.Schema({ value: Number,date:String });

const DataModel = mongoose.model('Data', schema1)

module.exports = DataModel;
