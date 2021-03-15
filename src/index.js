const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {

  const { username } = request.headers;
  const user = users.find((user) => user.username === username)
  if (!user) {
    return response.status(404).json({ error: "User not found!" })
  }

  request.user = user;
  return next();
}
// A rota deve receber name, e username dentro do corpo da requisição.
//  Ao cadastrar um novo usuário, ele deve ser armazenado dentro de um objeto no seguinte formato:  
app.post('/users', (request, response) => {
  const { name, username } = request.body;
  const usernameAlreadyExists = users.some((user) => user.username === username);

  if (usernameAlreadyExists) {
    return response.status(400).json({ error: "username already exists!" });
  }
  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }
  users.push(user);
  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  return response.json(user.todos)

});

app.post('/todos', checksExistsUserAccount, (request, response) => {

  const { title, deadline } = request.body;
  const { user } = request;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  }
  user.todos.push(todo);

  return response.status(201).json(todo);

});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { id } = request.query;
  const { user } = request;

  const todo = user.todos.find((todo) => todo.id === id);
  console.log("todo:", todo)

  if (todo) {

    for (const key in user.todos) {
      if (user.todos[key].id == id) {
        user.todos[key] = {
          ...user.todos[key],
          title: title,
          deadline: new Date(deadline)
        }
      }
    }


    return response.status(201).send();
  }
  return response.status(404).json({ error: "todo don't exists!" });

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.query;
  const { user } = request;

  const todo = user.todos.find((todo) => todo.id === id);

  if (todo) {
    for (const key in user.todos) {
      if (user.todos[key].id == id) {
        user.todos[key] = {
          ...user.todos[key],
          done: true
        }
      }
    }
    return response.status(201).send();
  }
  return response.status(404).json({ error: "todo don't exists!" });
  

});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.query;
  const { user } = request;

  const todo = user.todos.find((todo) => todo.id === id);

  if (todo) {
    

    for (const key in user.todos) {
      if (user.todos[key].id == id) {
        user.todos.splice(user.todos, 1);
      }
    }
  
    return response.status(204).json(users);
  }else{
  return response.status(404).json({ error: "todo don't exists!" });}
});
// app.listen(3333);
module.exports = app;