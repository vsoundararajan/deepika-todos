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
    var foundTodo = _.find(todos, {id: todoId});

    if(!foundTodo){
       return res.status(404).json({"error": `${req.params.id} does not exist.`})
    }

    var body = _.pick(req.body, ["description", "completed"]);
    var validAttributes = {};
    if(body.hasOwnProperty('completed') && _.isBoolean(body.completed)) {
        validAttributes.completed = body.completed;
    }else if( body.hasOwnProperty('completed') ){
        return res.status(400).json({error: "completed  is not boolean"});
    }
    if(body.hasOwnProperty('description') && _.isString(body.description) && body.description.trim().length > 0) {
        validAttributes.description = body.description.trim();
    }else if(body.hasOwnProperty('description')) {
        return res.status(400).json({error: "description  is not string or empty string."});
    }

    //  Here we update the todos
    _.assignIn(foundTodo, validAttributes);
    res.json(validAttributes);

});

db.sequelize.sync().then( () => {
    app.listen(PORT, () => {
        console.log('Express listening on port ' + PORT + '!');
    } );
});



