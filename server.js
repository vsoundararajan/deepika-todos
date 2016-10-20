/**
 * Created by soundararajanvenkatasubramanian on 10/19/16.
 */
var express = require('express');
var _ = require('lodash');
var bodyParser = require('body-parser');

var app = express();
var PORT = process.env.PORT || 3000;
var todos = [];
var todoNextId = 1;

app.use(bodyParser.json());

app.get('/', (req, res) => {
   res.send('Todo API Root');
});

app.get('/todos', (req, res) => {
   res.json(todos);
});


app.get('/todos/:id', (req, res) => {
   var todoId = parseInt(req.params.id, 10);
    var foundTodo = undefined;
    foundTodo = _.find(todos, (todo) => {
       return todo.id === todoId;
     });
    if(typeof foundTodo !== 'undefined'){
        res.json(foundTodo);
    }else{
        res.status(404).send(`${todoId} not found!`);
    }

});

//POST /todos
app.post('/todos', (req, res) => {
   var body = req.body;
    body.id = todoNextId++;
    todos.push(body);
   console.log('description :' + body.description);
   res.json(body);

});


app.listen(PORT, () => {
    console.log('Express listening on port ' + PORT + '!');
} );

