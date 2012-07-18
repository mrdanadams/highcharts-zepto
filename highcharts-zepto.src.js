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

// bundle in MicroEvent (https://github.com/jeromeetienne/microevent.js)
// needed to handle events on non-DOM objects
/**
 * MicroEvent - to make any js object an event emitter (server or browser)
 * 
 * - pure javascript - server compatible, browser compatible
 * - dont rely on the browser doms
 * - super simple - you get it immediatly, no mistery, no magic involved
 *
 * - create a MicroEventDebug with goodies to debug
 *   - make it safer to use
*/

var MicroEvent  = function(){}
MicroEvent.prototype  = {
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
  trigger : function(event /* , args... */){
    this._events = this._events || {};
    if( event in this._events === false  )  return;
    for(var i = 0; i < this._events[event].length; i++){
      this._events[event][i].apply(this, Array.prototype.slice.call(arguments, 1))
    }
  }
};

function eventify(o) {
  if (o._events) return;
  extend(o, MicroEvent.prototype);
}

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
    return +$(el).css(method);
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
    if (typeof el.nodeType == "undefined") {
      eventify(el);
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
      eventify(el);
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
    if (typeof el.nodeType == "undefined") {
      eventify(el);
      el.trigger(type);
      // TODO need eventArguments?
    } else {
      var evt = $.Event(type);
      extend(evt, eventArguments);
      $(el).trigger(evt);
      // FIXME check for defaultFunction
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
