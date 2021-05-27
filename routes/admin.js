var express = require('express');
var router = express.Router();
var productHelpers = require('../helpers/product-helpers')
const verifyLogin = (req, res, next) => {
  //previous user.loggedIn in if changed to user
  if (req.session.admin) {
    next()
  } else {
    res.redirect('/admin/login-panel')
  }
}


/* GET users listing. */
router.get('/',verifyLogin, function(req, res, next) {
  let admin=req.session.admin
   productHelpers.getAllProducts().then((products)=>{
    //console.log(products);
    res.render('admin/view-products',{admin,products});
  })
  
});
router.get('/login-panel',(req,res)=>{
  if (req.session.admin) {
    res.redirect('/admin')
  } else {
  
    res.render('admin/login', {admin:true, 'loginErr': req.session.adminLoginErr });
    req.session.adminLoginErr = false
  
  }
  
  });
router.post('/login-panel', (req, res) => {
  productHelpers.doLogin(req.body).then((response) => {
       if (response.status) {
 
        req.session.admin = response.admin
        req.session.admin.loggedIn = true
           res.redirect('/admin')
         } else {
           req.session.adminLoginErr = 'Invalid email or password'
           res.redirect('/admin/login-panel')
         }
       })
})
router.get('/logout-panel', (req, res) => {
  req.session.destroy()
 // req.session.admin=null
//  req.session.adminLoggedIn = false
  res.redirect('/admin/login-panel')
})
router.get('/add-product',verifyLogin, function(req,res){
  res.render('admin/add-product',{admin:true})
});
router.post('/add-product',function(req,res){
  //console.log(req.body);
 //console.log(req.files.Image);
 productHelpers.addProduct(req.body,(id)=>{
   let image=req.files.Image
   image.mv('./public/product-images/'+id+'.jpg',(err,done)=>{
     if(!err){
     res.render('admin/add-product',{admin:true})}
     else{
       console.log(err);
     }
   })
   
 })
})
router.get('/delete-product/:id',verifyLogin,(req,res)=>{
  let proId=req.params.id
  //console.log(proId);
  productHelpers.deleteProduct(proId).then((response)=>{
    res.redirect('/admin/')
  })
  
})
router.get('/edit-product/:id',verifyLogin,async(req,res)=>{
  let product = await productHelpers.getProductDetails(req.params.id)
      //console.log(product);
  res.render('admin/edit-product',{admin:true,product})
})
router.post('/edit-product/:id',(req,res)=>{
  productHelpers.updateProduct(req.params.id,req.body).then(()=>{
    res.redirect('/admin')
    if(req.files.Image){
      let id=req.params.id
      let image=req.files.Image
      image.mv('./public/product-images/'+id+'.jpg')
    }
  })
})


module.exports = router;