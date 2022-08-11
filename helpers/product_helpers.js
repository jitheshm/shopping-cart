var db = require('../config/connection')
var dbcollections = require('../config/collection_names')
const { productCollection } = require('../config/collection_names')
const { ObjectId } = require('mongodb')
const { promise, reject } = require('bcrypt/promises')
var toObject = require('mongodb').ObjectId
module.exports = {
    addProduct: (product, callback) => {
        db.get().collection(dbcollections.productCollection).insertOne(product).then((data) => {
            console.log(data.insertedId);
            callback(data.insertedId)
        })
    },
    getAllProduct() {
        return new Promise(async (resolve, reject) => {
            let products = await db.get().collection(dbcollections.productCollection).find().toArray()
            //console.log(products);
            resolve(products)
        })

    },
    deleteProduct: (id) => {

        return new Promise((resolve, reject) => {

            db.get().collection(dbcollections.productCollection).deleteOne({ _id: toObject(id) }).then(() => {
                resolve(id) //anything, here just pass  id
            })

        })

    },
    getProdetail: (id) => {
        return new Promise(async (resolve, reject) => {
            let product = await db.get().collection(dbcollections.productCollection).findOne({ _id: toObject(id) })
            resolve(product)

        })



    },
    updateProduct: (product, proId) => {

        return new Promise((resolve, reject) => {

            db.get().collection(dbcollections.productCollection).updateOne({ _id: toObject(proId) }, {
                $set: {
                    name: product.name,
                    category: product.category,
                    description: product.description,
                    price: product.price
                }
            }).then((data) => {
                resolve()

            })
        })


    },
    addToCart: (proId, user) => {
       //console.log(objectId(proId));
        let prodObj = {
            proId: toObject(proId),
            quantity: 1,
            
            
        }
        
        return new Promise(async (resolve, reject) => {

            let cart = await db.get().collection(dbcollections.cartCollection).findOne({ userId: toObject(user._id) })

            if (cart) {
                   // console.log(proId);
                let index = cart.products.findIndex(item => item.proId == proId)
                if (index != -1) {
                    db.get().collection(dbcollections.cartCollection).
                        findOneAndUpdate({ userId: ObjectId(user._id), 'products.proId': ObjectId(proId) },
                            { $inc: { 'products.$.quantity': 1 } },
                            { returnDocument: 'after' }
                            
                            
                        ).then((res) => {
                           let totalQuantity=res.value.products.reduce((n, {quantity}) => n + quantity, 0);
                            resolve(totalQuantity)
                        })

                }
                else {
                    db.get().collection(dbcollections.cartCollection).findOneAndUpdate({ userId: toObject(user._id) },
                        {
                            $push: {
                                products: prodObj
                            }
                        },
                        { returnDocument: 'after' }
                        ).then((res) => {
                           
                            let totalQuantity=res.value.products.reduce((n, {quantity}) => n + quantity, 0);
                             resolve(totalQuantity)
                         })
                }
            }
            else {

                let cartobj = {

                    userId: toObject(user._id),
                    products: [prodObj]
                }
                db.get().collection(dbcollections.cartCollection).insertOne(cartobj).then((data) => {
                    console.log(data);
                   let totalQuantity=1;
                    resolve(totalQuantity)
                })

            }

        })

    },
    viewCart: (user) => {
        return new Promise(async (resolve, reject) => {

            let products = await db.get().collection(dbcollections.cartCollection).aggregate([
                {
                    $match: {
                        userId: ObjectId(user._id)

                    }
                },
                {
                    $unwind:"$products"
                },
                {
                    $lookup:{
                        from:dbcollections.productCollection,
                        localField:"products.proId",
                        foreignField:"_id",
                        as:"cartItems"
                    }
                },
                {
                    $unwind:"$cartItems"
                },
                {
                $addFields:{
                    convertedPrice: { $convert:
                       {
                          input: "$cartItems.price",
                          to: "int"
                       } }
                    }
                },
                       {
                        $project:{
                             cartItems:1,quantity:"$products.quantity",proId:"$products.proId",totalPrice:{ $multiply: ["$convertedPrice", "$products.quantity"] } 
                        }
                    }
                
                
               
                
               
                

            ]).toArray()
             //console.log(products);                                          //aggregation
            resolve(products)



        })

    },
    cartCount:(user)=>{
        return new Promise(async (resolve,reject)=>{
           let cartData=await db.get().collection(dbcollections.cartCollection).findOne({userId:ObjectId(user._id)})
          let count=0;
          if(cartData){
            count=cartData.products.reduce((n, {quantity}) => n + quantity, 0)
          }
            resolve(count)
        })

    },
    quantityChange:(proId,val,userId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(dbcollections.cartCollection).findOneAndUpdate({userId:ObjectId(userId),'products.proId':ObjectId(proId)},
            { $inc: { 'products.$.quantity': parseInt(val) } },
            { returnDocument: 'after' }).then((res)=>{
                
                //console.log(res);
                resolve()

            })

        })
    },
    removeProduct:(proId,userId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(dbcollections.cartCollection).findOneAndUpdate({userId:ObjectId(userId)},
                {
                    $pull:{
                        products:{
                            proId:ObjectId(proId)
                        }
                    }

                }).then((res)=>{
                    
                    resolve()

                })
        })

    }
}