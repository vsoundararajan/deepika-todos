/**
 * Created by soundararajanvenkatasubramanian on 10/19/16.
 */
var express = require('express');
var _ = require('lodash');
var app = express();
var PORT = process.env.PORT || 3000;
var todos = [
    {
        id: 1,
        description: "learning node js",
        completed: false
    },
    {
        id: 2,
        description: "learning react js",
        completed: false
    },
    {
        id: 3,
        description: "learning redux and JWT",
        completed: false
    },
];
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

app.listen(PORT, () => {
    console.log('Express listening on port ' + PORT + '!');
} );

