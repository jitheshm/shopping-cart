var express = require('express');
const { Db } = require('mongodb');
const product_helpers = require('../helpers/product_helpers');
var router = express.Router();
var productHelper = require('../helpers/product_helpers');
const user_helper = require('../helpers/user_helper');
var userHelper = require('../helpers/user_helper')
const verifyLogin = (req, res, next) => {
  if (req.session.status) {
    next()
  }
  else {
    res.redirect("/login")
  }

}


/* GET home page. */



router.get('/', async function (req, res, next) {
  let user = req.session.user
  
   let cartCount=0
  if(user)
  {
  cartCount= await productHelper.cartCount(user)
  }
  productHelper.getAllProduct().then((products) => {
    res.render('user/user_landing_page', { products, admin: false, user,cartCount })
  })
});
router.get('/signup', (req, res) => {
  res.render('user/account_creation')

});

router.post('/signup', (req, res) => {
  userHelper.doSignup(req.body).then((id) => {
    res.redirect('/')


  })
})
router.get('/login', (req, res) => {
  if (req.session.status)
    res.redirect('/')
  else {
    if (req.session.loginError)
      var loginError = "invalid username or password"
    res.render('user/user_login', { loginError })
    req.session.loginError = false


  }


})
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login')
})

router.post('/login', (req, res) => {
  userHelper.doLogin(req.body).then((response) => {
    if (response.status) {
      req.session.user = response.user
      req.session.status = response.status
      res.redirect('/')

    } else {
      req.session.loginError = true
      res.redirect('/login')
    }

  })

})
router.get('/cart', verifyLogin, (req, res) => {
  let user = req.session.user
  product_helpers.viewCart(user).then((products) => {
    if (products) {
      let total=products.reduce((n, {totalPrice}) => n + totalPrice, 0)
      
      res.render('user/cart', { user, products,total})
    }
    else {
      console.log("empty");
    }
  })




})

router.post('/add-to-cart', verifyLogin, (req, res) => {
  
  proId = req.body.id
 
 // console.log(proId);
  

  productHelper.addToCart(proId, req.session.user).then((totalQuantity) => {
    console.log("cart add sucessfully");
   res.json({status:true,total:totalQuantity})
    
  })
})

router.get('/quantity-change',(req,res)=>{
  console.log(req.query);
  
  proId=req.query.id
  val=req.query.val
  productHelper.quantityChange(proId,val, req.session.user._id).then(()=>{
    res.json({success:true})
  })

})
router.get('/remove',(req,res)=>{
  proId=req.query
  userId=req.session.user._id
  //console.log(user);
  productHelper.removeProduct(proId,userId).then(()=>{
    res.json({success:true})

  })
})








module.exports = router;
