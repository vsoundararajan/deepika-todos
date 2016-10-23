/**
 * Created by soundararajanvenkatasubramanian on 10/21/16.
 */
var Sequelize = require('sequelize');
var sequelize = new Sequelize(undefined, undefined, undefined, {
   'dialect': 'sqlite',
    'storage': __dirname + '/basic-sqlite-database.sqlite'
});

var Todo = sequelize.define('todo', {
    description: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [2,250]
        }//,
        //unique: true
    },
    completed: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
});

var User = sequelize.define('user',{
    email: Sequelize.STRING
});

Todo.belongsTo(User);
User.hasMany(Todo);

sequelize.sync({
    //force: true
   }).then( () => {
    console.log('Everything is synced');
    User.findById(1).then( function (user){
       user.getTodos({
           where: {
               "completed": true
           }
       }).then(function (todos) {
          todos.forEach( function(todo){
             console.log(todo.toJSON());
          });
       });
    });
    // User.create({
    //     email: 'soundararajan@usa.net'
    // }).then( function () {
    //     return Todo.create({
    //         description: "Finish all these courses"
    //     });
    // }).then( function (todo) {
    //     User.findById(1).then( function (user){
    //        user.addTodo(todo);
    //     });
    // });

});

