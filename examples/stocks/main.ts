import Ballast = require('../../src/ballast')
import Immutable = require('immutable')
import _ = require('lodash');
var Router5 = require('router5')

var h = Ballast.h

require('./stocks.css')

var m = Immutable.OrderedMap<string,string>();

class Stock extends Ballast.Component {
}

var update = (model,action) => {
}

var addStock = (evt) => {
    const symbol = evt.target.value
    console.log(symbol)
    Ballast.dispatch ({type:'add-stock',symbol:symbol})
}

function main_view () {
    return h('input',{
        props:{
            placeholder:'which stock?'
        },
        on:{
            change:addStock
        }
    },[
    ])
}


Ballast.init(
    true,
    module,
    document.body,
    m,
    undefined,
    update
)
