var db = require('../config/connection')
var collection = require('../config/collections')
var objectId= require('mongodb').ObjectId
module.exports={
  addProduct:(product,callback)=>{
   // console.log(product);
    db.get().collection('product').insertOne(product).then((data)=>{
     
      callback(data.ops[0]._id)
    })
  },getAllProducts:()=>{
 return new Promise(async(resolve,reject)=>{
    let products =await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
    resolve(products)
  })
  },
  deleteProduct:(prodId)=>{
    return new Promise((resolve,reject)=>{
      db.get().collection(collection.PRODUCT_COLLECTION).removeOne({_id:objectId(prodId)}).then((response)=>{
        //console.log(response);
        resolve(response)
      })
    })
  },
  getProductDetails:(proId)=>{
    return new Promise((resolve,reject)=>{
      db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:objectId(proId)}).then((product)=>{
        resolve(product)
      })
    })
  },
  updateProduct:(proId,proDetails)=>{
    return new Promise((resolve,reject)=>{
      db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:objectId(proId)},{
        $set:{
          Name:proDetails.Name,
          Price:proDetails.Price,
          Description:proDetails.Description,
        }
      }).then((response)=>{
        resolve()
      })
    })
  },

doLogin: (adminData) => {
  return new Promise(async (resolve, reject) => {
    let loginStatus = false
    let response = {}
    let admin = await db.get().collection(collection.ADMIN_COLLECTION).findOne({ Email: adminData.Email })
    if (admin) {
      return new Promise((resolve, reject) => {
        let a = adminData.Password
        let b = admin.Password
        c = a === b
        //console.log(b);
        //console.log('enter'+a)
        resolve(c)
      }).then((status) => {
        if (status) {
         // console.log('login success');
          response.admin = admin
          response.status = true
          resolve(response)
        } else {
         // console.log('login failed');
          resolve({ status: false })
        }
      })


    } else {
      //console.log('Invalid email');
      resolve({ status: false })
    }
  })
},

}