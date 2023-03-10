// import les "fs" et le models des sauces
const modelsSauces = require('../models/sauces');
const fs = require('fs');


// creation de sauce
exports.creationSauce = (req, res, next) => {
  // intercep les données de l'objet crée
  const objetSauce = JSON.parse(req.body.sauce);
  delete objetSauce._id;
  delete objetSauce._userId;
  const sauce = new modelsSauces({
      ...objetSauce,
      userId: req.auth.userId,
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  });

  // sauvegarde la sauce dans la base de donnée
  sauce.save()
  .then(() => { res.status(201).json({message: 'Objet enregistré !'})})
  .catch(error => { res.status(400).json( { error })})
  };


// Recuperation d'une sauce
exports.recupUneSauce = (req, res, next) => {
  modelsSauces.findOne({ _id: req.params.id })
      .then(sauce => res.status(200).json(sauce))
      .catch(error => res.status(404).json({ error }));
  };


// modification de la sauce
  exports.modifiSauce = (req, res, next) => {
    const objetSauce = req.file ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };
    delete objetSauce._userId;
    modelsSauces.findOne({_id: req.params.id})
        .then((sauce) => {
            if (sauce.userId != req.auth.userId) {
                res.status(401).json({ message : 'Not authorized'});
            } else {
              modelsSauces.updateOne({ _id: req.params.id}, { ...objetSauce, _id: req.params.id})
                .then(() => res.status(200).json({message : 'Objet modifié!'}))
                .catch(error => res.status(401).json({ error }));
            }
        })
        .catch((error) => {
            res.status(400).json({ error });
        });
 };


// suppresison de la sauce
 exports.SuppressionSauce = (req, res, next) => {
  modelsSauces.findOne({ _id: req.params.id})
      .then(sauce => {
          if (sauce.userId != req.auth.userId) {
              res.status(401).json({message: 'Not authorized'});
          } else {
              const nomDeFichier = sauce.imageUrl.split('/images/')[1];
              fs.unlink(`images/${nomDeFichier}`, (error) => {
                console.log(error);
                modelsSauces.deleteOne({_id: req.params.id})
                      .then(() => { res.status(200).json({message: 'Objet supprimé !'})})
                      .catch(error => res.status(401).json({ error }));
              });
          }
      })
      .catch( error => {
          res.status(500).json({ error });
      });
};



// recuparation de toutes les sauces
exports.recupToutesSauces = (req, res, next) => {
    modelsSauces.find()
      .then(sauces => res.status(200).json(sauces))
      .catch(error => res.status(400).json({ error }));
  };



// Ajout des likes et dislikes pour chaque sauce
exports.likeDislikeSauce = (req, res) => {


    /* Si le client Like cette sauce */
    if (req.body.like === 1) {
      modelsSauces.findOneAndUpdate(
        { _id: req.params.id },
        { $inc: { likes: 1 }, $push: { usersLiked: req.body.userId } }
      )
        .then(() => res.status(200).json({ message: "Like ajouté !" }))
        .catch((error) => res.status(400).json({ error }));
  


      /* Si le client disike cette sauce */
    } else if (req.body.like === -1) {
      modelsSauces.findOneAndUpdate(
        { _id: req.params.id },
        { $inc: { dislikes: 1 }, $push: { usersDisliked: req.body.userId } }
      )
        .then(() => res.status(200).json({ message: "Dislike ajouté !" }))
        .catch((error) => res.status(400).json({ error }));
  


      /* Si le client annule son choix */
    } else {
      modelsSauces.findOne({ _id: req.params.id }).then((maSauce) => {

        
        if (maSauce.usersLiked.includes(req.body.userId)) {
          modelsSauces.findOneAndUpdate(
            { _id: req.params.id },
            { $inc: { likes: -1 }, $pull: { usersLiked: req.body.userId } }
          )
            .then(() => res.status(200).json({ message: "like retiré !" }))
            .catch((error) => res.status(400).json({ error }));


        } else if (maSauce.usersDisliked.includes(req.body.userId)) {
          modelsSauces.findOneAndUpdate(
            { _id: req.params.id },
            { $inc: { dislikes: -1 }, $pull: { usersDisliked: req.body.userId } }
          )
            .then(() => res.status(200).json({ message: "dislike retiré !" }))
            .catch((error) => res.status(400).json({ error }));
        }
      }
      );
    }
  };