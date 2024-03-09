const mongoose=require('mongoose')
const plm =require('passport-local-mongoose')
const billSchema=mongoose.Schema({
  customerName:String,
  customerAddress:String,
  customerPhone:Number,
  customerGstno:String,
  customerEmail:String,
  billDate:{
    type:Date,
    default:Date.now
  },
  items:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:"item"
  }],
  totalAmount:{
    type:Number,
    default:0
  }
})
module.exports=mongoose.model('bill',billSchema);