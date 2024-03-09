const mongoose=require('mongoose')
const plm =require('passport-local-mongoose')
const itemSchema=mongoose.Schema({
  itemName:String,
  itemPrice:Number,
  itemUnit:Number,
  total:Number
})
module.exports=mongoose.model('item',itemSchema);