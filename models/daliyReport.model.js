const mongoose = require('mongoose')

var daliyReportSchema = new mongoose.Schema({
    marketID: {type:String,required:true},
    cmdtyID : {type:String,required:true},
    userID : {type:String,required:true},
    reportID : {type:mongoose.Schema.Types.ObjectId, ref:'baseReport',required:true},
    marketName : {type:String,required:true},
    marketType : {type:String},
    cmdtyName : {type:String,required:true},
    priceUnit : {type:String,required:true},
    convFctr : {type:Number,required:true},
    price : {type:Number,required:true},
})

mongoose.model('dailyReport',daliyReportSchema)