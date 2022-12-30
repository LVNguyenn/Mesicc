const Song = require('../models/Song')
const User=require('../models/User')
const { multipleMongooseToObject } = require('../../util/mongoose')
const crypto= require('crypto')
const jwt=require('jsonwebtoken')
const secret="f00edb34692c85340b4366d53000f7a35980f4ee204d66369fe7ee4a1ee8a23e009fccde66faf851a58ff2edd62febf613436fb746218d7838fb45c257245e20"
const bcrypt=require('bcrypt')
function verifytoken(res,token)
{
    const decoded=jwt.verify(token,secret);
    console.log(decoded);

    User.findOne({email:decoded.email}, function(err,user)
        {
            if(err)
            {
              console.log("error")
            }
            if (user)
            {
                bcrypt.hash(user.password,10,function(err,result)
                {
                  bcrypt.compare(decoded.password,result,function(err,result2)
                  {
                  if(err)
                  {
                    console.log("not ok")
                    res.status(200).send({permission:'none'})
                  }
                  if(result)
                  {
                    res.status(200).send({permission:user.admin})
                  }
                  else
                  {
                    console.log("err");
                    res.status(200).send({permission:'none'})
                  }
                  })
                });

            }
            else
            {
              console.log("not")
              res.status(200).send({permission:'none'})
            }
        })
}

class SiteController {
  // [GET] /
  login(req, res, next) {
    const decoded=jwt.verify(req.body.token,secret);
    User.findOne({email:decoded.email}, function(err,user)
    {
      if(err)
      {
      }
      if (user)
      {
          bcrypt.hash(user.password,10,function(err,result)
          {
            bcrypt.compare(decoded.password,result,function(err,result2)
            {
            if(err)
            {
            }
            if(result)
            {
              if(user.admin==false)
              {
                res.status(200).send({message:'userdropdown'});
              }
              else
              {
                res.status(200).send({message:'admindropdown'});
              }
            }
            else
            {
              res.status(200).send({message:'LogResButton'});
            }
            })
          });

      }
      else
      {
      }
    })
  }
  async index(req,res,next)
  {
    if(req.query.i==undefined)
    {
      req.query.i=1;
    }
    let count=await Song.countDocuments({});
    Song.find({}).skip((req.query.i-1)*12).limit(12)
      .then(songs => {
        res.render('home', {
          songs: multipleMongooseToObject(songs),
          count:count,
        })

      })
      .catch(next)
  }
  // [GET] /search
  async search(req, res,next) {
    let q = req.query.q;
    let reqtype=req.query.type;
    console.log(req.query.i);
    if(req.query.i==undefined)
    {
      req.query.i=1;
    }
    let index=req.query.i;
    let temp= await Song.find({});
    let songss=multipleMongooseToObject(temp);
    let type=[];
    for(let i=0;i<temp.length;i++)
    {
      type.push(temp[i].type);
    }
    let type1=[];
    let type_temp =[...new Set(type)];
    for (let i = 0; i < type_temp.length; i++) {
      let temp={};
      temp.name=type_temp[i];
      temp.value=type_temp[i];
      type1.push(temp);
    }
    if((reqtype==null || reqtype==""||reqtype==undefined) && (q==null||q==""||q==undefined))
    {
      let count=songss.length;
      let songs=songss.slice((index-1)*12,(index)*12);
      res.render('search', {
        songs: songs,
        types: type1,
        count:count
      })
    }
    else if(reqtype==null || reqtype==""||reqtype==undefined)
    {
      for (let i = 0; i < songss.length; i++) {
        if (songss[i].name.toLowerCase().indexOf(q.toLowerCase()) == -1) {
          songss.splice(i, 1);
          i--;
        }
      }
      let count=songss.length;
      let songs=songss.slice((index-1)*12,(index)*12);
      res.render('search', {
        songs: songs,
        types: type1,
        count:count
      })
    }
    else if(q==null||q==""||q==undefined)
    {
      for (let i = 0; i < songss.length; i++) {
        if (songss[i].type != reqtype) {
          songss.splice(i, 1);
          i--;
        }
      }
      let count=songss.length;
      let songs=songss.slice((index-1)*12,(index)*12);
      res.render('search', {
        songs: songs,
        types: type1,
        count:count
      })
    }
    else
    {
      for (let i = 0; i < songss.length; i++) {
        if (songss[i].name.toLowerCase().indexOf(q.toLowerCase()) == -1) {
          songss.splice(i, 1);
          i--;
        }
        else
        {
          if (songss[i].type != reqtype) {
            songss.splice(i, 1);
            i--;
          }
        }
      }
      let count=songss.length;
      let songs=songss.slice((index-1)*12,(index)*12);
      res.render('search', {
        songs: songs,
        types: type1,
        count:count
      })
    }
  }
}

module.exports = new SiteController();
