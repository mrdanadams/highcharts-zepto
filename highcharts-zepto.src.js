// Highcharts Zepto.js adapter
// Load after zepto and before highcharts
// see ~highcharts.src.js:964 for the defined adapter functions
(function() {

var win = window;

function extend(a, b) {
  a = a || {};
  for(i in b) a[i] = b[i];
  return a;
}

// needed to handle events on non-DOM objects
var Evt = (function() {
  var con = function(type) {
    this.type = type;
    this.defaultPrevented = false;
  }

  con.prototype = {
  };

  return con;
})();

var Events = {
  eventify: function(o) {
    if (o._events) return;
    o._events = {};
    extend(o, Events);
  },
  bind  : function(event, fct){
    this._events = this._events || {};
    this._events[event] = this._events[event] || [];
    this._events[event].push(fct);
  },
  unbind  : function(event, fct){
    this._events = this._events || {};
    if( event in this._events === false  )  return;
    this._events[event].splice(this._events[event].indexOf(fct), 1);
  },
  // returns false if a handler returned false to cancel bubbling
  trigger : function(event) {
    this._events = this._events || {};
    if( event.type in this._events === false  )  return;
    var i=0, evts=this._events[event.type], len = evts.length;
    for(; i<len; i++){
      if (evts[i].call(this, event) === false || event.defaultPrevented) {
        event.defaultPrevented = true;
      }
    }
    if (event.defaultPrevented) return false;
  }
};


win.HighchartsAdapter = {
  /**
   * Initialize the adapter. This is run once as Highcharts is first run.
   * @param {Object} pathAnim The helper object to do animations across adapters.
   */
  init: function(pathAnim) {},

  /**
   * Run a general method on the framework, following jQuery syntax
   * @param {Object} el The HTML element
   * @param {String} method Which method to run on the wrapped element
   */
  adapterRun: function (el, method) {
    // This currently works for getting inner width and height. If adding
    // more methods later, we need a conditional implementation for each.
    el = $(el);
    return el[method].call(el);
  },

  /**
   * Downloads a script and executes a callback when done.
   * @param {String} scriptLocation
   * @param {Function} callback
   */
  getScript: function (scriptLocation, callback) {
    var head = $('head')[0],
      script = $('<script></script>');

    script.attr('src', scriptLocation);
    script.type = 'text/javascript';
    script.onload = callback;
    script.appendTo(head);
  },

  // note: the default implementation in highcharts is wrong...
  each: function (arr, fn) {
    var i=0, len=arr.length, v;
    for(; i<len; i++) {
      v = arr[i];
      if (fn.call(v, v, i) === false)
        return i;
    }
  },

  /**
   * Grep or filter an array
   * @param {Array} arr
   * @param {Function} fn
   */
  grep: function (arr, fn) {
    return $(arr).filter(fn);
  },

  /**
   * Get the offset of an element relative to the top left corner of the web page
   */
  offset: function (el) {
    return $(el).offset();
  },

  /**
   * Map an array
   * @param {Array} arr
   * @param {Function} fn
   */
  map: function (arr, fn) {
    return $.map(arr, fn);
  },

  /**
   * Deep merge two objects and return a third
   */
  // note: gets actually called with any number of hashes, not just 2...
  merge: (function() {
    var merge = function() {
      if (arguments.length == 1) return arguments[0];

      var o = {}, i=0, len = arguments.length, obj, k;

      for(; i<len; i++) {
        obj = arguments[i];

        for(k in obj) {
          if (typeof o[k] == "object" && typeof obj[k] == "object")
            o[k] = merge(o[k], obj[k]);
          else
            o[k] = obj[k];
        }
      }
      return o;
    }

    return merge;
  })(),

  /**
   * Add an event listener
   * @param {Object} el A HTML element or custom object
   * @param {String} event The event type
   * @param {Function} fn The event handler
   */
  addEvent: function (el, event, fn) {
    // console.log("add "+event+" "+(typeof el)+" "+el.nodeType+" "+el.tagName);
    if (typeof el.nodeType == "undefined") {
      Events.eventify(el);
      el.bind(event, fn);
    } else
      $(el).on(event, fn);
  },

  /**
   * Remove event added with addEvent
   * @param {Object} el The object
   * @param {String} eventType The event type. Leave blank to remove all events.
   * @param {Function} handler The function to remove
   */
  removeEvent: function (el, eventType, handler) {
    if (typeof el.nodeType == "undefined") {
      Events.eventify(el);
      el.unbind(eventType, handler);
    } else
      $(el).off(eventType, handler);
  },

  /**
   * Fire an event on a custom object
   * @param {Object} el
   * @param {String} type
   * @param {Object} eventArguments
   * @param {Function} defaultFunction
   */
  fireEvent: function (el, type, eventArguments, defaultFunction) {
    var evt;

    if (typeof el.nodeType == "undefined") {
      evt = new Evt(type);
      evt.target = el;
      if (eventArguments) extend(evt, eventArguments);

      // console.log("non-dom "+evt.type);
      Events.eventify(el);
      el.trigger(evt);
      if (defaultFunction && !evt.defaultPrevented)
        defaultFunction.call(el, evt);
    } else {
      evt = $.Event(type);
      evt.target = el;
      if (eventArguments) extend(evt, eventArguments);
      // console.log(evt);
      $(el).trigger(evt);
    }
  },

  /**
   * Extension method needed for MooTools
   */
  washMouseEvent: function (e) {
    return e;
  },

  /**
   * Animate a HTML element or SVG element wrapper
   * @param {Object} el
   * @param {Object} params
   * @param {Object} options jQuery-like animation options: duration, easing, callback
   */
  animate: function (el, params, options) {
    // sometimes called with SVGElement, a custom Highcharts class meant to be compatible with jQuery objects
    // set directly since we only support css animation (for now)
    if (el.attr) {
      for(k in params) el.attr(k, params[k]);
    } else {
      $(el).animate(params, options);
    }
  },

  /**
   * Stop running animation
   */
  stop: function (el) {
    // not directly supported by zepto. 
    // would need to memo-size the previously called properties 
    // (or whatever is being animated) and set them to the current values 
    // with 0 duration.
  }

};

})();
