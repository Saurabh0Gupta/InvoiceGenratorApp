const mongoose=require('mongoose')
const plm =require('passport-local-mongoose')
mongoose.connect('mongodb://127.0.0.1:27017/bill')
const shopowner=mongoose.Schema({
  // invoiceNo:Number,
  username:String,
  email:String,
  password:String,
  address:String,
  gstno:String,
  phone:Number,
  bills:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:"bill"
  }]
})
shopowner.plugin(plm)
module.exports=mongoose.model('owner',shopowner);