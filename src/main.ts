import Ballast = require('./ballast')
import Immutable = require('immutable')
var uuid = require('uuid');

var m = Immutable.OrderedMap<number,string>()
type M = typeof m;

Ballast.init(
    module,
    document.body,
    m,
    v)

class Add extends Ballast.Action<M> {
    static counter = 1;
    id: number;
    todo: string;
    constructor (s:string) { super(); this.id = Add.counter++; this.todo = s }
    reduce (model:M) {
        return model.set(this.id,this.todo)
    }
}

function v (model:M) {
    return Ballast.h("div",{},[
        Ballast.h("input", {
            props: {
                placeholder:"AdddAdddsdfdo a neew todffffooo"
            },
            on: {
                change: addTodo
            }
        }),
        Ballast.h('ul',{},model.reduce(
            (r,v,k) => {
                r.push(Ballast.h('li',{
                    style: {
                        opacity:'0',
                        transition: 'opacity 1.7s',
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
    let a = new Add(evt.target.value)
    a.apply();
    evt.target.value = '' //clear the input
}
