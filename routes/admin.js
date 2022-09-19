var express = require('express');
const { ObjectId } = require('mongodb');
var router = express.Router();
var productHelper = require('../helpers/product_helpers')
var adminHelper = require('../helpers/admin_helpers')

const verifyLogin = (req, res, next) => {
  if (req.session.adminStatus) {
    next()
  }
  else {
    res.redirect("/admin/login")
  }

}

/* GET users listing. */
router.get('/', verifyLogin, function (req, res, next) {
  productHelper.getAllProduct().then((products) => {
    
      var adminData=req.session.admin.username
    res.render('admin/admin_landing_page', { products, admin: true,adminData })
  })




});

router.get('/add-product',verifyLogin, (req, res) => {
 
      var adminData=req.session.admin.username
  res.render('admin/add_product', { admin: true,adminData })

})
router.post('/add-product', verifyLogin, (req, res) => {
  

  var adminData=req.session.admin.username
    productHelper.addProduct(req.body, (id) => {
      if(req.files){
      var image = req.files.image
      image.mv('./public/product-images/' + id + '.jpg', (err, done) => {
        if (err)
          console.log(err);
        })}
        
          res.render('admin/add_product', { admin: true ,adminData})
      
    })
  
})
router.get('/delete_product',verifyLogin,(req,res)=>{
  productHelper.deleteProduct(req.query).then((response)=>{
    res.redirect('/admin')

  })

 })
 router.get('/edit_product',verifyLogin,(req,res)=>{
  var adminData=req.session.admin.username
   proId=req.query
   productHelper.getProdetail(proId).then((product)=>{
    res.render('admin/edit_product',{product,admin:true,adminData})
   })
 })
 router.post('/update-product',verifyLogin,(req,res)=>{
   productHelper.updateProduct(req.body,req.query).then(()=>{
    if(req.files)
    {
    var image = req.files.image
    id=req.query 
   // console.log(id);
    image.mv('./public/product-images/' + ObjectId(id)+ '.jpg')
    }
     console.log("update sucessfully")
     res.redirect('/admin')
   })

 })

 router.get('/orders-pending',verifyLogin,(req,res)=>{
  var adminData=req.session.admin.username
  adminHelper.pendingDelivery().then((orders)=>{
    res.render('admin/orders_list',{orders ,admin: true,adminData})
    
  })
  
    

})
router.get('/product-shipped',verifyLogin,(req,res)=>{
  orderId=ObjectId(req.query.id) 
  
  console.log(orderId);
  adminHelper.changeDeliveryStatus(orderId,"Shipped").then(()=>{
    res.json({success:true})

  })
})
router.get('/orders-processing',verifyLogin,(req,res)=>{
  var adminData=req.session.admin.username
  adminHelper.shippedProducts().then((orders)=>{
    res.render('admin/orders_list',{orders,admin: true,adminData})
    
  })
  
    

})
router.get('/product-delivered',verifyLogin,(req,res)=>{
  orderId=ObjectId(req.query.id) 
  console.log(orderId);
  adminHelper.changeDeliveryStatus(orderId,"Delivered").then(()=>{
    res.json({success:true})

  })
})
router.get('/delivered-products',verifyLogin,(req,res)=>{
  var adminData=req.session.admin.username
  adminHelper.deliveredProducts().then((orders)=>{
    res.render('admin/orders_list',{orders,admin: true,adminData})

  })
})
router.get('/login', (req, res) => {
  if (req.session.adminStatus)
    res.redirect('/admin')
  else {
    if (req.session.adminLoginError)
      var loginError = "invalid username or password"
    res.render('admin/admin_login', { loginError,admin: true })
    req.session.adminLoginError = false


  }


})
router.post('/login', (req, res) => {
  adminHelper.doLogin(req.body).then((response) => {
    if (response.status) {
      req.session.admin = response.admin
      req.session.adminStatus = response.status
      res.redirect('/admin')

    } else {
      req.session.adminLoginError = true
      res.redirect('/admin/login')
    }

  })

})
router.get('/logout',(req,res)=>{
  req.session.admin=null
  req.session.adminStatus=false
  res.redirect('/admin/login')
})

module.exports = router;
