var express = require('express');
var router = express.Router();
var productHelpers = require('../helpers/product-helpers')
const userHelpers = require('../helpers/user-helpers')
const verifyLogin = (req,res,next)=>{
  //previous user.loggedIn in if changed to user
  if(req.session.user){
    next()
  }else{
    res.redirect('/login')
  }
}
/* GET home page. */

router.get('/',async function(req, res, next) {
  let user=req.session.user
  //console.log(user);
  let cartCount = null
  if (req.session.user) {
    cartCount = await userHelpers.getCartCount(req.session.user._id)
  }
  
  productHelpers.getAllProducts().then((products) => {
    //console.log(products);
    
    res.render('user/view-products', { products,user,cartCount});
  })
});
router.get('/login',(req,res)=>{
  if(req.session.user){
    res.redirect('/')
  }else{
    
  res.render('user/login',{'loginErr':req.session.userLoginErr});
  req.session.userLoginErr=false
    
  }
  
});
router.get('/signup',(req,res)=>{
  res.render('user/signup');
});
router.post('/signup',(req,res)=>{
  userHelpers.doSignup(req.body).then((response)=>{
   // console.log(response);
   
    req.session.admin=response
    req.session.admin.loggedIn=true
    res.redirect('/login')
  })
}) 
router.post('/login',(req,res)=>{
  userHelpers.doLogin(req.body).then((response)=>{
    if(response.status){
      
      req.session.user=response.user
      req.session.user.loggedIn=true
      res.redirect('/')
    }else{
      req.session.userLoginErr='Invalid email or password'
      res.redirect('/login')
    }
  })
})
router.get('/logout',(req,res)=>{
  req.session.user=null
  req.session.userLoggedIn=false
  res.redirect('/')
})
router.get('/cart',verifyLogin,async(req,res)=>{
  //let total=0
  
  let products=await userHelpers.getCartProducts(req.session.user._id)
  let totalValue =0
  if(products.length>0){
   totalValue=await userHelpers.getTotalAmount(req.session.user._id)}
 
  
 
  res.render('user/cart' ,{products,user:req.session.user,totalValue})
})
router.get('/add-to-cart/:id',verifyLogin ,(req,res)=>{
  //let total=0
  //console.log('api call')
  userHelpers.addToCart(req.params.id,req.session.user._id).then(()=>{
  res.json({status:true})
  })
})
router.post('/change-product-quantity',(req,res,next)=>{
  
  userHelpers.changeProductQuantity(req.body).then(async(response)=>{
  response.total=await userHelpers.getTotalAmount(req.body.user)

  //JSON.parse(res.response)
    res.json(response)
  })
})
router.post('/cart-item-remove',(req,res,next)=>{
  userHelpers.removeProduct(req.body).then((response) => {
   // JSON.parse(res.response)
    res.json(response)
  })
})
router.get('/order',verifyLogin,async(req,res)=>{
  let total=await userHelpers.getTotalAmount(req.session.user._id)
  res.render('user/order',{user:req.session.user,total})
})
router.post('/order',async(req,res)=>{
  let products=await userHelpers.getCartProductList(req.body.userId)
  let totalPrice= await userHelpers.getTotalAmount(req.body.userId)
  userHelpers.placeOrder(req.body,products,totalPrice).then((orderId)=>{
    if(req.body['payment-method']==='COD'){
    res.json({codSuccess:true})
    }else{
      userHelpers.generateRazorpay(orderId,totalPrice).then((response)=>{
        res.json(response)
      })
    }
  })
 // console.log(req.body)
})
router.get('/success',verifyLogin,(req,res)=>{
  res.render('user/success',{user:req.session.user})
})
router.get('/myOrder',verifyLogin,async(req,res)=>{
  let orders=await userHelpers.getUserOrders(req.session.user._id)
// console.log(products)
  res.render('user/my-order',{user:req.session.user,orders})
})
router.get('/view-products/:id',verifyLogin,async(req,res)=>{
  let products=await userHelpers.getOrderProducts(req.params.id)
  res.render('user/view-order-products',{user:req.session.user,products})
})
router.post('/verify-payment',verifyLogin,(req,res)=>{
  //console.log(req.body)
 userHelpers.verifyPayment(req.body).then(()=>{
 // console.log(req.body['order[receipt]'])
  
 userHelpers.changePaymentStatus(req.body['order[receipt]']).then(()=>{
 
     // console.log(this.status)
     // console.log('payment success')
      
     res.json({status:true})
    })
 }).catch((err)=>{
   //console.log(err)
   res.json({status:false,errMsg:''})
 })
})
router.get('/orderDetails/:id',verifyLogin,async(req,res)=>{
  //console.log(req.params.id)
 
  let products=await userHelpers.getOrderProducts(req.params.id)

  let order=await userHelpers.getOrderProductsDetails(req.params.id)
  res.render('user/orderDetails',{user:req.session.user,order,products})
  //console.log(order)
})
router.get('/profile',verifyLogin, (req, res) => {
  res.render('user/profile',{user:req.session.user})
})

module.exports = router;
