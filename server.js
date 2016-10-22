/**
 * Created by soundararajanvenkatasubramanian on 10/19/16.
 */
var express = require('express');
var _ = require('lodash');
var bodyParser = require('body-parser');
var db = require('./db.js');
var app = express();
var PORT = process.env.PORT || 3000;
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

app.get('/todos', (req, res) => {
    var query = req.query;
    var where = {};
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


app.get('/todos/:id', (req, res) => {
   var todoId = parseInt(req.params.id, 10);
   db.todo.findById(todoId).then( (todo) => {
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
app.post('/todos', (req, res) => {
    var body = _.pick(req.body, ["description", "completed"]);
    db.todo.create(
        body
    ).then( (todo) => {
        console.log(JSON.stringify(todo) + " is created");
        res.json(todo.toJSON());
    }, (e) => {
        console.log(e);
        res.status(400).json({error: JSON.stringify(body) + " is not created" });
    });

});


//DELETE
app.delete('/todos/:id', (req, res) => {
    var todoId = parseInt(req.params.id, 10);


    db.todo.destroy({
        where: {
            id: todoId
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

app.put('/todos/:id', (req, res) => {
    var todoId = parseInt(req.params.id, 10);
    var body = _.pick(req.body, ["description", "completed"]);
    var attributes = {};

    if(body.hasOwnProperty('completed')) {
        attributes.completed = body.completed;
    }
    if(body.hasOwnProperty('description')) {
        attributes.description = body.description;
    }

    db.todo.findById(todoId).then( (todo) => {
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
        res.json(user.toJSON());
    }, (e) => {
        res.status(400).json(e);
    });
});

db.sequelize.sync().then( () => {
    app.listen(PORT, () => {
        console.log('Express listening on port ' + PORT + '!');
    } );
});



