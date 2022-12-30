const Song = require('../models/Song')
const User=require('../models/User')
const { mongooseToObject } = require('../../util/mongoose')
var randnum = 0;
class SongController {

    async show(req, res, next) {
        let randlist=[];
        let randnumlist=[];
        let songCount= await Song.countDocuments({});
        let arr=Array.from(Array(songCount).keys());
        for (let i=0;i<6;i++)
        {   
                randnum=Math.floor(Math.random() * songCount-i);
                randnumlist.push(...arr.splice(randnum,1));
                let randsong1= await Song.findOne({}).skip(randnumlist[i]).lean();
                randlist.push(randsong1);
        }
        Song.findOne({ slug: req.params.slug })
            .then(song => {
                res.render('songs/show', 
                { 
                    song: mongooseToObject(song),
                    randlist: randlist
                })
            })
            .catch(next)
    }

    async playlist(req, res, next) {
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
        let song1=await Song.findOne({_id:req.params.id}).lean();
        for(let i=0;i<user.favorite_songs.length;i++)
        {
            if(JSON.stringify(songlist[i])==JSON.stringify(song1))
            {
                songlist.push(...songlist.splice(0,i+1));
            }
        }
        res.render("songs/playlist",{song:song1,songlist:songlist,userid:{id:req.params.userid}});
    }

    // [GET] /song/create
    create(req, res, next) {
        res.render('songs/create')
    }

    // [POST] /songs/store
    store(req, res, next) {
        const song = new Song(req.body)
        song.save()
            .then(() => res.redirect('/me/stored/songs'))
            .catch(next)
    }

    // [GET] /songs/:id/edit
    edit(req, res, next) {
        Song.findById(req.params.id)
            .then(song => res.render('songs/edit', {
                song: mongooseToObject(song)
            }))
            .catch(next)
    }

    // [PUT] /songs/:id
    update(req, res, next) {
        Song.updateOne({ _id: req.params.id }, req.body)
            .then(() => res.redirect('/me/stored/songs'))
            .catch(next)
    }

    // [DELETE] /songs/:id
    destroy(req, res, next) {
        Song.delete({ _id: req.params.id })
            .then(() => res.redirect('back'))
            .catch(next)
    }

    // [DELETE] /songs/:id/force
    async forceDestroy(req, res, next) {
        let smt1=await Song.deleteOne({ _id: req.params.id });
        User.find({favorite_songs:req.params.id},async function(err,users)
        {
            for(let user of users)
            {
                console.log(user.email);
                console.log(user.favorite_songs.indexOf(req.params.id));
                user.favorite_songs.splice(user.favorite_songs.indexOf(req.params.id),1);
                let smt=await User.findOneAndUpdate({_id:user._id},user);
            }
        })
        res.redirect('back')
    }

    // [PATCH] /songs/:id/restore
    restore(req, res, next) {
        Song.restore({ _id: req.params.id })
            .then(() => res.redirect('back'))
            .catch(next)
    }

    // [POST] /songs/handle-form-actions
    handleFormActions(req, res, next) {
        switch (req.body.action) {
            case 'delete':
                Song.delete({ _id: { $in: req.body.songIds } })
                    .then(() => res.redirect('back'))
                    .catch(next)
                break
            default:
                res.json({ message: 'Action is invalid!' })
        }
    }
}

module.exports = new SongController();
