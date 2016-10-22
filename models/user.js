/**
 * Created by soundararajanvenkatasubramanian on 10/22/16.
 */
var _ = require('lodash');
var bcrypt = require('bcrypt');

module.exports = (sequelize, DataTypes) => {
    return sequelize.define('user', {
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
       instanceMethods: {
         toPublicJSON: function() {
             var json = this.toJSON();
             return _.pick(json, ['id', 'email', 'createdAt', 'updatedAt']);
         }
       }
    });
}
