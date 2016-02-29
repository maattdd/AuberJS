///<reference path='../node_modules/immutable/dist/Immutable.d.ts'/>
import Immutable = require('immutable');
///<reference path='../typings/lodash/lodash.d.ts'/>
import _ = require('lodash');
///<reference path='../typings/node/node.d.ts'/>

declare var require:any
var snabbdom = require('snabbdom');
export var h = require('snabbdom/h')
var patch = snabbdom.init([ // Init patch function with choosen modules
  require('snabbdom/modules/class'), // makes it easy to toggle classes
  require('snabbdom/modules/props'), // for setting properties on DOM elements
  require('snabbdom/modules/style'), // handles styling on elements with support for animations
  require('snabbdom/modules/eventlisteners'), // attaches event listeners
]);

var m;
var v;
var node;

export function draw() {
    const new_node = ballastView(m)
    patch(node,new_node)
    node = new_node
}

export function init <T> (dom,model,view) {
    v = view;
    m = new Model(model);
    node = ballastView(m);
    patch(dom,node)
}

export abstract class Action <T> {
    abstract reduce (model: T) : T;
    apply () {
        m.modelHistory = m.modelHistory.push(this.reduce(m.currentModel))
        //m.actionHistory = m.actionHistory.push(this)
        m.debug_time = m.historySize-1
        //m.model = this.reduce(m.model)
        draw()
    }
}

class Model <M> {
    modelHistory: Immutable.List<M>;
    //actionHistory: Immutable.List<Action<M>>;
    //model: M;
    debug:boolean;
    debug_time:number;
    constructor(m:M) {
        this.modelHistory = Immutable.List<M> ();
        //this.actionHistory = Immutable.List<Action<M>> ();
        this.modelHistory = this.modelHistory.push(m)
        //this.model = m;
        this.debug = false;
        this.debug_time = 0;
    }
    get historySize() : number {
        return this.modelHistory.size
    }
    get currentModel() : M {
        return this.modelHistory.last()
    }
}

function viewHistory (evt) {
    let val = evt.target.value
    console.log(val)
    m.debug_time = parseInt(val)
    draw()
}

function toggleDebug (evt) {
    let val = evt.target.checked
    m.debug = val
    m.debug_time = m.historySize-1
    console.log(m)
    draw()
}

function ballastView <T> (model:Model<T>) {
    var find_model = function (m:Model<T>) : T {
        // current
        if (!model.debug) { return model.modelHistory.last(); }
        // history
        const idx = model.debug_time
        const mod = model.modelHistory.get(idx);
        console.log(idx)
        console.log(mod)
        return mod
    }

    return h('div#ballast_',[
        h('div#ballast_client',[
            v(find_model(model))
        ]),
        h('div#ballast_reactor',[
            h('label',[
                h('input', {
                    props: {
                        type:"checkbox",
                    },
                    attrs: {
                        checked:m.debug
                    },
                    on: {
                        change: toggleDebug
                    }
                },[]),
                h('span.checkable',"Debug mode")
            ]),
            h('input', {
                props: {
                    type:"range",
                    disabled:!model.debug || model.historySize < 1,
                    min:0,
                    value: model.debug_time,
                    max:model.historySize-1,
                },
                on: {
                    input: viewHistory
                }
            },[])
        ])
    ])
}
