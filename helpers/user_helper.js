var db = require('../config/connection')
var dbcollections = require('../config/collection_names')
const bcrypt = require('bcrypt')
const { promise, reject } = require('bcrypt/promises')
const { ObjectID } = require('bson')
const Razorpay=require('razorpay');
const razorpayUtils = require('razorpay/dist/utils/razorpay-utils')

var instance = new Razorpay({
    key_id: 'rzp_test_qYQ213WoR7N8Rb',
    key_secret: 't3BLOvWzanx9QmJLaMr8EfGd',
  });

module.exports = {
    doSignup: (userData) => {
        return new Promise(async (resolve, reject) => {
            userData.Password = await bcrypt.hash(userData.Password, 10)
            db.get().collection(dbcollections.userCollection).insertOne(userData).then((data) => {
                //console.log(userData);
                resolve(data.insertedId)
            })

        })
    },
    doLogin: (userData) => {
        return new Promise(async (resolve, reject) => {
            let response = {}

            let user = await db.get().collection(dbcollections.userCollection).findOne({ Email: userData.Email })
            if (user) {
                let status = await bcrypt.compare(userData.Password, user.Password)
                if (status) {
                    response.user = user
                    response.status = true
                    resolve(response)
                }
                else {
                    console.log("password wrong");
                    resolve({ status: false })
                }


            }
            else {
                resolve({ status: false })
            }

        })



    },
    orderPlaced:(formData,cartDetails)=>{
        return new Promise((resolve,reject)=>{

        
        let status=formData.payment_method==='COD'?'placed':'pending';
        
        
        obj={
            Date:new Date().toLocaleString('en-US', {timeZone: 'Asia/Kolkata'}),
            userId:ObjectID(formData.userId) ,
            deliveryDetails:{
                Address:formData.Address,
                Pincode:formData.Pincode,
                Phone:formData.phone
            },
            Payment_method:formData.payment_method,
            Total:formData.Total,
            Products:cartDetails.products,
            Order_Status:status,
            Delivery_Status:"Not Shipped"
            

            

        }
        console.log(obj);
        db.get().collection(dbcollections.orderCollection).insertOne(obj).then((res)=>{
            db.get().collection(dbcollections.cartCollection).deleteOne({userId:ObjectID(formData.userId)}).then(()=>{
                resolve(res)
            })
            

        })
    })
        

    },
    generateRazorpay:(orderId,total)=>{
        return new Promise((resolve,reject)=>{
            console.log("orderid"+orderId);
        
            var options = {
                amount: total*100,  // amount in the smallest currency unit
                currency: "INR",
                receipt: ""+orderId
              };
              instance.orders.create(options, function(err, order) {
                if(err)
                {
                    
                    console.log("error:",err);
                }
                console.log("order",order);
                
                resolve(order)
                
              });
        })
      
    },
    verifyPayment:(details)=>{
        return new Promise((resolve,reject)=>{
            var { validatePaymentVerification } = razorpayUtils

           let result=validatePaymentVerification({"order_id": details['payment[razorpay_order_id]'], "payment_id": details['payment[razorpay_payment_id]'] }, details['payment[razorpay_signature]'], 't3BLOvWzanx9QmJLaMr8EfGd');
           //console.log('result',result);
           if(result)
           {
            resolve()
           }
           else{
           
            reject()
           }
        })

    },
    changePaymentStatus:(orderId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(dbcollections.orderCollection).updateOne({_id:ObjectID(orderId)},{
                $set:{
                    status:"placed"
                }
            }).then(()=>{
                resolve()
            })
        })

    },
    ordersList:(userId)=>{
       return new Promise(async(resolve,reject)=>{
       result= await db.get().collection(dbcollections.orderCollection).aggregate([
        {
            $match: { userId: ObjectID(userId) }
         },
         {
            $lookup:{
                from:dbcollections.productCollection ,
                localField: "Products.proId",
                foreignField: "_id",
                as: "proList"

            }
         },
         
         {
            $project:{
                Date:1,
                userId:1,
                deliveryDetails:1,
                Payment_method:1,
                Total:1,
                Order_Status:1,
                Delivery_Status:1,
                proList:1
            }
         }
        
         
       ]).toArray()
       console.log(result);
       resolve(result)
       
       })

    }

   
}