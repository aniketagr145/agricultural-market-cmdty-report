const mongoose = require('mongoose')

var baseReportSchema = new mongoose.Schema({
    marketID: {type:String,required:true},
    cmdtyID : {type:String,required:true}
})

mongoose.model('baseReport',baseReportSchema)
