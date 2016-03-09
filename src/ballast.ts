///<reference path='../node_modules/immutable/dist/Immutable.d.ts'/>
import Immutable = require('immutable');
///<reference path='../typings/lodash/lodash.d.ts'/>
import _ = require('lodash');
///<reference path='../typings/node/node.d.ts'/>

declare var require:any
declare var module:any

var snabbdom = require('snabbdom');
export var h = require('snabbdom/h')
var patch = snabbdom.init([ // Init patch function with choosen modules
  require('snabbdom/modules/class'), // makes it easy to toggle classes
  require('snabbdom/modules/props'), // for setting properties on DOM elements
  require('snabbdom/modules/style'), // handles styling on elements with support for animations
  require('snabbdom/modules/eventlisteners'), // attaches event listeners
]);

require("../public/bower_components/picnic/picnic.min.css")
require("./ballast.css");
//require("")

var m;
var v;
var node;

var init_dom;
var init_model;
var init_view;

if (module.hot) {
    module.hot.accept()
    module.hot.dispose(function(data) {
        console.log(init_dom)
        console.log(init_model)
        console.log(init_view)
        data.init_dom = init_dom;
        data.init_model = init_model;
        data.init_view = init_view;
        console.log(data)
    })
}

if (module.hot.data) {
    var d = module.hot.data
    console.log("BEGIN Datdda")
    console.log(d.init_dom);
    console.log(d.init_model);
    console.log(d.init_view);
    console.log("END Data")
    init2(d.init_dom,d.init_model,d.init_view)
}

function draw() {
    if (m && node) {
        const new_node = ballastView(m)
        patch(node,new_node)
        node = new_node
    } else {
        console.error("Unable to draw")
    }
}

export function init <T> (parent_module,dom,model,view) {
    if (parent_module.hot) {
        var pmh = parent_module.hot
        parent_module.hot.accept()
        parent_module.hot.dispose(function() {
            console.log("should dispose something")
        })
        if (parent_module.hot.data) {
        }
    }
    init2(dom,model,view)
}

function init2 <T> (dom,model:T,view){
    init_dom = dom;
    init_view = view;
    init_model = model;

    console.debug("kInit2:" + dom + model + view)

    v = view;
    m = new Model<T>(model);
    node = ballastView(m);

    var container = document.getElementById('ballast_container')
    if (!container) {
        container = document.createElement('div')
        container.setAttribute('id','ballast_container')
        dom.appendChild(container)
    }
    patch(container,node);
}

export abstract class Action <T> {
    abstract reduce (model: T) : T;
    apply () {
        m.modelHistory = m.modelHistory.push(this.reduce(m.currentModel))
        m.actionHistory = m.actionHistory.push(this)
        m.debug_time = m.historySize-1
        //m.model = this.reduce(m.model)
        draw()
    }
}

class Model <M> {
    modelHistory: Immutable.List<M>;
    actionHistory: Immutable.List<Action<M>>;
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

    return h('div#ballast_container',[
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
                h('span.checkable',"sdsddsdfssdfddfd")
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
