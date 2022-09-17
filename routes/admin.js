var express = require('express');
const { ObjectId } = require('mongodb');
var router = express.Router();
var productHelper = require('../helpers/product_helpers')
var adminHelper = require('../helpers/admin_helpers')

/* GET users listing. */
router.get('/', function (req, res, next) {
  productHelper.getAllProduct().then((products) => {
    res.render('admin/admin_landing_page', { products, admin: true })
  })




});

router.get('/add-product', (req, res) => {
  res.render('admin/add_product', { admin: true })

})
router.post('/add-product', (req, res) => {
  


    productHelper.addProduct(req.body, (id) => {
      if(req.files){
      var image = req.files.image
      image.mv('./public/product-images/' + id + '.jpg', (err, done) => {
        if (err)
          console.log(err);
        })}
        
          res.render('admin/add_product', { admin: true })
      
    })
  
})
router.get('/delete_product',(req,res)=>{
  productHelper.deleteProduct(req.query).then((response)=>{
    res.redirect('/admin')

  })

 })
 router.get('/edit_product',(req,res)=>{
   proId=req.query
   productHelper.getProdetail(proId).then((product)=>{
    res.render('admin/edit_product',{product,admin:true})
   })
 })
 router.post('/update-product',(req,res)=>{
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

 router.get('/orders-pending',(req,res)=>{
  adminHelper.pendingDelivery().then((orders)=>{
    res.render('admin/orders_list',{orders ,admin: true})
    
  })
  
    

})
router.get('/product-shipped',(req,res)=>{
  orderId=ObjectId(req.query.id) 
  
  console.log(orderId);
  adminHelper.changeDeliveryStatus(orderId,"Shipped").then(()=>{
    res.json({success:true})

  })
})
router.get('/orders-processing',(req,res)=>{
  adminHelper.shippedProducts().then((orders)=>{
    res.render('admin/orders_list',{orders,admin: true})
    
  })
  
    

})
router.get('/product-delivered',(req,res)=>{
  orderId=ObjectId(req.query.id) 
  console.log(orderId);
  adminHelper.changeDeliveryStatus(orderId,"Delivered").then(()=>{
    res.json({success:true})

  })
})
router.get('/delivered-products',(req,res)=>{
  adminHelper.deliveredProducts().then((orders)=>{
    res.render('admin/orders_list',{orders,admin: true})

  })
})

module.exports = router;
