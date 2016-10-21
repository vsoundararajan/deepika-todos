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
})
sequelize.sync().then( () => {
    console.log('Everything is synced');

    Todo.findAll({
       where: {
           description: {
               $like: '%sAfEwAy%'
           }
       }
    }).then( (todos) =>{
        if(todos.length > 0) {
            todos.forEach((todo) => {
                console.log(todo.toJSON());
            });
        }else {
            console.log('No todos to print');
        }
    }).catch( (e) =>{
      console.log(e);
    });

    // Todo.create({
    //     description: 'feed the dogs',
    //     completed: true
    // }).then((todo) => {
    //     return Todo.create({
    //        description: "Go to Safeway"
    //     });
    // }).then( () => {
    //    //return Todo.findById(1);
    //     return Todo.findAll({
    //         where: {
    //             description: {
    //                 $like: '%safeway%'
    //             }
    //         }
    //     });
    // }).then( (todos) => {
    //     if(todos) {
    //         todos.forEach((todo) => {
    //           console.log(todo.toJSON());
    //         });
    //     }else {
    //         console.log('no to dos found');
    //     }
    // }).catch( (e) => {
    //    console.log(e);
    // });
});

