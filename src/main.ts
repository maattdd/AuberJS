import Ballast = require('./ballast')
import Immutable = require('immutable')

type Todo = {
    id:number,
    todo:string,
    completed:boolean
}
type Todos = Immutable.List<Todo>

var m = {
    counter     : 0,
    todos       : Immutable.List<Todo>(),
    visibility  : 'all'
}
type M = typeof m;

Ballast.init(
    module,
    document.body,
    m,
    html,
    update)

interface Action {
    type: string
    todo?: string
}

function update (model:M,action:Action) : M {
    switch (action.type) {
        case "add-todo":
        return {
            counter: model.counter+1,
            todos: model.todos.push({
                id:model.counter+1,
                todo:action.todo,
                completed:false
            }),
            visibility: model.visibility
        }
    }
    return model
}

function filterTodos (todos:Todos):Todos {
    return
}

function uncompletedTodos (todos:Todos):Todos {
    return 
}

function todo_tohtml (todo:Todo) {
    return Ballast.h('li',
    {
        style: {
            opacity:'0',
            transition: 'opacity 1s',
            delayed: { opacity: '1'},
            remove: { opacity: '0'},
            destroy: { opacity: '0'}
        },
    },
    [
        Ballast.h('input',
        {
            props: {
            type: 'checkbox'
            }
        }),
        Ballast.h('span',{
        on: {
            //dblclick:editTodo(todo)
        }},
        todo.todo)
    ])
}

function todos_tohtml (todos:Todos) {
    var ret = []
    todos.forEach( (t) => {
        ret.push(todo_tohtml(t))
    })
    return Ballast.h('ul', ret)
}

function html (model:M) {
    return Ballast.h("div",[
        Ballast.h("input", {
            props: {
                placeholder:"Add"
            },
            on: {
                change: addTodo
            }
        }),
        todos_tohtml(model.todos),
        Ballast.h('div',`${model.todos.size} items left`)
    ])
}

function editTodo (evt) {
    console.log("edit")
    console.log(evt)
}

function addTodo (evt) {
    let val = evt.target.value
    evt.target.value = '' //clear the input
    Ballast.dispatch (
        {type:'add-todo',todo:val},
        (apply,model:M) => {
            setTimeout( function () {
                apply()
            },1000)
        }
    )
}
