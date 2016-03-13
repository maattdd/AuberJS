import Ballast = require('../../src/ballast')
import Immutable = require('immutable')
import _ = require('lodash');

require('todomvc-app-css/index.css')

type Todo = {
    id:number,
    todo:string,
    completed:boolean
}
type Todos = Immutable.List<Todo>

var m = {
    counter     : 0,
    todos       : Immutable.List<Todo>(),
    visibility  : 'all',
    editedTodo  : undefined
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
    id?:number
}

function findTodoIndex(id:number,todos:Todos) : number{
    return todos.findIndex((todo)=>{
        return todo.id === id
    })
}

function update (model:M,action:Action) : M {
    switch (action.type) {
        case "add-todo":
        var ret = model;
        ret.counter++;
        ret.todos = ret.todos.push({
            id:ret.counter,
            todo:action.todo,
            completed:false
        })
        return ret;

        case "remove-todo":
        var ret = model;
        ret.todos = ret.todos.remove(findTodoIndex(action.id,model.todos))
        return ret

        case "edit-todo":
        var ret = model
        ret.editedTodo = action.id
        return ret

        case "completed-todo":
        var ret = model
        var idx = findTodoIndex(action.id,model.todos)
        var todo : Todo = ret.todos[idx]
        todo.completed = true
        ret.todos = ret.todos.set(idx,todo)
        return ret

        case "end-edit-todo":
        var ret = model;
        ret.editedTodo = undefined
        return ret;

        case "clear-completed":
        var ret = model;
        ret.todos = ret.todos.filter(todo=>!todo.completed).toList()
        return ret;

        case "toggle-all":
        var ret = model
        ret.todos = ret.todos.map(todo=>{todo.completed=true; return todo}).toList()
        return ret

    }
    console.log("Unknown action: " + action.type)
    return model //nothing, could be undefined.
}

function uncompletedTodos (todos:Todos){
    return todos.filter((todo)=>{
        return !todo.completed
    });
}

function todo_tohtml (todo:Todo,model:M) {
    return Ballast.h('li.todo',{
        class:{
            completed:todo.completed && todo.id != model.editedTodo,
            editing:todo.id === model.editedTodo
        }
    },
    [
        Ballast.h('div.view',[
            Ballast.h('input.toggle',
            {
                props: {
                    type: 'checkbox'
                },
                on: {
                    toggle:(evt) => {Ballast.dispatch ({type:'completed-todo',id:todo.id})}
                }
            }),
            Ballast.h('label',
            {
                on: {
                    dblclick:(evt) => {Ballast.dispatch ({type:'edit-todo',id:todo.id})}
                }
            },
            todo.todo
            ),
            Ballast.h('button.destroy',
            {
                on:{
                    click:(evt)=>{Ballast.dispatch ({type:'remove-todo',id:todo.id})}
                }
            })])
    ])
}

function todos_tohtml (todos:Todos,model:M) {
    var ret = []
    todos.forEach( (t) => {
        ret.push(todo_tohtml(t,model))
    })
    return Ballast.h('ul.todo-list', ret)
}

function section_header() {
    return Ballast.h('header.header',[
        Ballast.h('h1','todos'),
        Ballast.h("input.new-todo", {
            props: {
                placeholder:"What needs to be done?",
                autofocus:true,
                autocomplete:"off"
            },
            on: {
                change: addTodo
            }
        },[])
    ])
}

function section_main(model:M){
    return Ballast.h("section.main",[
        Ballast.h('input.toggle-all',{
            props:{type:'checkbox'},
            //on:{click:Ballast.dispatch({id:'toggle-all'})}
        }),
        todos_tohtml(model.todos,model),
    ])
}

function html_filter(f,model) {
    return Ballast.h('li',[Ballast.h('a',{
        props:{
            href:`#/${f}`
        },
        class:{
            selected:f===model.visibility
        }
    },
    _.capitalize(f))
])}

function section_footer(model:M){
    return Ballast.h('footer.footer',
    [
        Ballast.h('span.todo-count',`${model.todos.size} items left`),
        Ballast.h('ul.filters',
        [
            html_filter('all',model),
            html_filter('active',model),
            html_filter('completed',model)
        ]),
        Ballast.h('button.clear-completed',{
            style:{
                display:model.todos.size > 2
            },
            on:{
                //click:(evt)=>{Ballast.dispatch({id:'clear-completed'})}
            }
        },'Clear completed')
    ])
}

function html_footer_info(){
    return Ballast.h('footer.info',[
    Ballast.h('p','Double-click to edit a todo'),
    Ballast.h('p',['Written by ',Ballast.h('a',{
        props:{
            href:'mailto:matthieu.dubet@gmail.com'
        }
    },'Matthieu Dubet')]),
    Ballast.h('p',['Implementation of ',Ballast.h('a',{
        props:{
            href:'http://todomvc.com'
        }
    },'TodoMVC')])
    ])
}

function html (model:M) {
    return Ballast.h('div',[
        Ballast.h('section.todoapp',
        [
            section_header(),
            section_main(model),
            section_footer(model)
        ]),
        html_footer_info()
    ])
}

function addTodo (evt) {
    let val = evt.target.value
    evt.target.value = '' //clear the input
    Ballast.dispatch ({type:'add-todo',todo:val})
}
