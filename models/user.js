/**
 * Created by soundararajanvenkatasubramanian on 10/22/16.
 */
var _ = require('lodash');
var bcrypt = require('bcrypt');
var cryptojs = require('crypto-js');
var jwt = require('jsonwebtoken');

module.exports = (sequelize, DataTypes) => {
    var user = sequelize.define('user', {
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true
            }
        },
        salt: {
            type: DataTypes.STRING
        },
        password_hash: {
            type: DataTypes.STRING
        },
        password: {
            type: DataTypes.VIRTUAL,
            allowNull: false,
            validate: {
                len: [7, 100]
            },
            set: function (value){
                var salt = bcrypt.genSaltSync(10);
                var hashedPassword = bcrypt.hashSync(value, salt);
                this.setDataValue('password', value);
                this.setDataValue('salt', salt);
                this.setDataValue('password_hash', hashedPassword);
            }
        }
    }, {
       hooks: {
           beforeValidate: (user, options) => {
               if(_.isString(user.email) && user.email.length > 0){
                   user.email = user.email.toLowerCase().trim();
               }
           }
       },
        classMethods: {
           authenticate: function (body) {
               return new Promise( function(resolve, reject){
                   if(body.email && _.isString(body.email) && body.email.length > 0 &&
                       body.password && _.isString(body.password) && body.password.length > 0){
                       user.findOne({
                           where: {email: body.email}
                       }).then( function(user){
                           //console.log(user.get('password_hash'));
                           if(!user || !bcrypt.compareSync(body.password, user.get('password_hash'))){
                               return reject();
                           }else{
                               resolve(user);
                           }
                       }, function(err){
                           reject();
                       });
                   }else{
                       return reject();
                   }
               });
           }
        },
       instanceMethods: {
         toPublicJSON: function() {
             var json = this.toJSON();
             return _.pick(json, ['id', 'email', 'createdAt', 'updatedAt']);
         },
         generateToken: function (type){
             if(!_.isString(type)){
                 return undefined;
             }
             try {
               var stringData = JSON.stringify({id: this.get('id'), type: type});
               var encryptedData = cryptojs.AES.encrypt(stringData, 'abc123!@#!').toString();
               var token = jwt.sign({
                   token: encryptedData
               }, "qwerty098");

              return token;
             } catch (e) {
                console.log(e);
                return undefined;
             }
         }
       }
    });

    return user;
}
