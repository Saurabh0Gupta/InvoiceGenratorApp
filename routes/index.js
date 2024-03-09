var express = require('express');
var router = express.Router();
const shopModel=require('./users')
const billModel=require('./bill')
const itemModel=require('./item')
const passport = require('passport');
var localStrategy = require('passport-local');
// const bill = require('./bill');
// const bill = require('./bill');
passport.use(new localStrategy(shopModel.authenticate()))
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
router.post('/register',function(req, res, next) {
  const shop=new shopModel({
    username:req.body.username,
    email:req.body.email,
  })
  shopModel.register(shop,req.body.password)
  .then(function(){
    passport.authenticate('local')(req,res,function(){
      res.redirect('/home');
    })
  })
});
router.post('/login',passport.authenticate("local",{
  successRedirect:"/home",
  failureRedirect:"/"
}),(req,res)=>{

})
function isLoggedIn(req,res,next){
  if(req.isAuthenticated())return next();
  res.redirect("/login");
}
router.get('/home',isLoggedIn,async function(req, res, next) {
  const shopOwner=await shopModel.findOne({username:req.session.passport.user})
  // console.log(shopOwner)
  res.render('home', {shopOwner});
});
router.get('/login', function(req, res, next) {
  res.render('login', { title: 'Express' });
});
router.get('/update/:id',isLoggedIn,async function(req, res, next) {
  const shopId=req.params.id
  const shopOwner=await shopModel.findOne({username:req.session.passport.user})
  res.render('update',{shopId,shopOwner})
});
router.post('/update/:id',async function(req, res, next) {
  const shop=await shopModel.findOneAndUpdate({_id:req.params.id},{address:req.body.address,gstno:req.body.gstno, phone:req.body.phone},{new:true})
  res.redirect('/home')
});
router.get('/createbill',isLoggedIn,async function(req, res, next) {
  res.render('createbill')
});
router.get('/item',isLoggedIn,async function(req, res, next) {
  res.render('item')
});
router.post('/createbill',isLoggedIn,async function(req, res, next) {
  const shopOwner=await shopModel.findOne({username:req.session.passport.user})
  const bill=await billModel.create({
    customerName:req.body.customerName,
    customerPhone:req.body.customerPhone,
    customerAddress:req.body.customerAddress,
    customerGstno:req.body.customerGstno,
    customerEmail:req.body.customerEmail,
})
  shopOwner.bills.push(bill._id)
  await shopOwner.save()
  // console.log(bill,shopOwner)
  res.redirect('/bill')
});
router.get('/createitem',isLoggedIn, function(req, res, next) {
  res.render('createbill')
});
router.get('/bill',isLoggedIn,async function(req, res, next) {
let shopOwner=await shopModel.findOne({username:req.session.passport.user}).populate("bills")
  console.log(shopOwner)
  res.render('bill',{shopOwner})
});
// router.get('/invoice',isLoggedIn,(req,res)=>{

//   res.render('invoice')
// })
router.get('/invoice/:id',isLoggedIn,async(req,res)=>{
  const shopOwner=await shopModel.findOne({username:req.session.passport.user})
  const bill=await billModel.findOne({_id:req.params.id}).populate('items')

  console.log(bill)
  res.render('invoice',{shopOwner,bill});
})
router.post('/createitem/:billId',isLoggedIn,async function(req, res, next) {
  const item=await itemModel.create({
    itemName:req.body.itemName,
    itemPrice:req.body.itemPrice,
    itemUnit:req.body.itemUnit,
  })
  const itemdetails=await itemModel.findOne({_id:item._id})
  item.total=(itemdetails.itemUnit*itemdetails.itemPrice);
  await item.save()
  const shopOwner=await shopModel.findOne({username:req.session.passport.user})
  const bill=await billModel.findOne({_id:req.params.billId})
  bill.totalAmount=bill.totalAmount+item.total
  bill.items.push(item._id)
  await bill.save()
  console.log(bill)
  console.log(bill.totalAmount)
  res.redirect(`/invoice/${bill._id}`)
});
router.post('/delete/:id',isLoggedIn, async (req,res)=>{
  const item=await itemModel.findOne({_id:req.params.id})
  const deleteItem=await itemModel.findOneAndDelete({_id:req.params.id})
  const billId=req.body.billId
  const bill=await billModel.findOne({_id:billId})
  const index=bill.items.indexOf(deleteItem._id)
  if(index===-1){
    res.status(200).json(item)
    return;
  }
  bill.items.splice(index,1);
  await bill.save()
  res.status(200).json(item)
})
module.exports = router;