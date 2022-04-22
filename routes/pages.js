const express = require('express');
const session = require('express-session');
const path = require('path');
const { resolve } = require('path');
const { append } = require('express/lib/response');
const { Verify } = require('crypto');
const router = express.Router();
const multer = require('multer');
const db = require('../connectMySql');
const { Router } = require('express');
const { Console } = require('console');
const bcrypt = require('bcryptjs');
const { createBrotliDecompress } = require('zlib');

//Apply for vacancy
router.post('/apply', (req,res)=>{
    const {id} = req.body;

    if(!req.session.studentName){
        res.redirect('/login');

    }else{

        db.query('SELECT * FROM vacancies WHERE id =?',[id],async(error,result)=>{

            if(error) throw error

            let propdetail = [];
            propdetail = result;

            propdetail.forEach(data=>{

                db.query('INSERT INTO applications SET?',{

                    studentName:req.session.studentName,
                    proprietor:data.proprietor,
                    paymentStatus:'UNPAID',
                    price:data.price,
                    wifi:data.wifi,
                    geyser:data.geyser,
                    solar:data.solar,
                    fridge:data.fridge,
                    gas:data.gas,
                    phoneNumber:data.phoneNumber,
                    vacancyId:id
                },(error)=>{
                    if(error) throw error

                    db.query('UPDATE VACANCIES SET number = number-1 WHERE id=?',[id],async(error)=>{
                      
                        res.redirect('/vacancies')
                    })

                   
                })
            })
        })      
    }
})


//View Applications

router.get('/viewApplications',(req,res)=>{

    if(!studentName){
        res.redirect('/login');
    }else{

        let applicant = studentName;

        db.query('SELECT * FROM applications WHERE studentName = ?',[applicant],async(error,result)=>{
    
            if(error) throw error;
    
            let vacs = [];
            vacs = result;
    
        res.render('studentApplications',{vacs,loggedIn:''});
    
        })

    }

 

})


//VIEW TENANTS

router.get('/tenants',(req,res)=>{
    const proprietorName = req.session.proprietorName;

    db.query('SELECT * FROM tenants WHERE proprietor = ?',[proprietorName],async(error,result)=>{

        if(error) throw error

        let tenants = [];
        tenants = result;

        res.render('tenants',{tenants,Message:''});


    })
})

//View APPLICATIONS - PROPRIETORS
router.get('/viewApplicants',(req,res)=>{
    if(!req.session.proprietorName){
        res.redirect('/login');
    }
    else
    {
        db.query('SELECT * FROM applications WHERE proprietor =?',[req.session.proprietorName],async(error,result)=>{
            if(error) throw error;

            let applications = [];
            applications = result;

            res.render('applications',{applications,Message:''});
        })

    }



})

//DENY APPLICANT
router.post('/deny',(req,res)=>{
    const id = req.body.appid;

    db.query('SELECT * FROM applications WHERE id =?',[id],async(error,result)=>{
        if(error) throw error;

        let vacancyId = result[0].vacancyId;
        db.query('UPDATE vacancies SET number = number+1 WHERE id = ?',[vacancyId],async(error,result)=>{
            if(error) throw error;

            db.query('DELETE FROM applications WHERE id =?',[id],async(error,result)=>{
                if(error) throw error;

                res.redirect('/viewApplicants')
            })

        })
    })

})


//View own applications - student dashboard
router.get('/myApplications',(req,res)=>{

    if(!req.session.studentName){
        res.redirect('/login');
    }else{

        db.query('SELECT * FROM applications WHERE studentName = ?',[req.session.studentName],async(error,result)=>{
            if(error) throw error;

            let apps = [];
            apps = result;

            res.render('studapps',{apps,Message:''});

        })

    }
})

//Cancel application
router.post('/cancelApplication',(req,res)=>{
    const id = req.body.id;
    
    db.query('DELETE FROM applications WHERE id =?',[id],async(error)=>{
        if(error) throw error;

        res.redirect('/myApplications');
    })


})

//DENY VACANCY APPLICATION

router.get('/deny/:id',(req,res)=>{
    const proprietorName = req.session.username;
const id = req.params.id;
db.query('SELECT * FROM applications WHERE id = ?',[id],async(error,result)=>{
    if(error) throw error
    let details = [];
    details = result;
    details.forEach(element=>{
        db.query('UPDATE vacancies SET number =number+1 WHERE proprietor =?',[element.proprietor],async(error,result)=>{
            if(error) throw error
            db.query('DELETE FROM applications WHERE id = ?',[id],async(error,result)=>{
                if(error) throw error
                db.query('SELECT * from applications WHERE proprietor =?',[proprietorName],(error,result)=>{
                    if(error) throw error
                    let applications = [];
                    applications = result;
                    res.render('applications',{applications,Message:'Application Denied'});
                })
            
            })
        })
    })
})





})



//One Register
router.post('/oneRegistration',(req,res)=>{

    const{fullname,address,phoneNumber,email,password,confirmpassword,username,proprietor} = req.body;

    //checking if username already exists

    db.query('SELECT * FROM users WHERE username = ?',[username],async(error,result)=>{

        if(error) throw error

        if(result.length==1)
        
        {
            
            res.render('proprietorregistration',{Message:'Username already exists!'}); //works
        }

        else if(result.length==0)
        
        {

            db.query('SELECT * FROM proprietors WHERE username = ?',[username],async(error,result)=>{

                if(error) throw error

                if(result.length ==1)
                
                {
                    res.render('proprietorregistration',{Message:'Username already exists'}); //works
                }

                else if(proprietor==='on'){
                    
                    if(password === confirmpassword){

                        let hashedPassword = bcrypt.hashSync(password,10);

                        db.query('INSERT INTO proprietors SET?',{fullname,address,phoneNumber,email,password:hashedPassword,username,proprietor},async(error,result)=>{
                            if(error) throw error

                            res.render('studentlogin',{Message:'Successfully Registered,Login Now!'})
                        })


                    }else{
                        res.render('proprietorregistration',{Message:'Password do not match'});
                    }
                }


                else{
                    if(password === confirmpassword){
                        let hashedPassword = bcrypt.hashSync(password,10);
                        db.query('INSERT INTO users SET ?',{fullname,address,phoneNumber,email,password:hashedPassword,username},async(error,result)=>{
                            if(error) throw error

                            res.redirect('/login');
                        })
                    }
                }


            })

        }
      
    })

})

//Student Offer
router.get('/offers',(req,res)=>{

    if(!req.session.studentName){
        res.redirect('/login')
    }else{
        db.query('SELECT * FROM tenants WHERE studentName=?',[req.session.studentName],async(error,result)=>{
            if(error) throw error;

            if(result.length>0){

                let offersOne = [];
                offersOne = result;
    
                offersOne.forEach(data=>{
                    db.query('SELECT * FROM vacancies WHERE id =?',[data.vacancyId],async(error,result)=>{
    
                        if(error) throw error;
    
                        if(result.length>0){
                            let offers = [];
                            offers = result;
                            
                            res.render('offers',{offers,loggedIn:'Logout',dash:'Dashboard',Message:''});
        
                        }else{
    
                            let offers = [];
                            offers = result;
                            
                            res.render('offers',{offers,loggedIn:'Logout',dash:'Dashboard',Message:'No Offers Yet'});
        
    
                        }
    
                       
                    })
                })


            }else{

                res.render('offers',{offers:[],loggedIn:'Logout',dash:'Dashboard',Message:'No Offers Yet'});

            }

 

        })
    }
})

//admin reg
router.get('/adm',(req,res)=>{
    res.render('adm');
});

router.post('/adm',(req,res)=>{
    const {username,password} = req.body;
    let hashedPassword = bcrypt.hashSync(password,10);

    db.query('INSERT INTO admin SET?',{username:username,password:hashedPassword},async(error)=>{
        if(error) throw error

        res.redirect('/login');
    })

})


//Accept offer
router.get('/acceptoffer',(req,res)=>{

    res.render('payment');


});


//deny offer
router.post('/denyoffer',(req,res)=>{

    const vcid = req.body.vacid;

    db.query('UPDATE vacancies SET number = number + 1 WHERE id =?',[vcid],async(error)=>{

        if(error) throw error;

        db.query('DELETE FROM tenants WHERE vacancyId =?',[vcid],async(error)=>{

            if(error) throw error;

            res.redirect('/offers');


        })

    })

  



});



router.get('/studentdash',(req,res)=>{
    res.render('studentdash',{Message:''});
})

//Login For All

router.post('/login',(req,res)=>{

    const{username,password} = req.body;
 

    //Students (users)
    db.query('SELECT username,password FROM users WHERE username =?',[username],async(error,result)=>{
        if(error) throw error

        if(result.length==1){

            let verify = bcrypt.compareSync(password,result[0].password);

            if(verify){

                req.session.studentName = username;
                db.query('SELECT * FROM vacancies WHERE number > 0',(error,result)=>{
                    if(error) throw error
                    let vacs = [];
                    vacs = result;
                    res.render('index',{Message:'',vacs,loggedIn:'Logout',dash:'Dashboard'});
                })
    
    
            }else{
                res.render('studentlogin',{Message:'Account not found!'});
            }



        } else {
            //Proprietors
            db.query('SELECT username,password FROM proprietors WHERE username =?',[username],async(error,result)=>{
                if(error) throw error;

                if(result.length==1){
                    let verify = bcrypt.compareSync(password,result[0].password);

                    if(verify){

                        req.session.proprietorName = username;
    
                        db.query('SELECT COUNT(*) AS tentcount FROM tenants WHERE proprietor =?',[req.session.proprietorName],async(error,result)=>{
            
                            if(error) throw error
            
                            let tentcount = result[0].tentcount;
            
            
            
                            db.query('SELECT COUNT(*) AS vaccount FROM vacancies WHERE proprietor = ?',[req.session.proprietorName],async(error,result)=>{
            
                            
                                if(error) throw error
                                let vaccount = result[0].vaccount;
              
            
            
                                db.query('SELECT COUNT(*) AS appcount FROM applications WHERE proprietor =?',[req.session.proprietorName],async(error,result)=>{
            
                                if(error) throw error
            
            
                                  let appcount = result[0].appcount;
                                  let propname = req.session.proprietorName;
            
            
            
                                  return res.render('proprietordash',{Message:'Proprietor:'+ username,tentcount,vaccount,appcount,propname}); 
            
                                })
                            })
                        })
    
    
                    }else{
                        res.render('studentlogin',{Message:'Account not found!'});
                    }


                }

else{

                    //Administrators

                    db.query('SELECT username,password FROM admin WHERE username =?',[username],async(error,result)=>{
                        if(error) throw error;

                        if(result.length==1){
                            let verify = bcrypt.compareSync(password,result[0].password);

                            
                        if(verify){

                            req.session.adminName = username;

                            db.query('SELECT COUNT(*) AS studs FROM users',(error,result)=>{
                                if(error) throw error
                
                                let studs = result[0].studs;
                
                                db.query('SELECT COUNT(*) AS props FROM proprietors',(error,result)=>{
                
                                    let props = result[0].props;
                
                                    db.query('SELECT COUNT(*) AS vacs FROM vacancies',(error,result)=>{
                           
                                        let vacs = result[0].vacs;
                
                                        adminName = req.session.adminName;        
                
                                        res.render('adminp',{studs,props,vacs,adminName});
                
                                    })              
                
                                })

                            })

                        }else{
                            res.render('studentlogin',{Message:'Account not found!'});
                        }



                        }

                  

else{
                            res.render('studentlogin',{Message:'Account not found!'});
                        }
                    })
                }
            })
        }
    })


})



//VIEW APPLICATIONS
router.get('/applications',(req,res)=>{

    const proprietorName = req.session.proprietorName;
  

    db.query('SELECT * FROM applications WHERE proprietor = ?',[proprietorName],(error,results)=>{

        if(error){
            console.log(error);
        }
        else{
            let applications = [];
            applications = results;
            res.render('applications',{applications,Message:''});
        }
    })
   
});


//Request Payment

router.get('/requestPayment/:id',(req,res)=>{
    const proprietorName = req.session.proprietorName;

    const id = req.params.id;

    db.query('UPDATE applications SET paymentStatus = "Requested" WHERE id = ?',[id],(error,result)=>{


        if(error) throw error

        db.query('SELECT * FROM applications WHERE proprietor = ?',[proprietorName],(error,results)=>{

            if(error){
                console.log(error);
            }
            else{
                let applications = [];
                applications = results;
                res.render('applications',{applications,Message:''});
            }
        })




    })
})

//DISMISS TENANT
router.post('/dismiss',(req,res)=>{
    const id = req.body.id;

    db.query('SELECT * FROM tenants WHERE id =?',[id],async(error,result)=>{
        if(error) throw error;
        let vacancyId = result[0].vacancyId;

        db.query('UPDATE vacancies SET number = number + 1 WHERE id=?',[vacancyId],async(error)=>{
            if(error) throw error;

            db.query('DELETE FROM tenants WHERE id =?',[id],async(error)=>{
                if(error) throw error;

                res.redirect('/tenants');
            })
        })
    })



})

//View Prop Dash
router.get('/propdash',(req,res)=>{

    res.redirect('/');
});



//APPROVING TENANTS INTO VACANCIES
router.post('/addtenant',(req,res)=>{
    const id = req.body.id;

    db.query('SELECT * FROM applications WHERE id=?',[id],async(error,result)=>{
        if(error) throw error;

        let applicant = [];
        applicant = result;

        applicant.forEach(data=>{
            db.query('INSERT INTO tenants SET?',{

                studentName:data.studentName,
                proprietor:data.proprietor,
                vacancyId:data.vacancyId
            },(error)=>{
                if(error) throw error

                db.query('DELETE FROM applications WHERE id =?',[id],async(error,result)=>{
                    if(error) throw error;

                    res.redirect('/applications')
                })
            })
        })


    })


})



//GENERAL ROUTES------------------------

router.get('/',(req,res,next)=>{
    db.query('SELECT * FROM vacancies WHERE number > 0',async(error,result)=>{
        if(error) throw error  
         let vacs = [];
        vacs = result;     
        res.render('index',{Message:'',dash:'',vacs,loggedIn:'Login'});
    })
    
});//-----------Home Route


//Search Route
router.post('/search',(req,res)=>{
let maxPrice = req.body.maxPrice;
let gender = req.body.gender;

db.query('SELECT * FROM vacancies where gender = ? AND number > 0 AND price BETWEEN 0 AND ?',[gender,maxPrice],async(error,result)=>{
    if(error) throw error
        const vacs = await result;
        let notFound = [];
        notFound = result;      
        if(notFound.length==0){
            res.render('notfound',{loggedIn:'Login',dash:''});
        }else{            
        res.render('result',{vacs,Message:'Search Results',loggedIn:'Login',dash:''});
        }
})
})

//View Vacant
router.post('/viewvac',(req,res)=>{
    const{vacid} = req.body;  
    db.query('SELECT * FROM vacancies WHERE id =?',[vacid],async(error,result)=>{
        if(error) throw error
        let vac = [];
        vac = result;
        return res.render('vacdetail',{vac,loggedIn:'Login',dash:''});
    })
})



router.get('/vacancies',(req,res)=>{
    db.query('SELECT * FROM vacancies WHERE number >0',(error,result)=>{
        if(error) throw error;

        if(req.session.studentName){
            let loggedIn = 'Logout';
            let vacs = [];
            vacs = result;
 
    
            res.render('vacancies',{loggedIn,dash:'',vacs,Message:''});
        }else{

            loggedIn = 'Login';
            let vacs = [];
            vacs = result;
     
    
            res.render('vacancies',{loggedIn,dash:'',vacs,Message:''});
        }



    })

});


//One Login 
router.get('/login',(req,res)=>{
    res.render('studentlogin',{Message:''});
});

router.get('/addVacant',(req,res)=>{
    res.render('addVacant',{Message:'',Result:'',errmsg:''});
});



router.get('/prop',(req,res)=>{
    res.render('proprietorlogin',{Message:''});
})


router.get('/studreg',(req,res)=>{
    res.render('studentregistration',{Message:''});
})

router.get('/register',(req,res)=>{
    res.render('proprietorregistration',{Message:''});
});



//GET VACANCIES
router.get('/getvacancies',(req,res)=>{
    db.query('SELECT * FROM vacancies',(error,result)=>{
        if(error) throw error
        let adminname = adm;

        const vacancies = result;
        res.render('adminvacancies',{adminname,vacancies});

    });
});

//Manage Vacancy

router.get('/vacancies/:id',(req,res)=>{
    const id = req.params.id;
    
    db.query('SELECT * from vacancies WHERE id =?',[id],async(error,results)=>{
            if(error){
            console.log(error);
        }
      const vacancies = results;
      let adminname = adm;
      

        res.render('vacdetail',{adminname,vacancies,Message:''});
    })
})

//View Proprietors
router.get('/getproprietors?',(req,res)=>{
    db.query('SELECT * FROM proprietors',async(error,result)=>{
        if(error) throw error;

        let proprietors = [];
        proprietors = result;

        res.render('adminproprietors',{proprietors});

    })
})




//Upload Documents

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "files");
    },
    filename: function (req, file, cb) {
      cb(null, req.session.proprietorName + "_"+ file.fieldname + path.extname(file.originalname));
    },
  });
  
  var upload = multer({ storage: storage });
  var uploadMultiple = upload.fields([{ name: 'pictureOne', maxCount: 10 }, { name: 'pictureTwo', maxCount: 10 }])



router.post('/addVacant',uploadMultiple,(req,res)=>{
    const{number,gender,price,wifi,geyser,solar,fridge,gas} = req.body;
    const proprietorName = req.session.proprietorName;

    if(!req.session.proprietorName){
        res.redirect('/login');
    }else{
        db.query('SELECT phoneNumber FROM proprietors WHERE username = ?',[proprietorName],async (error,results)=>{

            if(error) throw error;
            let phone = [];
            phone = results;
            
            phone.forEach(element => {
                
        db.query('INSERT INTO vacancies SET?',{number,gender,price,wifi,geyser,solar,fridge,gas,proprietor:proprietorName,phoneNumber:element.phoneNumber},async(error)=>{
            if(error){
                console.log(error);
            } else{
               
                return res.render('addVacant',{Result:'Vacant Added Successfully',Message:'',errmsg:''});
    
            }
                
            });
           
    
        })
          
        })

    }
    
     
    
       
})

router.get('/viewvacs',(req,res)=>{

db.query('SELECT * FROM vacancies WHERE proprietor =?',[req.session.proprietorName],async(error,result)=>{

    if(error) throw error

    let vacs = [];
    vacs = result;
    
    res.render('propvacancies',{vacs});
})


})


//dash
router.get('/dash',(req,res)=>{

    db.query('SELECT COUNT(*) AS studs FROM users',(error,result)=>{
        if(error) throw error

        let studs = result[0].studs;

        db.query('SELECT COUNT(*) AS props FROM proprietors',(error,result)=>{

            let props = result[0].props;

            db.query('SELECT COUNT(*) AS vacs FROM vacancies',(error,result)=>{
   
                let vacs = result[0].vacs;

                adminName = req.session.adminName;        

                res.render('adminp',{studs,props,vacs,adminName});

            })              

        })

    })

    
})


//view vacancies of each proprietor -admin
router.post('/propvacs',(req,res)=>{
    const {username} = req.body;

    db.query('SELECT * FROM vacancies WHERE proprietor =?',[username],async(error,result)=>{
        if(error) throw error;

        if(result.length==0){
            let rs = 'No Vacancies';
            let propvacs = [];
            res.render('adminvacancies',{propvacs,Message:rs});
        }else{
            
        let propvacs = [];
        propvacs = result;
        res.render('adminvacancies',{propvacs,Message:''});


        }



      
    })

    


})

//delete own vacancy

router.post('/deletevac',(req,res)=>{

    const id = req.body.vacid;

    db.query('DELETE FROM vacancies WHERE id= ?',[id],async(error)=>{
        if(error) throw error

        res.redirect('/viewvacs');
    })



})


//Signout
router.get('/signout',(req,res)=>{      
    db.query('SELECT * FROM vacancies WHERE number > 0',(error,result)=>{

        if(error) throw error

        let vacs = [];
        vacs =result;
        res.render('index',{Message:'Successully Logged Out',dash:'',vacs,loggedIn:'Login'});
    })

});

module.exports = router;