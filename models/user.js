/**
 * Created by soundararajanvenkatasubramanian on 10/22/16.
 */
var _ = require('lodash');

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
        password: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [7, 100]
            }
        }
    }, {
       hooks: {
           beforeValidate: (user, options) => {
               if(_.isString(user.email) && user.email.length > 0){
                   user.email = user.email.toLowerCase().trim();
               }
           }
       }
    });
}