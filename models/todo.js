/**
 * Created by soundararajanvenkatasubramanian on 10/21/16.
 */
module.exports = function (sequelize, DataTypes) {
    return sequelize.define('todo', {
        description: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true,
                len: [2,250]
            }//,
            //unique: true
        },
        completed: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        }
    });
};
