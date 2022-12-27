//Globals
const todoList = document.getElementById('todo-list');
const userSelect = document.getElementById('user-todo')
const form = document.querySelector('form')
let todos: any = [];
let users: any = [];


// Attach Events
document.addEventListener('DOMContentLoaded', initApp);
form?.addEventListener('submit', handleSubmit)


// Basic logic
function getUserName(userId: number) {
    const user = users.find((u: any) => u.id === userId);
    
    return user.name;
}

interface jsonData {
  id: string,
  userId: number,
  title: string,
  completed: boolean
}

function printToDo({id, userId, title, completed}:jsonData){
    const li = document.createElement('li');
    li.className = 'todo-item';
    li.dataset.id = id;
    li.innerHTML = `<span>${title} by <b>${getUserName(userId)}</b></span>`;

    const status = document.createElement('input');
    status.type = 'checkbox';
    status.checked = completed;
    status.addEventListener('change', handleTodoChange);

    const close = document.createElement('span');
    close.innerHTML = '&times;';
    close.className = 'close';
    close.addEventListener('click', handleClose);

    li.prepend(status);
    li.append(close);

    todoList?.prepend(li);
}

function createUserOption(user: any){
    const option = document.createElement('option');
    option.value = user.id;
    option.innerText = user.name;

    userSelect?.append(option);
}

function removeTodo(todoId: number){
    todos = todos.filter((todo: any) => todo.id !== todoId);

    const todo = todoList?.querySelector(`[data-id="${todoId}"]`);
    todo?.querySelector('input')?.removeEventListener('change', handleTodoChange);
    todo?.querySelector('.close')?.removeEventListener('click', handleClose);

    todo?.remove();
}

function alertError(error: any){
    alert(error.message);
}

// Event logic
function initApp(){
    Promise.all([getAllTodos(), getAllUsers()]).then(values => {
        [todos, users] = values;

        // Send values to html
        todos.forEach((todo: any) => printToDo(todo));
        users.forEach((user: any) => createUserOption(user));
    })
}

function handleSubmit(event: any){
    event.preventDefault();

    createTodo({
        userId: Number(form?.user.value),
        title: form?.todo.value,
        completed: false
    });
}

function handleTodoChange(this: any){
    const todoId = this.parentElement.dataset.id;
    const completed = this.checked;

    toggleTodoComplete(todoId, completed);
}

function handleClose(this: any){
    const todoId = this.parentElement.dataset.id;
    deleteTodo(todoId);
}

// Async logic
async function getAllTodos(){
    try {
        const response = await fetch('https://jsonplaceholder.typicode.com/todos?_limit=15');
        const data = await response.json();
    
        return data;
    } catch (error) {
        alertError(error);
    }
}

async function getAllUsers(){
    try {
        const response = await fetch('https://jsonplaceholder.typicode.com/users');
        const data = await response.json();
    
        return data;
    } catch (error) {
        alertError(error);
    }
}

async function createTodo(todo: any){
    try {
        const response = await fetch('https://jsonplaceholder.typicode.com/todos', {
            method: 'POST',
            body: JSON.stringify(todo),
            headers: {
                'Content-Type': 'application/json',
            },
        });
    
        const newTodo = await response.json(); 
    
        printToDo(newTodo);
    } catch (error) {
        alertError(error);
    }
}

async function toggleTodoComplete(todoId: number, completed: boolean){
    try {
        const response = await fetch(`https://jsonplaceholder.typicode.com/todos/${todoId}`, {
            method: 'PATCH',
            body: JSON.stringify({ completed }),
            headers: {
                'Content-Type': 'application/json',
            },
        });
    
        const data = await response.json();
        console.log(data);
        if(!response.ok) {
            throw new Error('Server connection error!');
        }
    } catch (error) {
        alertError(error);
    }
}

async function deleteTodo(todoId: number){
    try {
        const response = await fetch(`https://jsonplaceholder.typicode.com/todos/${todoId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });
    
        if(response.ok){
            removeTodo(todoId);
        } else {
            throw new Error('Server connection error!');
        }
    } catch (error) {
        alertError(error)
    }
}