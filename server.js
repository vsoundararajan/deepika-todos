/**
 * Created by soundararajanvenkatasubramanian on 10/19/16.
 */
var express = require('express');
var bcrypt = require('bcrypt');

var _ = require('lodash');
var bodyParser = require('body-parser');
var db = require('./db.js');
var app = express();
var PORT = process.env.PORT || 3000;
var middleware = require('./middleware')(db);

var todos = [{
    "description": "Walk the dog",
    "completed": true
},

    {
        "description": "Talk the dog",
        "completed": false
    },

    {
        "description": "Wash the dog",
        "completed": true
    }

];
var todoNextId = 1;

app.use(bodyParser.json());

app.get('/', (req, res) => {
   res.send('Todo API Root');
});

app.get('/todos', middleware.rquireAuthentication, (req, res) => {
    var query = req.query;
    var where = {
        userId: req.user.get('id')
    };
    if(query && query.hasOwnProperty("completed") && query.completed === "true"){
        where.completed = true;
    }else if (query && query.hasOwnProperty("completed") && query.completed === "false") {
         where.completed = false;
    }
    if (query && query.hasOwnProperty("q") && _.isString(query.q) && query.q.length > 0) {
        where.description = {
            $like: `%${query.q}%`
        }
    }
    db.todo.findAll({
         where
    }).then( (todos) =>{
            res.json(todos);
    }, (e) => {
        res.status(500).send();
    });

});


app.get('/todos/:id', middleware.rquireAuthentication,  (req, res) => {
   var todoId = parseInt(req.params.id, 10);
   db.todo.findOne({
       where: {
           userId: req.user.get('id'),
           id: todoId
       }
   }).then( (todo) => {
       if(!!todo){
         res.json(todo.toJSON());
       }else{
           res.status(404).send();
       }
   }, (e) => {
      res.status(500).send();
   });

});

//POST /todos
app.post('/todos', middleware.rquireAuthentication,  (req, res) => {
    var body = _.pick(req.body, ["description", "completed"]);
    db.todo.create(
        body
    ).then( (todo) => {
        req.user.addTodo(todo).then( function(){
           return todo.reload();
        }).then (function(todo){
             res.json(todo.toJSON());
        });
    }, (e) => {
        console.log(e);
        res.status(400).json({error: JSON.stringify(body) + " is not created" });
    });

});


//DELETE
app.delete('/todos/:id', middleware.rquireAuthentication,  (req, res) => {
    var todoId = parseInt(req.params.id, 10);


    db.todo.destroy({
        where: {
            id: todoId,
            userId: req.user.get('id')
        }
    }).then((noOfRowsDeleted) => {
        if (noOfRowsDeleted > 0) {
            res.status(204).send();
        } else {
            res.status(404).json({
                error: `No todo item with id ${todoId}`
            })
        }
    }, (e) => {
        res.status(500).send();
    });
});

// PUT

app.put('/todos/:id', middleware.rquireAuthentication,  (req, res) => {
    var todoId = parseInt(req.params.id, 10);
    var body = _.pick(req.body, ["description", "completed"]);
    var attributes = {};

    if(body.hasOwnProperty('completed')) {
        attributes.completed = body.completed;
    }
    if(body.hasOwnProperty('description')) {
        attributes.description = body.description;
    }

    db.todo.findOne({
        where: {
            id: todoId,
            userId: req.user.get('id')
        }
    }).then( (todo) => {
        if(todo){
          todo.update(attributes).then( (todo) => {
              res.json(todo.toJSON());
          }, (e) => {
              res.status(400).json(e);
          });
        }else{
            res.status(404).send();
        }
    }, (e) => {
        res.status(500).send();
    });

});

app.post('/users', (req, res) => {
    console.log("coming here");
    var body = _.pick(req.body, ["email", "password"]);
    db.user.create(body).then( (user) => {
        res.json(user.toPublicJSON());
    }, (e) => {
        res.status(400).json(e);
    });
});


// POST /user/login

app.post('/users/login', function(req, res){
    var body = _.pick(req.body, ["email", "password"]);
    db.user.authenticate(body).then( function(user){
        var token = user.generateToken('authentication');
        if(token){
          res.header('Auth', token).json(user.toPublicJSON());
        }else{
            res.status(401).send();
        }
    }, function() {
        res.status(401).send();
    });
});


db.sequelize.sync({force: true} ).then( () => {
    app.listen(PORT, () => {
        console.log('Express listening on port ' + PORT + '!');
    } );
});



