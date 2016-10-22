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
    var queryParams = req.query;
    var filteredTodos = todos;

    if(queryParams && queryParams.hasOwnProperty("completed") && queryParams.completed === "true"){
        filteredTodos = _.filter(filteredTodos, {completed: true});
    }else if (queryParams && queryParams.hasOwnProperty("completed") && queryParams.completed === "false") {
        filteredTodos = _.filter(filteredTodos, {completed: false});
    }

    if(queryParams && queryParams.hasOwnProperty("q") && _.isString(queryParams.q) &&  queryParams.q.length > 0 ){
        filteredTodos = _.filter(filteredTodos, (todo) => {
            return todo.description.toLowerCase().indexOf(queryParams.q.toLocaleLowerCase()) >= 0;
        } );
    }

   res.json(filteredTodos);
});


app.get('/todos/:id', (req, res) => {
   var todoId = parseInt(req.params.id, 10);
    var foundTodo = _.find(todos, {id: todoId});
    if(typeof foundTodo !== 'undefined'){
        res.json(foundTodo);
    }else{
        res.status(404).send(`${todoId} not found!`);
    }

});

//POST /todos
app.post('/todos', (req, res) => {
    var body = _.pick(req.body, ["description", "completed"]);
   //  console.log(body.description);
   //  if(!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length <= 0 ){
   //      return res.status(400).send();
   //  }
   //  body.description = body.description.trim();
   //  body.id = todoNextId++;
   //  todos.push(body);
   //
   // res.json(body);
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
    var foundTodo = _.find(todos, {id: todoId});
    if(typeof foundTodo !== 'undefined'){
        todos = _.without(todos, foundTodo);
        res.json(foundTodo);
    }else{
        res.status(404).send(`${todoId} not found!`);
    }

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



