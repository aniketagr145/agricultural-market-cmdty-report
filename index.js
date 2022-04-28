const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const mongoose = require('mongoose');
const cors = require('cors');

require('dotenv').config();
app.use(express.json());
app.use(cors({limit:'50mb'}));

const options = {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	serverSelectionTimeoutMS: 9000000,
	socketTimeoutMS: 9000000,
};
const mongouri  =process.env.MONGOURI; 

mongoose.connect(mongouri, options);
mongoose.connection.on('connected', () => {
	console.log('connected to database.....');
});
mongoose.connection.on('error', (err) => {
	console.log('error in connection', err);
});	

require('./models/baseReport.model')
require('./models/daliyReport.model')

const baseReports = mongoose.model('baseReport')
const dailyReports = mongoose.model('dailyReport')

app.get('/allbasereport',(req,res)=>{
    dailyReports.find()
    .then(result=>{
        res.json(result)
    }).catch(err=>console.log(err))
})

app.get('/reports',(req,res)=>{
    const { reportID } = req.query
    baseReports.findById(reportID).then(result=>{
        console.log(result)
        dailyReports.aggregate([
            {$match:{marketID:result.marketID,cmdtyID:result.cmdtyID}},
            {$project:{
                marketID:"$marketID",cmdtyID:"$cmdtyID",cmdtyName:"$cmdtyName",marketName:"$marketName",price:{$divide:["$price","$convFctr"]},userID:"$userID"
            }},
            {$group:{
                _id:{marketID:"$marketID",cmdtyID:"$cmdtyID",cmdtyName:"$cmdtyName",marketName:"$marketName"},price:{$avg:"$price"},users:{$push:"$userID"}
            }},{$project:{
                marketID:"$_id.marketID",cmdtyID:"$_id.cmdtyID",cmdtyName:"$_id.cmdtyName",marketName:"$_id.marketName",price:"$price",users:"$users",_id:0,priceUnit:"Kg",reportID:reportID
            }}
        ]).then(result2=>{
            if(result2.length){
                res.json(result2[0])
            }else{
                return res.json({message:'No documents are found'})
            }
        }).catch(err=>console.log(err))
    })
})

app.post('/reports',async (req,res)=>{
    const { reportDetails } = req.body
    if(typeof reportDetails !== 'object'){
        return res.status(422).json({error:'Enter the required data in required format.'})
    }
    const {
        userID,marketID,marketName,cmdtyID,marketType,cmdtyName,priceUnit,convFctr,price
    } = reportDetails
    var baseReqDoc = await baseReports.findOne({marketID:reportDetails.marketID,cmdtyID:reportDetails.cmdtyID}).catch(err=>console.log(err))
    console.log(baseReqDoc)
    if(baseReqDoc){
        const newdailyReport = new dailyReports({
            userID,
            marketID,
            marketName,
            cmdtyID,
            marketType,
            cmdtyName,
            priceUnit,
            convFctr,
            price,
            reportID:baseReqDoc._id
        })
        newdailyReport.save().then(resop=>{
            return res.json({
                "status":"success",
                reportID:resop.reportID
            })
        }).catch(err=>console.log(err))
    }else{
        const newBase = new baseReports({
            marketID:reportDetails.marketID,cmdtyID:reportDetails.cmdtyID
        })
        var saveres = await newBase.save().catch(err=>console.log(err))
        console.log(saveres._id)
        const newdailyReport = new dailyReports({
            userID,
            marketID,
            marketName,
            cmdtyID,
            marketType,
            cmdtyName,
            priceUnit,
            convFctr,
            price,
            reportID:saveres._id
        })
        newdailyReport.save().then(resop=>{
            return res.json({
                "status":"success",
                reportID:resop.reportID
            })
        }).catch(err=>console.log(err))
    }
})

app.listen(port, () => console.log(`app listening on port ${port}!`));