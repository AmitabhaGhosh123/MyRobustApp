var mongoose = require('mongoose');
var express  = require('express');
var nodemailer = require('nodemailer');
var crypto = require('crypto');
var async;
// express router for defining routes
var myRouter = express.Router();
var userModel = mongoose.model('myUser');
var prodModel = mongoose.model('Product');
var responseGenerator = require('./../../libs/responseGenerator');
var myauth = require("./../../middlewares/myauth");
var _=require('lodash');

//shows the cart to user

exports.controller = function(app){ 

  var myResponse;
  myRouter.get('/',myauth.checkLogin,function(req,res){

    userModel.findOne({'email' : req.session.myuser.email},function(err,myuser){

      if (err) {

        console.log(err);
        myResponse = responseGenerator.generate(true,"Error : Database Error",500,null);
        res.send(myResponse);
    }

      if (myuser==""||myuser==null||myuser==undefined) {

        myResponse = responseGenerator.generate(false,"No item in cart",200,null);
        res.send(myResponse);
      }

      else if (myuser.cartInfo.length==0) {

        myResponse = responseGenerator.generate(false,"OK",200,myuser.cartInfo);
        
      }
  });
});

// add products to cart

myRouter.get('/:_id',myauth.checkLogin,function(req,res){

    userModel.findOne({'email' : req.session.myuser.email},function(err,myuser){

        if (err) {

          console.log(err);
          myResponse = responseGenerator.generate(true,"Error:Database Error",500,null);
          res.send(myResponse);
        }

        if (myuser==""||myuser==null||myuser==undefined) {

          myResponse = responseGenerator.generate(true,"Error: User Error",404,null);
          res.send(myResponse);
        }

        else {

          myuser.cartInfo.push(req.params.id);
          myuser.save(function(err,myuser){

            if(err){           

          console.log(err);       
          myResponse = responseGenerator.generate(true,"Error : Database Error",500,null);   
          res.send(myResponse); 
        }         

           else {        

          myResponse = responseGenerator.generate(false,"OK",200,myuser.cartInfo);        
          res.send(myResponse);      
          }
        });
    }
  });
});


// remove products from cart

myRouter.get('/delete/:_id',myauth.checkLogin,function(req,res) {  

    userModel.findOne({'email' : req.session.myuser.email},function(err,myuser){     

   if(err)        {         

   console.log(err);     
       myResponse = responseGenerator.generate(true,"Error : Database Error",500,null);      
      res.send(myResponse);  
    }     

   if(myuser==""||myuser==null||myuser==undefined)   {         

   myResponse = responseGenerator.generate(true,"Error : No Data Found",400,null);        
    res.send(myResponse);   
  }

else{        

  //recreating the cart array for user after removing the specified product     

     var cart = _.remove(myuser.cartInfo, function(n) {          
       return n != req.params.id;       
     });   

       myuser.cartInfo = cart;     
     myuser.save(function(err,myuser){       

     if(err)    {          

      myResponse = responseGenerator.generate(true,"Error : Database Error",500,null);       
         res.send(myResponse);  
       }          

     if(myuser==""||myuser==null||myuser==undefined)    {            

    myResponse = responseGenerator.generate(true,"Error : No User Data",500,null);          
      res.send(myResponse);    
       }         

     else      {             
     myResponse = responseGenerator.generate(true,"OK",200,customer.cartInfo);     
           res.send(myResponse);        
    }     

   }) ;

   }  

  }) ;

  });

app.use('/cart', myRouter);

}

module.exports.controllerFunction = function(app) {

myRouter.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

myRouter.get('/login/screen',function(req,res){
            
        res.render('mylogin');

}); // end get login screen

myRouter.get('/signup/screen',function(req,res){
            
    res.render('usersignup');
}); // end get signup screen 


myRouter.get('/dashboard',myauth.checkLogin,function(req,res){
    
        res.render('mydashboard',{myuser:req.session.myuser});
}); // end get dashboard

myRouter.get('/viewprod',function(req,res){

        res.render('viewproduct',{myuser:req.session.myuser});
});

myRouter.get('/create/screen',function(req,res){

        res.render('createproduct');
}); // end get create product screen


 myRouter.get('/logout',function(req,res){
      
      req.session.destroy(function(err) {

        res.redirect('/users/login/screen');

      })  

    });//end logout

 
 myRouter.post('/product/create',function(req,res){

      var newProduct = new prodModel({

          prodName : req.body.prodName,
          price    : req.body.price,
          ostype   : req.body.ostype,
          ram      : req.body.ram,
          weight   : req.body.weight,
          colour   : req.body.colour,
          modelNumber : req.body.modelNumber
       

      }); // end new Product

      // lets set all the features into an array

      var allFeatures = (req.body.allFeatures!=undefined && req.body.allFeatures!=null)?req.body.allFeatures.split(','):''
      newProduct.features = allFeatures;

      // sets all the comments into an array

      //var allComments = (req.body.allComments!=undefined && req.body.allComments!=null)?req.body.allComments.split(','):''
      //newProduct.comments = allComments;

      //set the date of product creation
      var today = Date.now();
      newProduct.createdon = today;

      // save the file

      newProduct.save(function(err){

        if (err){

          var myResponse = responseGenerator.generate(true,"some error occurred",500,null);
          res.render('error', {
                     message: myResponse.message,
                     error: myResponse.data
        });
      }

        else{

          var myResponse = {
                error: true,
                message: "Product is created",
                status: 200,
                data: newProduct
            };

          res.render('success', {
                     message: myResponse.message,
                     error: myResponse.data
              });
        }

      }); // end new product save

 }); // end route to create a new product

// route to get a particular product
myRouter.get('/products/:id',function(req, res) {

  prodModel.findOne({'_id':req.params.id},function(err,foundProd){
    if(err){
      console.log("some error");
      res.send(err);
    }
    else{
      //console.log(result);
      //res.send(result)
      req.session.myuser = foundProd;
      res.redirect('/users/viewprod');
    }


// start route to list all products

 myRouter.get('/products',function(req,res){

    prodModel.find({},function(err,result){

      if (err) {
        res.send(err);
      }

      else {
         
         res.send(result);
         
      }
    }); // end prod model find
 }); // end get products find


  });// end prod model find 
  
}); // // end route to get a particular product



// start route to edit a product

myRouter.put('/products/:id/edit',function(req,res){

  var update = req.body;
  prodModel.findOneAndUpdate({'_id':req.params.id},update,function(err,result){

    if (err)
    {
      console.log("Please update");
      res.send(err)
    }

    else
    {
      res.send(result);
      
    }
  });
}); // end route to edit a product using _id


// start route to delete a product using _id
myRouter.post('/products/:id/delete',function(req,res){

  prodModel.remove({'_id':req.params.id},function(err,result){

      if(err){
      console.log("some error");
      res.send(err)
    }
    else{
      res.send(result)
    }
  }); //end prod model find
}); // end delete

  myRouter.get('/all',function(req,res){
        userModel.find({},function(err,allUsers){
            if(err){                
                res.send(err);
            }
            else{

                res.send(allUsers);

            }

        });//end user model find 

    });//end get all users

  myRouter.get('/:userName/info',function(req,res){

        userModel.findOne({'userName':req.params.userName},function(err,foundUser){
            if(err){
                var myResponse = responseGenerator.generate(true,"some error"+err,500,null);
                res.send(myResponse);
            }
            else if(foundUser==null || foundUser==undefined || foundUser.userName==undefined){

                var myResponse = responseGenerator.generate(true,"user not found",404,null);
                //res.send(myResponse);
                res.render('error', {
                  message: myResponse.message,
                  error: myResponse.data
                });

            }
            else{

                  res.render('mydashboard', { myuser:foundUser  });

            }

        });// end find
      

    });//end get all users


// route for sign up
 myRouter.post('/signup',function(req,res){

 	if(req.body.firstName!=undefined && req.body.lastName!=undefined && req.body.email!=undefined && req.body.password!=undefined){

 		var newUser = new userModel({
 			       userName            : req.body.firstName+''+req.body.lastName,
             firstName           : req.body.firstName,
             lastName            : req.body.lastName,
             email               : req.body.email,
             mobileNumber        : req.body.mobileNumber,
             password            : req.body.password,
             //cartInfo            : req.body.cartInfo,
             resetPasswordToken  : req.body.resetPasswordToken
 		}); // end new user

 		newUser.save(function(err){
 			if (err) {

 				var myResponse = responseGenerator.generate(true,"some error"+err,500,null);
 				res.render('error', {
                     message: myResponse.message,
                     error: myResponse.data
 			});
 		}

 		else{
            //var myResponse = responseGenerator.generate(false,"successfully signup user",200,newUser);
            //res.send(myResponse);
 			      req.session.myuser = newUser;
            delete req.session.myuser.password;
            res.redirect('/users/dashboard')
 		}
 	}); // end new user save
 }

 else{

 	 var myResponse = {
                error: true,
                message: "Some body parameter is missing",
                status: 403,
                data: null
            };

            res.render('error', {
                     message: myResponse.message,
                     error: myResponse.data
              });
 }

}) // end signup screen

// route for login
 myRouter.post('/login',function(req,res){

        userModel.findOne({$and:[{'email':req.body.email},{'password':req.body.password}]},function(err,foundUser){
            if(err){
                var myResponse = responseGenerator.generate(true,"some error"+err,500,null);
                res.send(myResponse);
            }
            else if(foundUser==null || foundUser==undefined || foundUser.userName==undefined){

                var myResponse = responseGenerator.generate(true,"user not found. Check your email and password",404,null);
                //res.send(myResponse);
                res.render('error', {
                  message: myResponse.message,
                  error: myResponse.data
                });

            }
            else{

                  req.session.myuser = foundUser;
                   delete req.session.myuser.password;
                  res.redirect('/users/dashboard')

            }

        });// end find


    });//end get login screen


myRouter.get('/forgot',function(req,res){

  res.render('forgot',{
    myuser : req.myuser
  });
});


myRouter.post('/forgot', function(req, res, next) {
  require('async').waterfall([
    function(done) {
      crypto.randomBytes(20, function(err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function(token, done) {
      userModel.findOne({ email: req.body.email }, function(err, myuser) {
        if (!myuser) {
          req.flash('error', 'No account with that email address exists.');
          return res.redirect('/users/forgot');
        }

        myuser.resetPasswordToken = token;
        myuser.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        myuser.save(function(err) {
          done(err, token, myuser);
        });
      });
    },
    function(token, myuser, done) {
      var smtpTransport = nodemailer.createTransport("smtps://amitabhaghosh92@gmail.com:"+encodeURIComponent('Terror@5029')+"@smtp.gmail.com:465");
     
      var mailOptions = {
        to: myuser.email,
        from: 'passwordreset@demo.com',
        subject: 'Node.js Password Reset',
        text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'http://' + req.headers.host + '/reset/' + token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        req.flash('info', 'An e-mail has been sent to ' + myuser.email + ' with further instructions.');
        done(err, 'done');
      });
    }
  ], function(err) {
    if (err) return next(err);
    res.redirect('/users/forgot');
  });
});


myRouter.get('/reset/:token',function(req,res){

  userModel.findOne({resetPasswordToken : req.params.token, resetPasswordExpires : {$gt: Date.now()}}, function(err,myuser){

    if (!myuser) {
      req.flash('error','Password reset token is invalid or has expired.');
      return res.redirect('/forgot');
  }

  res.render('reset',{
    myuser : req.myuser
  });

});
}); // end get reset token


myRouter.post('/reset/:token',function(req,res){

  require('async').waterfall([
    function(done) {
      userModel.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, myuser) {
        if (!myuser) {
          req.flash('error', 'Password reset token is invalid or has expired.');
          return res.redirect('back');
        }

        myuser.password = req.body.password;
        myuser.resetPasswordToken = undefined;
        myuser.resetPasswordExpires = undefined;

        myuser.save(function(err) {
          req.logIn(myuser, function(err) {
            done(err, myuser);
          });
        });
      });
    },
    function(myuser, done) {
      var smtpTransport = nodemailer.createTransport("smtps://amitabhaghosh92@gmail.com:"+encodeURIComponent('Terror@5029') + "@smtp.gmail.com:465");
      
      var mailOptions = {
        to: myuser.email,
        from: 'passwordreset@demo.com',
        subject: 'Your password has been changed',
        text: 'Hello,\n\n' +
          'This is a confirmation that the password for your account ' + myuser.email + ' has just been changed.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        req.flash('success', 'Success! Your password has been changed.');
        done(err);
      });
    }
  ], function(err) {
    res.redirect('/');
  });
}); // end post reset token



app.use('/users', myRouter); // naming our api and making it global to app

} // end controller code
