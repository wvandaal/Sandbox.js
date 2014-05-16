// TODO:
// 1) write isType() functions for string, array, object and
//    integrate into typeof/instanceof tests (see $.isPlainObject)
// 2) Rewrite Asset.prototype.load to allow for callbacks

(function(window, undefined) {
  "use strict";

  var FIELDS = ['version', 'description', 'assets'],
  DEFAULTS = ['name', 'latest'],

  // readyStates 
  PRELOADING = 1,
  PRELOADED  = 2,
  LOADING    = 3,
  LOADED     = 4,

  // Parse file extensions
  extRE = /[\w\.\/]+\.(\w+)$/,

  // Store reference to old __ object
  old__ = window.__,

  // Create proper reference to 'document' object
  document = window.document,

  // Utility function to create resource tags given a path
  // and an extension stored in the __.extensions object.
  // Any extension not stored in the __.extensions object
  // will cause the function to return null
  _createTag = function(path, ext, callback) {
    var extProps  = this.extensions[ext],
        tag;

    if (!this.extensions[ext] || !(typeof path === 'string'))
      return null;

    tag = document.createElement(extProps.tagName);

    for (var a in extProps.attributes)
      tag.setAttribute(a, extProps.attributes[a]);

    tag.setAttribute(extProps.pathAttr, path);

    if (typeof callback === 'function')
      tag.onload = callback;

    return tag;
  },

  _removeTag = function(path, ext) {
    var tagName, tags, pathAttr;
    if (!(typeof path === 'string') || !(this.extensions[ext]))
      return null;

    tagName = this.extensions[ext].tagName;
    pathAttr = this.extensions[ext].pathAttr;

    tags = document.querySelectorAll(tagName + '[' + pathAttr + '="' + path + '"]');

    [].forEach.call(tags, function(tag) { tag.remove(); })
    return tags.length ? tags: null;
  },

  // Utility function to append a list of tags to the 'head'
  // of the document. This function will skip any undefined or
  // null tags elements contained in the tags array
  _appendToHead = function(tags) {
    var head = document.querySelector('head');
    if (tags instanceof Array) {
      tags.forEach(function(tag){
        if (tag) 
          head.appendChild(tag); 
      });
    } else {
      head.appendChild(tags);
    }
  },

  __ = function() {
    var that    = this,
        args    = Array.apply(null, arguments),
        queries = [],
        results = {},
        callback;

    if ((args[0] instanceof Array)) {
      queries = args[0];
      callback = typeof args[1] === 'function' ? args[1] : null;
    } else {
      args.forEach(function(a) {
        if (typeof a === 'function') {
          callback = a;
        } else if (typeof a === 'string') {
          queries.push(a);
        }
      });
    }

    if (!this || this === window) {
      return new __(queries, callback);
    } else {
      queries.forEach(function(q) { results[q] = new Search(q, that); });
      this.onload = callback;
      this.queries = queries;
      this.loaded = false;
      this.results = results;
    }
  };

  __.prototype.allLoaded = function() {
    if (this.loaded) 
      return true;

    for (var query in this.results)
      if (this.results[query]._state !== LOADED && 
          this.results.hasOwnProperty(query))
        return false;

    return this.loaded = true;
  };

  __.prototype.loadAll = function() {
    var that = this,
        numQueries;
    if (this.allLoaded()) {
      numQueries = this.queries.length;
      this.queries.forEach(function(query, index) {
        if (index == numQueries - 1) {
          that.results[query].load(that.onload)
        } else {
          that.results[query].load();
        }
      });
    }

    return this.loaded;
  }

  __.search = function(query) {
    return new Search(query);
  };

  // Store a hash of accepted file extensions and their corresponding 
  // HTML tags. Note that each extension must be assigned a valid 
  // tagName and pathAttr, the 'attributes' object is optional.
  __.extensions = {
    'js': {
      'tagName': 'script',
      'pathAttr': 'src',
      'attributes': {
        'type': 'text/javascript',
        'defer': true,
        'async': false }},
    'css': {
      'tagName': 'link',
      'pathAttr': 'href',
      'attributes': { 
        'rel': 'stylesheet' }}
  };

  // Add an attributes object to the extensions hash. Each extension 
  // must be assigned a valid tagName and pathAttr to be stored. See
  // the __.extensions object for examples of the proper attr object
  // structure.
  __.extensions.add = function(ext, attrs) {
    var tag;
    if (!this[ext] && typeof attrs === 'object' && attrs.tagName && attrs.pathAttr) {
      tag = document.createElement(attrs.tagName);

       // check if tag is a known element (not IE8 friendly)
      if (tag instanceof HTMLUnknownElement)
        return;

      // Initialize the basic extension object
      this[ext] = {
        'tagName': attrs.tagName,
        'pathAttr': attrs.pathAttr,
        'attributes': {}
      };

      // Add valid attributes
      for (var a in attrs.attributes)
        if (tag.hasOwnProperty(a) && attrs.attributes.hasOwnProperty(a))
          this[ext].attributes[a] = attrs.attributes[a];

      return this[ext];
    } else {
      return;
    }
  };

  __.extensions.remove = function(ext) {
    var attrs = this[ext];
    delete this[ext];

    return attrs;
  };

  ///////////////////////////////
  //  Queue Class Definition   //
  ///////////////////////////////  

  // Description: Queue stores methods to allow for async chaining
  function Queue() {
    this._methods = [];       // store callbacks
    this._flushed = false;    // only flush queue once
  }

  Queue.prototype.add = function(fn) {
    if (this._flushed) {
      fn();
    } else {
      this._methods.push(fn)
    }
  };

  Queue.prototype.flush = function() {
    if (this._flushed)
      return;

    this._flushed = true;
    while (this._methods[0])
      this._methods.shift()();
  };


  ///////////////////////////////
  //  Search Class Definition  //
  ///////////////////////////////
  function Search(query, sandbox) {
    var that    = this,
        req     = new XMLHttpRequest(),
        CDN_URL = "http://api.cdnjs.com/libraries?search=",
        url     = CDN_URL + query + '&fields=' + FIELDS.join(','),
        resp;

    this.query = query;
    this._queue = new Queue();
    this._state = req.readyState;

    req.open('GET', url);
    req.onreadystatechange = function() {
      that._state = req.readyState;
      switch (req.readyState) {
        case LOADED:
          resp = JSON.parse(req.responseText);
          resp.results.forEach(function(lib) { that[lib.name] = new Library(lib); });
          that._queue.flush();

          if (sandbox && typeof sandbox.onload === 'function')
            sandbox.loadAll();

          break;
        default:
          break;
      }
    }
    req.send();
  }


  // TODO: rewrite to allow for use of String object
  Search.prototype.load = function(libName, assets) {
    var that     = this,
        callback;

    for (var a in arguments)
      if (typeof arguments[a] === 'function')
        callback = arguments[a];

    this._queue.add(function() {
      var paths, library;
      if (typeof libName === 'object') {
        library = that[that.query];
        assets = libName;
      } else if (typeof libName === 'string' && that[libName]) {
        library = that[libName];
      } else if (that[that.query]) {
        library = that[that.query];
      }

      if (assets) {
        library.loadAssets(assets, callback);
      } else {
        library.loadLatest(callback);
      }
    });

    return this;
  }

  Search.prototype.getAsset = function(libName, version) {
    return version ? this[libName].getAsset(version) : 
      this[that.query].getAsset(libName);
  };

  Search.prototype.getLibrary = function(libName) {
    return this[libName];
  };

  ///////////////////////////////
  //  Library Class Definition //
  ///////////////////////////////
  function Library(attrs) {
    var that        = this,
        properties  = DEFAULTS.concat(FIELDS);
    
    this.assets = {};

    properties.forEach(function(a) {
      if (attrs[a] && a !== 'assets')
        that[a] = attrs[a];
    });

    attrs.assets.forEach(function(a) { 
      that.assets[a.version] = new Asset(that.name, a.version, a.files); 
    });
  }

  Library.prototype.getAsset = function(version) {
    return this.assets[version];
  };

  // Load the latest version of the library. Note that for some libraries
  // more than one asset may be required for proper functionality. Because
  // the 'latest' attribute only contains one path, users wish to load
  // multiple assets should use the .loadAssets() method instead.
  Library.prototype.loadLatest = function(callback) {
    var fileExt = extRE.exec(this.latest)[1],
        tag     = _createTag.call(__, this.latest, fileExt, callback);

    _removeTag.call(__, this.latest, fileExt);
    _appendToHead(tag);
  }

  // Given an object where the keys correspond to Library version numbers
  // and the values are arrays of file names, the 
  Library.prototype.loadAssets = function(assets, callback) {
    var paths = [];
        fileExt;

    // build urls for all valid version/asset pairs
    for (var version in assets) {
      if (this.assets[version] && assets.hasOwnProperty(version)) {
        for (var file in assets[version]) {
          if (this.assets[version].indexOf(file) !== -1 && 
              assets[version].hasOwnProperty(file))
            paths.push(this.assets[version].buildUrl(assets[version]));
        } 
      }
    }  // can these } be removed?

    // Remove all duplicate tags, create new ones, and append them to the head
    if (paths.length) {
      _appendToHead(paths.map(function(path) {
        fileExt = extRE.exec(path)[1]
        _removeTag.call(__, path, fileExt)
        return _createTag.call(__, path, fileExt, callback);
      }));
    }
  };

  ///////////////////////////////
  //  Asset Class Definition   //
  ///////////////////////////////
  function Asset(name, version, files) {
    this.name = name;
    this.version = version;
    this.files = files;
  }

  // Checks that a given file is included in the Assets.prototype.files
  // array and builds the URL for the file if it is 
  // (e.g. file = 'bootstrap.min.css')
  Asset.prototype.buildUrl = function(file) {
    var BASE = "http://cdnjs.cloudflare.com/ajax/libs/" 
    if (this.files.indexOf(file) === -1) 
      return;

    return BASE + [this.name, this.version, file].join('/');
  };

  Asset.prototype.load = function(callback) {
    var that  = this,
        paths = [],
        fileExt, files;

    for (var arg in arguments) {
      if (typeof arg === 'function') {

      } else if (typeof arg === 'string' || arg instanceof String) {

      }
    }


    files.forEach(function(file) { paths.push(that.buildUrl(file)); });

    _appendToHead(paths.map(function(path) {
      fileExt = extRE.exec(path)[1]
      _removeTag.call(__, path, fileExt); 
      return _createTag.call(__, path, fileExt, callback); 
    }));    
  };


  window.__ = __;
})(window);