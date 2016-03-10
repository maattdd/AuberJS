import Ballast = require('./ballast')
import Immutable = require('immutable')

var m = {
    counter : 0,
    todos : Immutable.OrderedMap<number,string>()
}

type M = typeof m;

Ballast.init(
    module,
    document.body,
    m,
    v,
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
            todos: model.todos.set(model.counter+1,action.todo)
        }
    }
    return model
}

function v (model:M) {
    return Ballast.h("div",{},[
        Ballast.h("input", {
            props: {
                placeholder:"Add"
            },
            on: {
                change: addTodo
            }
        }),
        Ballast.h('ul', model.todos.reduce(
            (r,v,k) => {
                r.push(Ballast.h('li',{
                    style: {
                        opacity:'0',
                        transition: 'opacity 1s',
                        delayed: { opacity: '1'},
                        remove: { opacity: '0'},
                        destroy: { opacity: '0'}
                    }
                },[`${k} : ${v}`])) ; return r
            },
            [])
        )
    ])
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
