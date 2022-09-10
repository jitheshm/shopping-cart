var express = require('express');
const { Db } = require('mongodb');


var router = express.Router();
var productHelper = require('../helpers/product_helpers');

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
  productHelper.viewCart(user).then((products) => {
    console.log(products);
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

router.get('/quantity-change',verifyLogin,(req,res)=>{
  console.log(req.session.user._id);
  
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

router.get('/place-order',verifyLogin,(req,res)=>{
  let user = req.session.user
  
  productHelper.viewCart(user).then((products) => {
    
    if (products) {
      let total=products.reduce((n, {totalPrice}) => n + totalPrice, 0)
      if(total!=0)
      {
        res.render('user/place_order', { user,total})

      }
      
      
    }
})
})

router.post('/make-purchase',(req,res)=>{
  productHelper.getProductList(req.body.userId).then((cartDetails)=>{
    userHelper.orderPlaced(req.body,cartDetails).then((response)=>{
      if(req.body.payment_method==='COD')
      {
        
      console.log("order placed successfully");
      res.json({success:true})
      }
      else if(req.body.payment_method==='Online'){
        userHelper.generateRazorpay(response.insertedId,req.body.Total).then((order)=>{
          userName=req.session.user.Name
          userEmail=req.session.user.Email
          userMobile=req.body.phone
          res.json({order,userName,userEmail,userMobile})

        })
      }

    })

  })


  
  
  
})

router.post('/verify-payment',(req,res)=>{
userHelper.verifyPayment(req.body).then(()=>{
  console.log(req.body);
  userHelper.changePaymentStatus(req.body['order[receipt]']).then(()=>{
    res.json({success:true,msg:"Payment successfull"})
    
  })


}).catch(()=>{
  res.json({success:false,errMsg:"payment verification failed"})


  
})

  console.log(req.body);
})


router.get('/orders',(req,res)=>{
  user=req.session.user
  userHelper.ordersList(req.session.user._id).then((ordersList)=>{
    console.log(ordersList);
    res.render('user/orders',{ordersList,user})

  })

})





module.exports = router;
