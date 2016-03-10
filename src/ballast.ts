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

//require("../public/bower_components/picnic/picnic.min.css")
require("./ballast.css");
//require("")

function print (msg, color='blue') {
    console.info("[Ballast] %c" + msg, "color:" + color + ";font-weight:bold;");
}

var m;
var v;
var node;
var up;

var init_dom;
var init_model;
var init_view;
var init_update;

if (module.hot) {
    module.hot.accept()
    module.hot.dispose(function(data) {
        data.init_dom = init_dom;
        data.init_model = init_model;
        data.init_view = init_view;
        data.init_update = init_update;
    })
}

if (module.hot.data) {
    var d = module.hot.data
    init2(d.init_dom,d.init_model,d.init_view,d.init_update)
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

function updater (action) {
    console.groupCollapsed('Applying action ')
    print("Previous model:")
    console.log(m.currentModel)
    print("Applying action:")
    console.log(action)
    m.actionHistory = m.actionHistory.push(action)
    m.modelHistory = m.modelHistory.push(up(m.currentModel,action))
    m.debug_time = m.historySize-1
    print("New model:")
    console.log(m.currentModel)
    console.groupEnd()
    draw()
}



export function dispatch (action,callback) {
    var upp = () => {
        updater(action)
    }
    callback(upp,m.currentModel)
}

export function init <UserModel> (
    parent_module,
    dom:HTMLElement,
    model:UserModel,
    view,
    update:(UserModel,action)=>UserModel) {
    if (parent_module.hot) {
        var pmh = parent_module.hot
        parent_module.hot.accept()
    }
    init2(dom,model,view,update)
}

function init2 <T> (dom,model:T,view,update) {
    init_dom = dom;
    init_view = view;
    init_model = model;
    init_update = update;

    v = view;
    up = update;

    if (m) { // we are reloading
        m.replay()
    } else {
        m = new Model<T>(model)
    }
    node = ballastView(m);

    var container = document.getElementById('ballast_container')
    if (!container) {
        container = document.createElement('div')
        container.setAttribute('id','ballast_container')
        dom.appendChild(container)
    }
    patch(container,node);
}

class Model <M> {
    modelHistory: Immutable.List<M>;
    actionHistory;
    debug:boolean;
    debug_time:number;
    constructor(m:M) {
        this.modelHistory = Immutable.List<M> ();
        this.modelHistory = this.modelHistory.push(m)

        this.actionHistory = Immutable.List ();
        this.debug = false;
        this.debug_time = 0;
    }
    get historySize() : number {
        return this.modelHistory.size
    }
    get currentModel() : M {
        return this.modelHistory.last()
    }
    private replay() {
        print("Replaying",'green')
        console.groupCollapsed('Replay')
        this.modelHistory.clear()
        this.actionHistory.forEach( action => {
            updater(action)
        })
        console.groupEnd()
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
                h('span.checkable',"Run")
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
