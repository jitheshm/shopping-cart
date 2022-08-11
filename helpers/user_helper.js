var db = require('../config/connection')
var dbcollections = require('../config/collection_names')
const bcrypt = require('bcrypt')
const { promise, reject } = require('bcrypt/promises')
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



    }
   
}