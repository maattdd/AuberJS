/*
TodoMVC
*/

import * as ballast from './ballast'
import Immutable = require('immutable');
//var uuid = require('uuid');

declare var require:any
var $ = require("jquery");
///<reference path="../typings/velocity-animate/velocity-animate.d.ts"/>
var Velocity = require('velocity-animate');

var m = Immutable.OrderedMap<number,string>()
type M = typeof m;

ballast.init(
    document.body,
    m,
    v)

class Add extends ballast.Action<M> {
    static counter = 1;
    id: number;
    todo: string;
    constructor (s:string) { super(); this.id = Add.counter++; this.todo = s }
    reduce (model:M) {
        return model.set(this.id,this.todo)
    }
}

function v (model:M) {
    return ballast.h("div",{},[
        ballast.h("input", {
            props: {
                placeholder:"Add a new todo"
            },
            on: {
                change: addTodo
            }
        }),
        ballast.h('ul',{},model.reduce(
            (r,v,k) => {
                r.push(ballast.h('li',{
                    hook: {
                        insert: (node) => {
                            //console.log(Velocity)
                            var targetHeight = node.scrollHeight
                            //node.style.height="0px"
                            //Velocity(node, "fadeIn", {duration: 1500})
                        }

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

function addTodoAnimate (domNode,properties) {
}

function deleteTodoAnimate(domNode, removeDomNodeFunction, properties) {
//    Velocity.animate(domNode, {height: 0}, 400, "ease-out", removeDomNodeFunction);
};
