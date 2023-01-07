const Song = require('../models/Song')
const User=require('../models/User')
const bcrypt=require('bcrypt')
const { multipleMongooseToObject } = require('../../util/mongoose')
const crypto= require('crypto')
const jwt=require('jsonwebtoken')
const secret="f00edb34692c85340b4366d53000f7a35980f4ee204d66369fe7ee4a1ee8a23e009fccde66faf851a58ff2edd62febf613436fb746218d7838fb45c257245e20"
function generateToken(user)
{
    return jwt.sign(JSON.stringify(user),secret,{});
}
class MeController {
    // [GET] /me/stored/songs
    async storedSongs(req, res, next) {
        if(req.query.i==undefined)
        {
            req.query.i=1;
        }
        console.log(req.query.i);
        let count=await Song.countDocuments({});
        let songs=await Song.find({}).skip((req.query.i-1)*20).limit(20);
        let deletedCount=await Song.countDocumentsDeleted();
        console.log(songs[0]);
        res.render('me/stored-songs', {
            deletedCount,
            songs: multipleMongooseToObject(songs),
            count:count
        })
    }

    async storedUsers(req,res,next)
    {
        if(req.query.i==undefined)
        {
            req.query.i=1;
        }
        let count=await User.countDocuments({});
       let users=await User.find({}).skip((req.query.i-1)*20).limit(20);
       let deletedCount=await User.countDocumentsDeleted();
        res.render('me/stored-users', {
            deletedCount,
            users: multipleMongooseToObject(users),
            count:count
        })
    }

    async handleFormActions(req, res, next) {
        switch (req.body.action) {
            case 'delete':
                for(let item of req.body.userIds)
                {
                    let random= await User.deleteOne({ _id:item})
                }
                res.redirect('back');
                break;
            default:
                res.json({ message: 'Action is invalid!' })
        }
    }

    forceDestroy(req, res, next) {
        User.deleteOne({ _id: req.params.id })
            .then(() => res.redirect('back'))
            .catch(next)
    }

    // [GET] /me/trash/songs
    trashSongs(req, res, next) {
        Song.findDeleted({})
            .then(songs => res.render('me/trash-songs', {
                songs: multipleMongooseToObject(songs)
            }))
            .catch(next)
    }
    sign_in(req,res,next)
    {
        res.render('me/sign-in')
    }
    sign_up(req,res,next)
    {
        res.render('me/sign-up')
    }
    signup(req,res,next)
    {
        if(req.body.fullname==null || req.body.fullname=="")
        {
            res.status(400).send({message:"Missing field(s)"});
            console.log(req.body);
            return;
        }
        if(req.body.password.localeCompare(req.body.password_confirmation)!=0)
        {
            res.status(401).send({message:"Confirmation password do not match with password"});
            console.log(req.body);
            return;
        }
        if(!req.body.email.match(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        ))
        {
            res.status(402).send({message:"Invalid email address"});
            console.log(req.body);
            return;
        }
        User.findOne({email:req.body.email}, function(err,result)
        {
            if (err)
            {
                console.log(err);
            }
            if(result)
            {
                res.status(403).send({message: 'Tai khoan ton tai'});
            }
            else
            {
                bcrypt.hash(req.body.password, 10, function(err,hashedPass)
                {
                    if(err)
                    {
                        console.log(err)
                    }
                    else
                    {
                        req.body.password=hashedPass
                        req.body.image="https://img.lovepik.com/free-png/20210922/lovepik-hand-painted-cartoon-male-head-png-image_401073216_wh1200.png";
                        const user=new User(req.body);
                        console.log(user);
                        let usertoken=generateToken(user);
                        res.status(200).send({message:usertoken});
                        user.save()
                        .catch(next)
                        
                    }
                })
            }
        })
    }
    signin(req,res,next)
    {
        var password = req.body.password
        User.findOne({email:req.body.email}, function(err,user)
        {
            if(err)
            {
                res.status(400).send({message:err});
            }
            if (user)
            {
                bcrypt.compare(password,user.password ,function(err,result2)
                {
                if(err)
                {
                    res.status(400).send({message:err});
                }
                if(result2)
                {
                    let usertoken=generateToken(user);
                    res.status(200).send({message:usertoken});
                }
                else
                {
                    res.status(401).send({message:"wrong password"});
                }
                })
            }
            else
            {
                res.status(403).send({message:"Tai khoan khong ton tai"});
            }
        })
    }
    async user(req,res,next)
    {
        let songlist=[];
        let user= await User.findOne({_id:req.params.userid});
        for(let i=0;i<user.favorite_songs.length;i++)
        {
            let song= await Song.findOne({_id:user.favorite_songs[i]}).lean();
            songlist.push(song);
            /*.then(song=>{
                console.log("Push");
                songlist.push(song);
            })*/
        }
        res.render("me/user",{songlist:songlist});
 
    }
    authen(req,res,next)
    {
        const decoded=jwt.verify(req.body.token,secret);
        User.findOne({email:decoded.email}, function(err,user)
        {
            if(err)
            {
                res.status(400).send({message:err});
            }
            if (user)
            {
                    if(decoded.password.localeCompare(user.password)==0)
                    {
                        res.status(200).send({user:user});
                    }
                    else
                    {
                        res.status(400).send({message:"wrong password"});
                    }
            }
            else
            {
                res.status(404).send({message:"Tai khoan khong ton tai"});
            }
        })
    }

    update(req,res,next)
    {
        const userinfo=req.body;
        User.findOneAndReplace({email:userinfo.email},userinfo,{new:true}, function(err,result)
        {
            if(err)
            {
                res.status(400).send({message:err});
            }
            else
            {
                console.log(result);
                let user=generateToken(result);
                res.status(200).send({message:"Update successful",user:user});
            }
        })
    }

    comment(req,res,next)
    {
        const userinfo=jwt.verify(req.body.token,secret);
        User.findOne({_id:userinfo._id},function(err,result)
        {
            if(err)
            {
                res.status(400).send({message:err});
            }
            if(result)
            {
                const songid=req.body.songid;
                const cmt=req.body.comment;
                Song.findOne({_id:songid},async function(err,result2)
                {
                    if(err)
                    {
                        res.status(400).send({message:err});
                    }
                    if(result2)
                    {
                        let now=new Date();
                        let temp={name:result.fullname,email:result.email,comment:cmt,cmtdate:now};
                        result2.comments.unshift(temp);
                        await result2.save();
                        res.status(200).send({date:now.toString()});
                    }
                })
            }
        })
    }
    delcmt(req,res,next)
    {
        const userinfo=jwt.verify(req.body.token,secret);
        User.findOne({_id:userinfo._id},function(err,result)
        {
            if(err)
            {
                console.log(err);
                res.status(400).send({message:err});
            }
            if(result)
            {
                if(result.fullname!=req.body.name)
                {
                    res.status(400).send({message:"not authorized"});
                }
                Song.findOne({_id:req.body.songid}, async function(err,result2)
                {
                    if(err)
                    {
                        console.log(err);
                        res.status(400).send({message:err});
                        return;
                    }
                    if(result2)
                    {
                        let temp=result2.comments.filter(function(obj){return obj.cmtdate!=req.body.time});
                        result2.comments=temp;
                        await result2.save();
                        console.log("deleted");
                        res.status(200).send({message:'deleted'});
                    }
                    else
                    {
                        console.log("no song");
                    }
                })
            }
            else
            {
                console.log("no user");
            }
        })
    }
}

module.exports = new MeController();
