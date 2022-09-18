var db = require('../config/connection')
var dbcollections = require('../config/collection_names')
const bcrypt = require('bcrypt')
module.exports={
    pendingDelivery:()=>{
        return new Promise(async (resolve,reject)=>{
            pendingOrders=await db.get().collection(dbcollections.orderCollection).find({Delivery_Status:"Not Shipped"}).toArray()
            resolve(pendingOrders);
        })
    },
    changeDeliveryStatus:(orderId,status)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(dbcollections.orderCollection).updateOne({_id:orderId},
                {
                    $set:{
                        Delivery_Status:status
    
                    }
                }).then(()=>{
                    resolve()
                })
    
        })
        
    },
    shippedProducts:()=>{
        return new Promise(async (resolve,reject)=>{
            processingOrders=await db.get().collection(dbcollections.orderCollection).find({Delivery_Status:"Shipped"}).toArray()
            resolve(processingOrders);
        })
    },
    deliveredProducts:()=>{
        return new Promise(async(resolve,reject)=>{
           result=await db.get().collection(dbcollections.orderCollection).find({Delivery_Status:"Delivered"}).toArray()
           resolve(result)
        })

    },
    doLogin:(adminData)=>{
        return new Promise(async (resolve, reject) => {
            let response = {}

            let admin = await db.get().collection(dbcollections.adminCollection).findOne({ username: adminData.User_Name })
            if (admin) {
                let status = await bcrypt.compare(adminData.Password, admin.password)
                if (status) {
                    response.admin = admin
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



    }


}