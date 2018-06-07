'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var lodashEs = require('lodash-es');
var fbKey = require('firebase-key');
var convert = require('typed-conversions');

function _typeof(obj) {
  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    _typeof = function (obj) {
      return typeof obj;
    };
  } else {
    _typeof = function (obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };
  }

  return _typeof(obj);
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function");
  }

  _setPrototypeOf(subClass.prototype, superClass && superClass.prototype);

  if (superClass) _setPrototypeOf(subClass, superClass);
}

function _getPrototypeOf(o) {
  _getPrototypeOf = Object.getPrototypeOf || function _getPrototypeOf(o) {
    return o.__proto__;
  };

  return _getPrototypeOf(o);
}

function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };

  return _setPrototypeOf(o, p);
}

function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return self;
}

function _possibleConstructorReturn(self, call) {
  if (call && (typeof call === "object" || typeof call === "function")) {
    return call;
  }

  return _assertThisInitialized(self);
}

function _slicedToArray(arr, i) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest();
}

function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

function _iterableToArrayLimit(arr, i) {
  var _arr = [];
  var _n = true;
  var _d = false;
  var _e = undefined;

  try {
    for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);

      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }

  return _arr;
}

function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance");
}

function normalizeRef(r) {
  r = r.replace("/", ".");
  r = r.slice(0, 1) === "." ? r.slice(1) : r;
  return r;
}
function parts(r) {
  return normalizeRef(r).split(".");
}
/**
 * return the last component of the path
 * which typically would represent the 'id'
 * of a list-node
 */

function leafNode(r) {
  return parts(r).pop();
}
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
/**
 * Joins a set of paths together and converts into
 * correctly formatted "dot notation" directory path
 */

function join() {
  for (var _len = arguments.length, paths = new Array(_len), _key = 0; _key < _len; _key++) {
    paths[_key] = arguments[_key];
  }

  return paths.map(function (p) {
    return p.replace(/[\/\\]/gm, ".");
  }).map(function (p) {
    return p.slice(-1) === "." ? p.slice(0, p.length - 1) : p;
  }).map(function (p) {
    return p.slice(0, 1) === "." ? p.slice(1) : p;
  }).join(".");
}
function pathDiff(longPath, pathSubset) {
  var subset = pathSubset.split(".");
  var long = longPath.split(".");

  if (subset.length > long.length || JSON.stringify(long.slice(0, subset.length)) !== JSON.stringify(subset)) {
    throw new Error("\"".concat(pathSubset, "\" is not a subset of ").concat(longPath));
  }

  return long.length === subset.length ? "" : long.slice(subset.length - long.length).join(".");
}
/**
 * Given a path, returns the parent path and child key
 */

function keyAndParent(dotPath) {
  var sections = dotPath.split(".");
  var key = sections.pop();
  var parent = sections.join(".");
  return {
    parent: parent,
    key: key
  };
}
/** converts a '/' delimited path to a '.' delimited one */

function dotNotation(path) {
  path = path.slice(0, 1) === "/" ? path.slice(1) : path;
  return path ? path.replace(/\//g, ".") : undefined;
}
function slashNotation(path) {
  return path.replace(/\./g, "/");
}
/** Get the parent DB path */

function getParent(dotPath) {
  return keyAndParent(dotPath).parent;
}
/** Get the Key from the end of a path string */

function getKey(dotPath) {
  return keyAndParent(dotPath).key;
}
/** named network delays */

var Delays;

(function (Delays) {
  Delays["random"] = "random";
  Delays["weak"] = "weak-mobile";
  Delays["mobile"] = "mobile";
  Delays["WiFi"] = "WIFI";
})(Delays || (Delays = {}));

var _delay = 5;
function setNetworkDelay(value) {
  _delay = value;
}
function networkDelay(returnValue) {
  return new Promise(function (resolve) {
    setTimeout(function () {
      if (returnValue) {
        resolve(returnValue);
      } else {
        resolve();
      }
    }, calcDelay());
  });
}

function calcDelay() {
  var delay = _delay;

  if (typeof delay === "number") {
    return delay;
  }

  if (Array.isArray(delay)) {
    var _delay2 = _slicedToArray(delay, 2),
        min = _delay2[0],
        max = _delay2[1];

    return getRandomInt(min, max);
  }

  if (_typeof(delay) === "object" && !Array.isArray(delay)) {
    var _min = delay.min,
        _max = delay.max;
    return getRandomInt(_min, _max);
  } // these numbers need some reviewing


  if (delay === "random") {
    return getRandomInt(10, 300);
  }

  if (delay === "weak") {
    return getRandomInt(400, 900);
  }

  if (delay === "mobile") {
    return getRandomInt(300, 500);
  }

  if (delay === "WIFI") {
    return getRandomInt(10, 100);
  }

  throw new Error("Delay property is of unknown format: " + delay);
}

/**
 * Queue Class
 *
 * A generic class for building singleton queues;
 * this is used as a container for schemas, deployment queues,
 * and relationships
 */

var Queue =
/*#__PURE__*/
function () {
  function Queue(_name) {
    _classCallCheck(this, Queue);

    this._name = _name;
    this.pkProperty = "id";

    if (!_name) {
      throw new Error("A queue MUST have a named passed in to be managed");
    }

    if (!Queue._queues[_name]) {
      Queue._queues[_name] = [];
    }
  }

  _createClass(Queue, [{
    key: "enqueue",

    /**
     * Allows adding another item to the queue. It is expected
     * that this item WILL have the primary key included ('id' by
     * default)
     */
    value: function enqueue(queueItem) {
      Queue._queues[this._name].push(queueItem);

      return this;
    }
    /**
     * Similar to enqueue but the primary key is generated and passed
     * back to the caller.
     */

  }, {
    key: "push",
    value: function push(queueItem) {
      var id = fbKey.key();

      if (_typeof(queueItem) !== "object") {
        throw new Error("Using push() requires that the payload is an object");
      }

      queueItem[this.pkProperty] = id;
      this.enqueue(queueItem);
      return id;
    }
    /**
     * By passing in the key you will remove the given item from the queue
     */

  }, {
    key: "dequeue",
    value: function dequeue(key) {
      var _this = this;

      var queue = Queue._queues[this._name];

      if (queue.length === 0) {
        throw new Error("Queue ".concat(this._name, " is empty. Can not dequeue ").concat(key, "."));
      }

      Queue._queues[this._name] = _typeof(lodashEs.first(queue)) === "object" ? queue.filter(function (item) {
        return item[_this.pkProperty] !== key;
      }) : queue.filter(function (item) {
        return item !== key;
      });
      return this;
    }
  }, {
    key: "fromArray",
    value: function fromArray(payload) {
      Queue._queues[this._name] = payload;
      return this;
    }
  }, {
    key: "clear",
    value: function clear() {
      Queue._queues[this._name] = [];
      return this;
    }
  }, {
    key: "find",
    value: function find(key) {
      var _this$_find = this._find(key),
          _this$_find2 = _slicedToArray(_this$_find, 2),
          obj = _this$_find2[0],
          index = _this$_find2[1];

      return obj;
    }
  }, {
    key: "indexOf",
    value: function indexOf(key) {
      var _this$_find3 = this._find(key),
          _this$_find4 = _slicedToArray(_this$_find3, 2),
          obj = _this$_find4[0],
          index = _this$_find4[1];

      return index;
    }
  }, {
    key: "includes",
    value: function includes(key) {
      return this.find(key) ? true : false;
    }
  }, {
    key: "replace",
    value: function replace(key, value) {
      value[this.pkProperty] = key;
      this.dequeue(key).enqueue(value);
      return this;
    }
  }, {
    key: "update",
    value: function update(key, value) {
      var currently = this.find(key);

      if (currently) {
        this.dequeue(key);
      }

      if (_typeof(currently) === "object" && _typeof(value) === "object") {
        value[this.pkProperty] = key;
        var updated = Object.assign({}, currently, value);
        this.enqueue(updated);
      } else {
        throw new Error("Current and updated values must be objects!");
      }

      return this;
    }
  }, {
    key: "toArray",

    /** returns the Queue as a JS array */
    value: function toArray() {
      return Queue._queues && Queue._queues[this._name] ? Queue._queues[this._name] : [];
    }
    /** returns the Queue as a JS Object */

  }, {
    key: "toHash",
    value: function toHash() {
      var _this2 = this;

      var queue = Queue._queues[this._name];

      if (!queue || queue.length === 0) {
        return new Object();
      }

      return _typeof(lodashEs.first(queue)) === "object" ? queue.reduce(function (obj, item) {
        var pk = item[_this2.pkProperty]; // tslint:disable-next-line

        var o = Object.assign({}, item);
        delete o[_this2.pkProperty];
        return Object.assign({}, obj, _defineProperty({}, pk, o));
      }, new Object()) : queue.reduce(function (obj, item) {
        return obj = Object.assign({}, obj, _defineProperty({}, item, true));
      }, new Object());
    }
  }, {
    key: "map",
    value: function map(fn) {
      var queuedSchemas = Queue._queues[this._name];
      return queuedSchemas ? queuedSchemas.map(fn) : [];
    }
  }, {
    key: "filter",
    value: function filter(fn) {
      var queue = Queue._queues[this._name];
      return queue ? queue.filter(fn) : [];
    }
  }, {
    key: "toJSON",
    value: function toJSON() {
      return JSON.stringify(Queue._queues);
    }
  }, {
    key: "toObject",
    value: function toObject() {
      return Queue._queues;
    }
  }, {
    key: "_find",
    value: function _find(key) {
      var queue = Queue._queues[this._name];
      var objectPayload = _typeof(lodashEs.first(queue)) === "object";
      var index = 0;
      var result = [null, -1];
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = queue[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var item = _step.value;
          var condition = objectPayload ? item[this.pkProperty] === key : item === key;

          if (condition) {
            result = [item, index];
            break;
          }

          index++;
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return != null) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      return result;
    }
  }, {
    key: "name",
    get: function get() {
      return this._name;
    }
  }, {
    key: "length",
    get: function get() {
      return Queue._queues[this._name].length;
    }
  }], [{
    key: "clearAll",
    value: function clearAll() {
      Queue._queues = {};
    }
  }]);

  return Queue;
}();
Queue._queues = {};

var exceptions = {
  child: 'children',
  man: 'men',
  woman: 'women',
  tooth: 'teeth',
  foot: 'feet',
  mouse: 'mice',
  person: 'people',
  company: 'companies'
};

function pluralize(singular) {
  var rules = [{
    find: /(.*)(ch|sh|ax|ss)$/,
    replace: '$1$2es'
  }, {
    find: /(.*)(fe|f)$/,
    replace: '$1ves'
  }, {
    find: /(.*)us$/,
    replace: '$1i'
  }];

  for (var _i = 0; _i < rules.length; _i++) {
    var r = rules[_i];

    if (r.find.test(singular)) {
      return singular.replace(r.find, r.replace);
    }
  }

  return exceptions[singular] ? exceptions[singular] : "".concat(singular, "s");
}
var addException = function addException(singular, plural) {
  exceptions[singular] = plural;
};

var db = [];
var _listeners = [];
function clearDatabase() {
  db = {};
}
function updateDatabase(state) {
  db = Object.assign({}, db, state);
}
function setDB(path, value) {
  var dotPath = join(path);
  var oldValue = lodashEs.get(db, dotPath);
  lodashEs.set(db, dotPath, value);
  notify(dotPath, value, oldValue);
}
/** single-path update */

function updateDB(path, value) {
  var dotPath = join(path);
  var oldValue = lodashEs.get(db, dotPath);
  var newValue = _typeof(oldValue) === "object" ? Object.assign({}, oldValue, value) : value;
  lodashEs.set(db, dotPath, newValue);
  notify(dotPath, newValue, oldValue);
}
function multiPathUpdateDB(data) {
  Object.keys(data).map(function (key) {
    return setDB(key, data[key]);
  });
}
function removeDB(path) {
  var dotPath = join(path);
  var oldValue = lodashEs.get(db, dotPath);
  var parentValue = lodashEs.get(db, getParent(dotPath));

  if (_typeof(parentValue) === "object") {
    delete parentValue[getKey(dotPath)];
    lodashEs.set(db, getParent(dotPath), parentValue);
  } else {
    lodashEs.set(db, dotPath, undefined);
  }

  notify(dotPath, undefined, oldValue);
}
function pushDB(path, value) {
  var pushId = fbKey.key();
  var fullPath = join(path, pushId);
  setDB(fullPath, value);
  return pushId;
}
function addListener(path, eventType, callback, cancelCallbackOrContext, context) {
  _listeners.push({
    path: join(path),
    eventType: eventType,
    callback: callback,
    cancelCallbackOrContext: cancelCallbackOrContext,
    context: context
  });
}

function cancelCallback(removed) {
  var count = 0;
  removed.forEach(function (l) {
    if (typeof l.cancelCallbackOrContext === "function") {
      // l.cancelCallbackOrContext();
      count++;
    }
  });
  return count;
}

function removeAllListeners() {
  var howMany = cancelCallback(_listeners);
  _listeners = [];
  return howMany;
}
/**
 * Notifies all appropriate "child" event listeners when changes
 * in state happen
 *
 * @param dotPath the path where the change was made
 * @param newValue the new value
 * @param oldValue the prior value
 */

function notify(dotPath, newValue, oldValue) {
  if (JSON.stringify(newValue) !== JSON.stringify(oldValue)) {
    findValueListeners(dotPath).map(function (l) {
      var result = {};
      var listeningRoot = lodashEs.get(db, l.path);

      if (_typeof(listeningRoot) === "object" && !newValue) {
        result = lodashEs.get(db, l.path);
        delete result[getKey(dotPath)];
      } else {
        lodashEs.set(result, pathDiff(dotPath, l.path), newValue);
      }

      return l.callback(new SnapShot(join(l.path), result));
    });

    if (newValue === undefined) {
      var _keyAndParent = keyAndParent(dotPath),
          parent = _keyAndParent.parent,
          key = _keyAndParent.key;

      findChildListeners(parent, "child_removed", "child_changed").forEach(function (l) {
        return l.callback(new SnapShot(key, newValue));
      });
    } else if (oldValue === undefined) {
      var _keyAndParent2 = keyAndParent(dotPath),
          _parent = _keyAndParent2.parent,
          _key = _keyAndParent2.key;

      findChildListeners(_parent, "child_added", "child_changed").forEach(function (l) {
        return l.callback(new SnapShot(_key, newValue));
      });
    }
  }
}
/**
 * Finds "child events" listening to a given parent path; optionally
 * allowing for specification of the specific event type
 *
 * @param path the parent path that children are detected off of
 * @param eventType <optional> the specific child event to filter down to
 */


function findChildListeners(path) {
  for (var _len = arguments.length, eventType = new Array(_len > 1 ? _len - 1 : 0), _key2 = 1; _key2 < _len; _key2++) {
    eventType[_key2 - 1] = arguments[_key2];
  }

  var correctPath = _listeners.filter(function (l) {
    return l.path === join(path) && l.eventType !== "value";
  });

  return eventType.length > 0 ? correctPath.filter(function (l) {
    return eventType.indexOf(l.eventType) !== -1;
  }) : correctPath;
}
/**
 * Finds all value listeners on a given path or below.
 * Unlike child listeners, Value listeners listen to changes at
 * all points below the registered path.
 *
 * @param path path to root listening point
 */

function findValueListeners(path) {
  return _listeners.filter(function (l) {
    return join(path).indexOf(join(l.path)) !== -1 && l.eventType === "value";
  });
}
/** Clears the DB and removes all listeners */

function reset$$1() {
  removeAllListeners();
  clearDatabase();
}

var Deployment =
/*#__PURE__*/
function () {
  function Deployment() {
    _classCallCheck(this, Deployment);

    this._queue = new Queue("queue");
    this._schemas = new Queue("schemas");
    this._relationships = new Queue("relationships");
  }
  /**
   * Queue a schema for deployment to the mock DB
   */


  _createClass(Deployment, [{
    key: "queueSchema",
    value: function queueSchema(
    /** A unique reference to the schema being queued for generation */
    schemaId) {
      var quantity = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
      var overrides = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      this.schemaId = schemaId;
      this.queueId = fbKey.key();

      var schema = this._schemas.find(schemaId);

      if (!schema) {
        console.log("Schema \"".concat(schema, "\" does not exist; will SKIP."));
      } else {
        var newQueueItem = {
          id: this.queueId,
          schema: schemaId,
          prefix: schema.prefix,
          quantity: quantity,
          overrides: overrides
        };

        this._queue.enqueue(newQueueItem);
      }

      return this;
    }
    /**
     * Provides specificity around how many of a given
     * "hasMany" relationship should be fulfilled of
     * the schema currently being queued.
     */

  }, {
    key: "quantifyHasMany",
    value: function quantifyHasMany(targetSchema, quantity) {
      var _this = this;

      var hasMany = this._relationships.filter(function (r) {
        return r.type === "hasMany" && r.source === _this.schemaId;
      });

      var targetted = hasMany.filter(function (r) {
        return r.target === targetSchema;
      });

      if (hasMany.length === 0) {
        console.log("Attempt to quantify \"hasMany\" relationships with schema \"".concat(this.schemaId, "\" is not possible; no such relationships exist"));
      } else if (targetted.length === 0) {
        console.log("The \"".concat(targetSchema, "\" schema does not have a \"hasMany\" relationship with the \"").concat(this.schemaId, "\" model"));
      } else {
        var queue = this._queue.find(this.queueId);

        this._queue.update(this.queueId, {
          hasMany: Object.assign({}, queue.hasMany, _defineProperty({}, pluralize(targetSchema), quantity))
        });
      }

      return this;
    }
    /**
     * Indicates the a given "belongsTo" should be fulfilled with a
     * valid FK reference when this queue is generated.
     */

  }, {
    key: "fulfillBelongsTo",
    value: function fulfillBelongsTo(targetSchema) {
      var _this2 = this;

      var schema = this._schemas.find(this.schemaId);

      var relationship = lodashEs.first(this._relationships.filter(function (r) {
        return r.source === _this2.schemaId;
      }).filter(function (r) {
        return r.target === targetSchema;
      }));
      var sourceProperty = schema.path();

      var queue = this._queue.find(this.queueId);

      this._queue.update(this.queueId, {
        belongsTo: Object.assign({}, queue.belongsTo, _defineProperty({}, "".concat(targetSchema, "Id"), true))
      });

      return this;
    }
  }, {
    key: "generate",
    value: function generate() {
      var _this3 = this;

      this._queue.map(function (q) {
        for (var i = q.quantity; i > 0; i--) {
          _this3.insertMockIntoDB(q.schema, q.overrides);
        }
      });

      this._queue.map(function (q) {
        for (var i = q.quantity; i > 0; i--) {
          _this3.insertRelationshipLinks(q);
        }
      });

      this._queue.clear();
    }
  }, {
    key: "insertMockIntoDB",
    value: function insertMockIntoDB(schemaId, overrides) {
      var schema = this._schemas.find(schemaId);

      var mock = schema.fn();
      var path = schema.path();
      var key = fbKey.key();
      lodashEs.set(db, dotNotation(path) + ".".concat(key), _typeof(mock) === "object" ? Object.assign({}, mock, overrides) : overrides && _typeof(overrides) !== "object" ? overrides : mock);
      return key;
    }
  }, {
    key: "insertRelationshipLinks",
    value: function insertRelationshipLinks(queue) {
      var _this4 = this;

      var relationships = this._relationships.filter(function (r) {
        return r.source === queue.schema;
      });

      var belongsTo = relationships.filter(function (r) {
        return r.type === "belongsTo";
      });
      var hasMany = relationships.filter(function (r) {
        return r.type === "hasMany";
      });
      belongsTo.forEach(function (r) {
        var fulfill = Object.keys(queue.belongsTo || {}).filter(function (v) {
          return queue.belongsTo[v] === true;
        }).indexOf(r.sourceProperty) !== -1;

        var source = _this4._schemas.find(r.source);

        var target = _this4._schemas.find(r.target);

        var getID;

        if (fulfill) {
          var mockAvailable = _this4._schemas.find(r.target) ? true : false;
          var available = Object.keys(db[pluralize(r.target)] || {});
          var generatedAvailable = available.length > 0;
          var numChoices = (db[r.target] || []).length;

          var choice = function choice() {
            return generatedAvailable ? available[getRandomInt(0, available.length - 1)] : _this4.insertMockIntoDB(r.target, {});
          };

          getID = function getID() {
            return mockAvailable ? generatedAvailable ? choice() : _this4.insertMockIntoDB(r.target, {}) : fbKey.key();
          };
        } else {
          getID = function getID() {
            return "";
          };
        }

        var property = r.sourceProperty;
        var path = source.path();
        var recordList = lodashEs.get(db, dotNotation(source.path()), {});
        Object.keys(recordList).forEach(function (key) {
          lodashEs.set(db, "".concat(dotNotation(source.path()), ".").concat(key, ".").concat(property), getID());
        });
      });
      hasMany.forEach(function (r) {
        var fulfill = Object.keys(queue.hasMany || {}).indexOf(r.sourceProperty) !== -1;
        var howMany = fulfill ? queue.hasMany[r.sourceProperty] : 0;

        var source = _this4._schemas.find(r.source);

        var target = _this4._schemas.find(r.target);

        var getID;

        if (fulfill) {
          var mockAvailable = _this4._schemas.find(r.target) ? true : false;
          var available = Object.keys(db[pluralize(r.target)] || {});
          var used = [];
          var generatedAvailable = available.length > 0;
          var numChoices = (db[pluralize(r.target)] || []).length;

          var choice = function choice(pool) {
            if (pool.length > 0) {
              var chosen = pool[getRandomInt(0, pool.length - 1)];
              used.push(chosen);
              return chosen;
            }

            return _this4.insertMockIntoDB(r.target, {});
          };

          getID = function getID() {
            return mockAvailable ? choice(available.filter(function (a) {
              return used.indexOf(a) === -1;
            })) : fbKey.key();
          };
        } else {
          getID = function getID() {
            return undefined;
          };
        }

        var property = r.sourceProperty;
        var path = source.path();
        var sourceRecords = lodashEs.get(db, dotNotation(source.path()), {});
        Object.keys(sourceRecords).forEach(function (key) {
          for (var i = 1; i <= howMany; i++) {
            lodashEs.set(db, "".concat(dotNotation(source.path()), ".").concat(key, ".").concat(property, ".").concat(getID()), true);
          }
        });
      });
    }
  }]);

  return Deployment;
}();

/* tslint:disable:max-classes-per-file */

var Mock$$1 =
/*#__PURE__*/
function () {
  function Mock$$1(raw) {
    _classCallCheck(this, Mock$$1);

    this._schemas = new Queue("schemas").clear();
    this._relationships = new Queue("relationships").clear();
    this._queues = new Queue("queues").clear();
    Queue.clearAll();
    clearDatabase();

    if (raw) {
      this.updateDB(raw);
    }
  }
  /**
   * Update the mock DB with a raw JS object/hash
   */


  _createClass(Mock$$1, [{
    key: "updateDB",
    value: function updateDB$$1(state) {
      updateDatabase(state);
    }
  }, {
    key: "addSchema",
    value: function addSchema(schema, mock) {
      var s = new Schema(schema);

      if (mock) {
        s.mock(mock);
      }

      return new Schema(schema);
    }
    /** Set the network delay for queries with "once" */

  }, {
    key: "setDelay",
    value: function setDelay(d) {
      setNetworkDelay(d);
    }
  }, {
    key: "queueSchema",
    value: function queueSchema(schemaId) {
      var quantity = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
      var overrides = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      var d = new Deployment();
      d.queueSchema(schemaId, quantity, overrides);
      return d;
    }
  }, {
    key: "generate",
    value: function generate() {
      return new Deployment().generate();
    }
  }, {
    key: "ref",
    value: function ref(dbPath) {
      return new Reference$$1(dbPath);
    }
  }, {
    key: "db",
    get: function get() {
      return db;
    }
  }, {
    key: "deploy",
    get: function get() {
      return new Deployment();
    }
  }]);

  return Mock$$1;
}();

var SchemaHelper =
/*#__PURE__*/
function () {
  function SchemaHelper(raw) {
    _classCallCheck(this, SchemaHelper);

    this._db = raw;
  }

  _createClass(SchemaHelper, [{
    key: "faker",
    get: function get() {
      var faker = require("faker");

      return faker;
    }
  }, {
    key: "chance",
    get: function get() {
      var chance = require("chance");

      return chance();
    }
  }]);

  return SchemaHelper;
}();

function isMultiPath(data) {
  Object.keys(data).map(function (d) {
    if (!d) {
      data[d] = "/";
    }
  });
  var indexesAreStrings = Object.keys(data).every(function (i) {
    return typeof i === "string";
  });
  var indexesLookLikeAPath = Object.keys(data).every(function (i) {
    return i.indexOf("/") !== -1;
  });
  return indexesAreStrings && indexesLookLikeAPath ? true : false;
}

var Reference$$1 =
/*#__PURE__*/
function (_Query) {
  function Reference$$1() {
    _classCallCheck(this, Reference$$1);

    return _possibleConstructorReturn(this, _getPrototypeOf(Reference$$1).apply(this, arguments));
  }

  _createClass(Reference$$1, [{
    key: "child",
    value: function child(path) {
      var r = parts(this.path).concat([path]).join(".");
      return new Reference$$1(r, lodashEs.get(db, r));
    }
  }, {
    key: "push",
    value: function push(value, onComplete) {
      var id = pushDB(this.path, value);
      this.path = join(this.path, id);

      if (onComplete) {
        onComplete(null);
      }

      return networkDelay(this); // TODO: try and get this typed appropriately
    }
  }, {
    key: "remove",
    value: function remove(onComplete) {
      removeDB(this.path);

      if (onComplete) {
        onComplete(null);
      }

      return networkDelay();
    }
  }, {
    key: "set",
    value: function set(value, onComplete) {
      setDB(this.path, value);

      if (onComplete) {
        onComplete(null);
      }

      return networkDelay();
    }
  }, {
    key: "update",
    value: function update(values, onComplete) {
      if (isMultiPath(values)) {
        multiPathUpdateDB(values);
      } else {
        updateDB(this.path, values);
      }

      if (onComplete) {
        onComplete(null);
      }

      return networkDelay();
    }
  }, {
    key: "setPriority",
    value: function setPriority(priority, onComplete) {
      return networkDelay();
    }
  }, {
    key: "setWithPriority",
    value: function setWithPriority(newVal, newPriority, onComplete) {
      return networkDelay();
    }
  }, {
    key: "transaction",
    value: function transaction(transactionUpdate, onComplete, applyLocally) {
      return Promise.resolve({
        committed: true,
        snapshot: null,
        toJSON: function toJSON() {
          return {};
        }
      });
    }
  }, {
    key: "onDisconnect",
    value: function onDisconnect() {
      return {};
    }
  }, {
    key: "toString",
    value: function toString() {
      return slashNotation(join("https://mockdb.local", this.path, this.key));
    }
  }, {
    key: "key",
    get: function get() {
      return this.path.split(".").pop();
    }
  }, {
    key: "parent",
    get: function get() {
      var r = parts(this.path).slice(-1).join(".");
      return new Reference$$1(r, lodashEs.get(db, r));
    }
  }, {
    key: "root",
    get: function get() {
      return new Reference$$1("/", db);
    }
  }]);

  _inherits(Reference$$1, _Query);

  return Reference$$1;
}(Query);

var SnapShot =
/*#__PURE__*/
function () {
  function SnapShot(_key, _value) {
    _classCallCheck(this, SnapShot);

    this._key = _key;
    this._value = _value;
  }

  _createClass(SnapShot, [{
    key: "val",
    value: function val() {
      return Array.isArray(this._value) ? convert.arrayToHash(this._value) : this._value;
    }
  }, {
    key: "toJSON",
    value: function toJSON() {
      return JSON.stringify(this._value);
    }
  }, {
    key: "child",
    value: function child(path) {
      var value = lodashEs.get(this._value, path, null);
      return value ? new SnapShot(path, value) : null;
    }
  }, {
    key: "hasChild",
    value: function hasChild(path) {
      if (_typeof(this._value) === "object") {
        return Object.keys(this._value).indexOf(path) !== -1;
      }

      return false;
    }
  }, {
    key: "hasChildren",
    value: function hasChildren() {
      if (_typeof(this._value) === "object") {
        return Object.keys(this._value).length > 0;
      }

      return false;
    }
  }, {
    key: "numChildren",
    value: function numChildren() {
      if (_typeof(this._value) === "object") {
        return Object.keys(this._value).length;
      }

      return 0;
    }
  }, {
    key: "exists",
    value: function exists() {
      return this._value !== null;
    }
  }, {
    key: "forEach",
    value: function forEach(actionCb) {
      var cloned = this._value.slice(0);

      var sorted = cloned.sort(this._sortingFunction);
      sorted.map(function (item) {
        var noId = Object.assign({}, item);
        delete noId.id;
        var halt = actionCb(new SnapShot(item.id, noId));

        if (halt) {
          return true;
        }
      });
      return false;
    }
    /** NOTE: mocking proxies this call through to val(), no use of "priority" */

  }, {
    key: "exportVal",
    value: function exportVal() {
      return this.val();
    }
  }, {
    key: "getPriority",
    value: function getPriority() {
      return null;
    }
    /**
     * Used by Query objects to instruct the snapshot the sorting function to use
     */

  }, {
    key: "sortingFunction",
    value: function sortingFunction(fn) {
      this._sortingFunction = fn;
      return this;
    }
  }, {
    key: "key",
    get: function get() {
      return getKey(join(this._key));
    }
  }, {
    key: "ref",
    get: function get() {
      return new Reference$$1(this._key);
    }
  }]);

  return SnapShot;
}();

var OrderingType;

(function (OrderingType) {
  OrderingType["byChild"] = "child";
  OrderingType["byKey"] = "key";
  OrderingType["byValue"] = "value";
})(OrderingType || (OrderingType = {}));
/** tslint:ignore:member-ordering */


var Query =
/*#__PURE__*/
function () {
  function Query(path) {
    var _delay = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 5;

    _classCallCheck(this, Query);

    this.path = path;
    this._delay = _delay;
    this._order = {
      type: OrderingType.byKey,
      value: null
    };
    this._listeners = new Queue("listeners");
    this._limitFilters = [];
    this._queryFilters = [];
  }

  _createClass(Query, [{
    key: "limitToLast",
    value: function limitToLast(num) {
      var filter = function filter(resultset) {
        return resultset.slice(resultset.length - num);
      };

      this._limitFilters.push(filter);

      return this;
    }
  }, {
    key: "limitToFirst",
    value: function limitToFirst(num) {
      var filter = function filter(resultset) {
        return resultset.slice(0, num);
      };

      this._limitFilters.push(filter);

      return this;
    }
  }, {
    key: "equalTo",
    value: function equalTo(value, key) {
      var _this = this;

      if (key && this._order.type === OrderingType.byKey) {
        throw new Error("You can not use equalTo's key property when using a key sort!");
      }

      key = key ? key : this._order.value;

      var filter = function filter(resultset) {
        var comparison = function comparison(item) {
          return item[key];
        };

        if (!key) {
          switch (_this._order.type) {
            case OrderingType.byChild:
              comparison = function comparison(item) {
                return item[_this._order.value];
              };

              break;

            case OrderingType.byKey:
              comparison = function comparison(item) {
                return item.id;
              };

              break;

            case OrderingType.byValue:
              comparison = function comparison(item) {
                return item;
              };

              break;

            default:
              throw new Error("unknown ordering type: " + _this._order.type);
          }
        }

        return resultset.filter(function (item) {
          return comparison(item) === value;
        });
      };

      this._queryFilters.push(filter);

      return this;
    }
    /** Creates a Query with the specified starting point. */

  }, {
    key: "startAt",
    value: function startAt(value, key) {
      key = key ? key : this._order.value;

      var filter = function filter(resultset) {
        return resultset.filter(function (record) {
          return key ? record[key] >= value : record >= value;
        });
      };

      this._queryFilters.push(filter);

      return this;
    }
  }, {
    key: "endAt",
    value: function endAt(value, key) {
      key = key ? key : this._order.value;

      var filter = function filter(resultset) {
        return resultset.filter(function (record) {
          return key ? record[key] <= value : record <= value;
        });
      };

      this._queryFilters.push(filter);

      return this;
    }
  }, {
    key: "on",
    value: function on(eventType, callback, cancelCallbackOrContext, context) {
      addListener(this.path, eventType, callback, cancelCallbackOrContext, context);
      return null;
    }
  }, {
    key: "once",
    value: function once(eventType) {
      return networkDelay(this.process());
    }
  }, {
    key: "off",
    value: function off() {
      console.log("off() not implemented yet");
    }
    /** NOT IMPLEMENTED YET */

  }, {
    key: "isEqual",
    value: function isEqual(other) {
      return false;
    }
    /**
     * When the children of a query are all objects, then you can sort them by a
     * specific property. Note: if this happens a lot then it's best to explicitly
     * index on this property in the database's config.
     */

  }, {
    key: "orderByChild",
    value: function orderByChild(prop) {
      this._order = {
        type: OrderingType.byChild,
        value: prop
      };
      return this;
    }
    /**
     * When the children of a query are all scalar values (string, number, boolean), you
     * can order the results by their (ascending) values
     */

  }, {
    key: "orderByValue",
    value: function orderByValue() {
      this._order = {
        type: OrderingType.byValue,
        value: null
      };
      return this;
    }
    /**
     * This is the default sort
     */

  }, {
    key: "orderByKey",
    value: function orderByKey() {
      this._order = {
        type: OrderingType.byKey,
        value: null
      };
      return this;
    }
    /** NOT IMPLEMENTED */

  }, {
    key: "orderByPriority",
    value: function orderByPriority() {
      return this;
    }
  }, {
    key: "toJSON",
    value: function toJSON() {
      return JSON.stringify(this);
    }
  }, {
    key: "toString",
    value: function toString() {
      return "".concat(process.env.FIREBASE_DATA_ROOT_URL, "/").concat(this.path);
    }
    /**
     * This is an undocumented API endpoint that is within the
     * typing provided by Google
     */

  }, {
    key: "getKey",
    value: function getKey$$1() {
      return null;
    }
    /**
     * This is an undocumented API endpoint that is within the
     * typing provided by Google
     */

  }, {
    key: "getParent",
    value: function getParent$$1() {
      return null;
    }
    /**
     * This is an undocumented API endpoint that is within the
     * typing provided by Google
     */

  }, {
    key: "getRoot",
    value: function getRoot() {
      return null;
    }
    /**
     * Reduce the dataset using filters (after sorts) but do not apply sort
     * order to new SnapShot (so natural order is preserved)
     */

  }, {
    key: "process",
    value: function process() {
      // typically a hash/object but could be a JS native type (string/number/boolean)
      var input = lodashEs.get(db, join(this.path), undefined);
      var snap;

      if (_typeof(input) !== "object") {
        snap = new SnapShot(leafNode(this.path), input);
      } else {
        var mockDatabaseResults = convert.hashToArray(input);
        var sorted = this.processSorting(mockDatabaseResults);
        var remainingIds = this.processFilters(sorted).map(function (f) {
          return _typeof(f) === "object" ? f.id : f;
        });
        snap = new SnapShot(leafNode(this.path), mockDatabaseResults.filter(function (record) {
          return remainingIds.indexOf(record.id) !== -1;
        }));
      }

      snap.sortingFunction(this.getSortingFunction(this._order));
      return snap;
    }
    /**
     * Processes all Filter Queries to reduce the resultset
     */

  }, {
    key: "processFilters",
    value: function processFilters(inputArray) {
      var output = inputArray.slice(0);

      this._queryFilters.forEach(function (q) {
        return output = q(output);
      });

      this._limitFilters.forEach(function (q) {
        return output = q(output);
      });

      return output;
    }
  }, {
    key: "processSorting",
    value: function processSorting(inputArray) {
      var sortFn = this.getSortingFunction(this._order);
      var sorted = inputArray.slice(0).sort(sortFn);
      return sorted;
    }
    /**
     * Returns a sorting function for the given Sort Type
     */

  }, {
    key: "getSortingFunction",
    value: function getSortingFunction(sortType) {
      var sort;

      switch (sortType.type) {
        case OrderingType.byKey:
          sort = function sort(a, b) {
            return a.id > b.id ? -1 : a.id === b.id ? 0 : 1;
          };

          break;

        case OrderingType.byValue:
          sort = function sort(a, b) {
            return a.value > b.value ? -1 : a.value === b.value ? 0 : 1;
          };

          break;

        case OrderingType.byChild:
          var child = this._order.value;

          sort = function sort(a, b) {
            return a[child] > b[child] ? -1 : a[child] === b[child] ? 0 : 1;
          };

          break;
      }

      return sort;
    }
  }, {
    key: "ref",
    get: function get() {
      return new Reference$$1(this.path, this._delay);
    }
  }]);

  return Query;
}();

var Schema =
/*#__PURE__*/
function () {
  function Schema(schemaId) {
    _classCallCheck(this, Schema);

    this.schemaId = schemaId;
    this._schemas = new Queue("schemas");
    this._relationships = new Queue("relationships");
    this._prefix = "";
  }
  /**
   * Add a mocking function to be used to generate the schema in mock DB
   */


  _createClass(Schema, [{
    key: "mock",
    value: function mock(cb) {
      var _this = this;

      this._schemas.enqueue({
        id: this.schemaId,
        fn: cb(new SchemaHelper({})),
        path: function path() {
          var schema = _this._schemas.find(_this.schemaId);

          return [schema.prefix, schema.modelName ? pluralize(schema.modelName) : pluralize(_this.schemaId)].join("/");
        }
      });

      return this;
    }
    /**
     * There are times where it's appropriate to have multiple schemas for
     * the same entity/model, in this case you'll want to state what model
     * your schema is emulating. If you don't state this property it assumes
     * the schema name IS the model name
     */

  }, {
    key: "modelName",
    value: function modelName(value) {
      this._schemas.update(this.schemaId, {
        modelName: value
      });

      return this;
    }
    /** prefixes a static path to the beginning of the  */

  }, {
    key: "pathPrefix",
    value: function pathPrefix(prefix) {
      prefix = prefix.replace(/\./g, "/"); // slash reference preferred over dot

      prefix = prefix.slice(-1) === "/" ? prefix.slice(0, prefix.length - 1) : prefix;

      this._schemas.update(this.schemaId, {
        prefix: prefix
      });

      return this;
    }
    /**
     * The default pluralizer is quite simple so if you find that
     * it is pluralizing incorrectly then you can manually state
     * the plural name.
     */

  }, {
    key: "pluralName",
    value: function pluralName(plural) {
      var model = this._schemas.find(this.schemaId).modelName ? this._schemas.find(this.schemaId).modelName : this.schemaId;
      addException(model, plural);
      return this;
    }
    /**
     * Configures a "belongsTo" relationship with another schema/entity
     */

  }, {
    key: "belongsTo",
    value: function belongsTo(target, sourceProperty) {
      this._relationships.push({
        type: "belongsTo",
        source: this.schemaId,
        target: target,
        sourceProperty: sourceProperty ? sourceProperty : "".concat(target, "Id")
      });

      return this;
    }
    /**
     * Configures a "hasMany" relationship with another schema/entity
     */

  }, {
    key: "hasMany",
    value: function hasMany(target, sourceProperty) {
      this._relationships.push({
        type: "hasMany",
        source: this.schemaId,
        target: target,
        sourceProperty: sourceProperty ? sourceProperty : pluralize(target)
      });

      return this;
    }
    /** Add another schema */

  }, {
    key: "addSchema",
    value: function addSchema(schema, mock) {
      var s = new Schema(schema);

      if (mock) {
        s.mock(mock);
      }

      return new Schema(schema);
    }
  }]);

  return Schema;
}();

exports.Mock = Mock$$1;
exports.SchemaHelper = SchemaHelper;
exports.Reference = Reference$$1;
exports.Query = Query;
exports.SnapShot = SnapShot;
exports.Queue = Queue;
exports.Schema = Schema;
exports.resetDatabase = reset$$1;
