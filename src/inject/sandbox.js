(function(window, undefined){
  "use strict";

  // store a reference to the document object
  var document = window.document,

  // PRIVATE utilities namespace
  UTIL = {

    // Extract the files list from a query string. Files 
    // lists are contained in an array within the query 
    // string: 'jquery@2.1.1:[jquery.min.js]'
    filesRE: /:?\s*\[(.*)\]$/,

    // Regex for the version number
    versionRE: /@\s*((?:[\d\*]+\.?){1,3})/,

    // Extract the library name
    nameRE: /^(\*?[\w\.-]+\*?)/,

    // Identify extension within a filename
    extensionRE: /\.(\w+)\)?$/,


    // Store the default list of supported file extensions
    extensions: {
      'js': {
        'tagName': 'script',
        'pathAttr': 'src',
        'attributes': {
          'type': 'text/javascript',
          'async': true }},
      'css': {
        'tagName': 'link',
        'pathAttr': 'href',
        'attributes': { 
          'rel': 'stylesheet' }}      
    },


    // Accept any number of strings or Query objects and
    // return an array containing the appropriate tags. 
    // This function takes advantage of the concatenation 
    // support in jsdelivr and groups by extension 
    // to create one tag for each extension type in 
    // arguments. buildTags will return an array of the 
    // unloaded tags being injected into the page that
    // is used to execute a user-provided callback once all
    // tags have been loaded.
    buildTags: function() {
      var tags        = {},
          extensions  = Object.keys(UTIL.extensions),
          tagsArr     = [],
          ext, tag, attributes, attr, extn, i, j;


      tags = Query.groupByExtension.apply(null, arguments);
      extensions = Object.keys(tags);

      // create tags from strings and append each to the head
      for (i = 0; ext = extensions[i++];) {
        if (tags[ext].length) {
          extn = UTIL.extensions[ext];

          // create the appropriate tag
          tag = document.createElement(extn.tagName);

          // build the tag url path and set it to the 
          // appropriate path attribute on the tag
          tag[extn.pathAttr] = CDN.cdnBaseURL('g') + tags[ext].join(',');
          
          attributes = extn.attributes;

          // iterate over all defined attributes for the 
          // given extension and add the to the tag
          for (j = 0; attr = attributes[j++];)
            tag[attr] = attributes[attr];

          if (this.callback && typeof this.callback === 'function')
            tag.addEventListener('load', this.callback.bind(this), false);

          tagsArr.push(tag);

          // store a reference to the document head if one 
          // does not already exist
          if (!UTIL.head) 
            UTIL.head = ( document.head || 
                          document.querySelector('script').parentNode ||
                          document.documentElement );


          // append the tag to the head
          UTIL.head.appendChild(tag);
        }
      }
      
      // return an array of the injected tags
      return tagsArr;
    },


    // Given a callback function, this method returns a new 
    // function that is called when each new tag loads. 
    // The new function is bound to an object (an instance 
    // of Sandbox, Library, or Asset) that stores a list of
    // the unloaded tags and list of loaded tags. Each time
    // a tag is loaded, it is moved from the unloaded array
    // to the loaded array, until all tags have been loaded,
    // at which point the original callback function is
    // invoked
    wrapCallback: function( callback ) {
      return function( evt ) {
        // Find the index of the newly loaded tag in the 
        // unloaded array
        var index = this.unloaded.indexOf(evt.target);

        // initialize the loaded array if it does not exist
        this.loaded = this.loaded || [];

        // remove the loaded tag from the unloaded array and
        // push it onto the loaded array
        this.loaded.push(this.unloaded.splice(index,1)[0]);

        // if all tags are loaded, execute the callback function
        if (!this.unloaded.length && callback)
          callback.call(window, this);
      };
    },

    cacheResults: function( results ) {
      for (var i = 5; --i > 0;)
        if (this['$' + i] !== undefined)
          this['$' + (i + 1)] = this['$' + i];
      
      return (this.$1 = results);
    },

    // Given a query string, this function should check if
    // the query string is an alias and return the associated
    // query string if so. If the returned query string 
    // contains aliases, these should also be parsed, ultimately
    // returning an array of regular query strings.
    //
    // Aliases may contain multiple query strings separated with
    // a unary 'and':
    // {Multiple: 'jquery & underscorejs'}
    //
    // Nested queries will take the following form:
    // {Nested: '$ & _'}
    parseAlias: function( query ) {
      var queries = query.split(/\s*&\s*/),
          parsed  = [],
          i, q;

      if (queries.length === 1 && !window.Sandbox.aliases[queries[0]])
        return queries;

      for (i = 0; q = queries[i++];)
        if (window.Sandbox.aliases[q])
          parsed = parsed.concat(UTIL.parseAlias(window.Sandbox.aliases[q]));
        else
          parsed.push(q);

      return parsed;
    }
  };


  // The CDN object serves as a namespace for the various
  // functions associated with querying the CDN and jsdelivr
  // API.
  var CDN = {


    // Store the name of the CDN you wish to search. Accepted
    // values are: ["google", "cdnjs", "jquery", "jsdelivr", 
    // "bootstrap"]
    name: "jsdelivr",


    // Return the base URL for querying the jsdelivr API
    apiBaseURL: function() {
      return "http://api.jsdelivr.com/v1/" + this.name + "/libraries?";
    },


    // Return the base URL for loading assets from the 
    // jsdelivr CDN
    cdnBaseURL: function( modifier ) {
      return "//cdn.jsdelivr.net/" + (modifier ? modifier + "/" : "");
    },


    // Accepts any number of query strings and returns an  
    // array of Search objects. Query strings may be of the 
    // following forms:
    //
    // 'jquery'   
    // 'jquery*'  => libraries begining with 'jquery'
    // '*jquery'  => libraries ending in 'jquery'
    // '*jquery*' => libraries containing 'jquery'
    search: function() {
      var results = new Results(),
          i, arg, query;


      for (i = 0; arg = arguments[i++];) {
        if (typeof arg === "string") {
          query = Query.parse(arg);
          results.push(new Search(query));
        } else if (arg instanceof Query) {
          results.push(new Search(arg));
        }
      }

      // cache the results of the search in $i (i: 1 - 5) properties
      return UTIL.cacheResults.call(this, results);
    },



    // Accepts a query object that will be used to generate
    // the URL in question.
    //
    // Example: buildApiURL('jquery*')
    buildApiURL: function ( query ) {
      var url = this.apiBaseURL() + "name=" + query.name;

      if (query.version)
        url += '&lastversion=' + query.version;

      return url;
    }
  };



  // Subclass the native Array constructor to augment the 
  // return value of a search() with useful querying methods
  // NOTE: the use of the non-standard __proto__ property is
  // NOT cross-browser safe and should be watched in the 
  // event that it becomes deprecated in the future.
  function Results() {
    var arr = [].slice.call(arguments);

    // set arr to inherit from Results.prototype
    arr.__proto__ = Results.prototype;

    return arr;
  }

  // Subclass Array
  Results.prototype = Object.create(Array.prototype);

  // Define new functions on the Results prototype
  //
  // TODO: 
  // 1) Add a 'collect' method that will accept a hash of
  //    properties and find all objects that match one or
  //    all of the given attributes
  Object.defineProperties(Results.prototype, {

    // Accept a string pattern as a parameter and return
    // the first Lirary instance with a name that exactly 
    // matches the given pattern
    "get": {
      writable: true,
      value: function( pat ) {
        var i, search;

        // iterate over the results collection and find the 
        // first Library instance that matches the given
        // pattern string
        if (typeof pat === "string") {
          for (i = 0; search = this[i++];)
            if (search[pat] instanceof Library)
              return search[pat];
        }

        return;
      }
    },

    "collect": {
      writable: true,
      value: function( attrs ) {
        // blah blah dog
      }
    }

  });



  // The Query object accepts an attributes hash and converts
  // it to a query object. By default, the only required
  // attribute in the hash parameter is 'libName', which 
  // denotes the name of the library to be queried. Additional
  // values for 'version', 'queryString', and 'files' may also
  // be supplied
  function Query( attrs ) {
    this.name = attrs.libName;

    if (attrs.queryString)
      this.queryString = attrs.queryString;

    if (attrs.version !== null) 
      this.version = attrs.version;

    if (attrs.files !== null && attrs.files.length)
      this.files = attrs.files;
  }


  // Given a query string, parse out the apropriate values
  // for libName, version, and files and store them in a 
  // hash which is then passed to the Query constructor.
  // In the event that the query string is a key in the 
  // user's aliases hash, parse the returned query value
  // instead.
  Query.parse = function( query ) {
    var match = UTIL.nameRE.exec(query),
        name, version, files, attrs;

    if (match) {
      name = match[1];
      version = UTIL.versionRE.exec(query);
      files = UTIL.filesRE.exec(query);

      attrs = {
        libName: name,
        queryString: query,
        version: (version ? version[1] : null),
        files: (files ? files[1].split(/,\s*/) : null)
      };

      return new Query(attrs);
    } else {
      return;
    }
  };

  Query.groupByExtension = function() {
    var tags        = {},
        extensions  = Object.keys(UTIL.extensions),
        arg, ext, query, i, j;

    for (i = 0; arg = arguments[i++];) {
      if (arg instanceof Query) {
        for (j = 0; ext = extensions[j++];) {
          tags[ext] = tags[ext] || [];
          query = arg.stringify(ext);
          if (query)
            tags[ext].push(query);
        }
      // if the argument is a string
      } else if (typeof arg === "string") {
        // parse the file extension
        ext = UTIL.extensionRE.exec(arg);

        // if the extension exists and is supported, shift it 
        // onto the appropriate array in the tags object
        if (ext && ext[1] && ~extensions.indexOf(ext[1]))
          tags[ext[1]].push(arg);
      }
    }

    return tags;
  };


  Object.defineProperties(Query.prototype, {
    "stringify": {
      writable: true,
      value: function( ext ) {
        var str     = '',
            fileStr = '',
            files   = [], 
            i, extension, f;

        str += this.name;

        str += (this.version ? '@' + this.version : '');
        
        // if a file array is present
        if (this.files) {

          // and an extension is specified
          if (ext) {

            // iterate over the files and match them by extension
            for (i = 0; f = this.files[i++];) {
              extension = UTIL.extensionRE.exec(f);

              if (extension && extension[1] === ext)
                files.push(f);
            }
            
            fileStr = files.length ? '(' + files.join('+') + ')' : '';

          // otherwise join them all in a single string
          } else {
            fileStr = ('(' + this.files.join('+') + ')');
          }
        }

        // if there is no fileStr and the extension is 
        // not 'js', return undefined
        if (!fileStr && ext !== 'js')
          return;

        str += fileStr;

        return str;
      }
    }
  });


  // The Search object is a hashmap that contains the results
  // of a search of the CDN using the API and a given query
  // parameter. 
  //
  // The keys of the returned hash correspond to the names of
  // matched Library objects, while the values are the 
  // libraries themselves. 
  //
  // In addition to the libraries, each Search object stores
  // the value of the original query and the number of results
  // returned from the seach as properties. These properties
  // are non-writable, non-enumerable, and non-configurable.
  function Search( query ) {
    var request = new XMLHttpRequest(),
        that    = this;

    // Register public uneditable, non-enumerable
    // properties on the instance
    Object.defineProperties(this, {
      "query": {
        value: query
      }
    });

    // define the onload handler
    request.onload = function() {
      var response = JSON.parse(request.responseText),
          lib, i;

      Object.defineProperties(that, {
        "length": {
          value: response.length
        }
      });

      for (i = 0; lib = response[i++];)
        that[lib.name] = new Library(lib);
    };

    // initialize the request headers
    request.open("GET", CDN.buildApiURL(query));

    // send the request to the API
    request.send();
  }




  // Supported scalar Library attributes (Note: this does
  // not include non-scalar attrs such as 'assets')
  var LIBRARY_ATTRS = [
    "name", 
    "author",
    "lastversion", 
    "description",
    "github",
    "homepage",
    "mainfile",
    "maincss"        // not currently supported by jsdelivr
  ];


  // <constructor> Library( attrs ) </constructor>
  // 
  // The Library object 
  function Library( attrs ) {
    var assets  = attrs.assets,
        hash    = {},
        prop, attr, i;

    // Add all defined scalar attributes in the 'attrs' object
    // to the instance
    for (i = 0; prop = LIBRARY_ATTRS[i++];) {
      attr = attrs[prop];
      if (attr !== null && attr !== undefined)
        this[prop] = attr;
    }


    // create a new Asset object for each version in the 
    // 'assets' array. Note that 'prop' is being reused to 
    // denote the current asset being addressed
    for (i = 0; prop = assets[i++];)
      hash[prop.version] = new Asset(this.name, prop);

    this.assets = hash;
  }

  Object.defineProperties(Library.prototype, {
    // Load accepts any number of string arguments that will
    // parsed into Query objects. A query string is 
    // comprised of a version number and an optional list of 
    // files:
    //
    // @2.1.1:[angular.min.js, angular-resource]
    //
    // If no queries are passed, the library mainfile is loaded 
    // instead.
    "load": {
      writable: true,
      value: function() {
        var queries = [],
            i, j, arg, callback, file;


        for (i = 0; arg = arguments[i++];) {
          if (typeof arg === 'string')
            arg = Query.parse(UTIL.nameRE.test(arg) ? 
              arg : this.name + arg);
          else if (typeof arg === 'function')
            callback = arg;

          if (arg instanceof Query && (!arg.version || this.ver(arg.version))) {
            if (arg.files && arg.version)
              for (j = 0; file = arg.files[j]; j++)
                if (!~this.ver(arg.version).files.indexOf(file))
                  arg.files.splice(j, 1);
            
            queries.push(arg);
          }
        }

        if (!queries.length)
          queries.push(Query.parse(this.name));

        if (callback)
          this.callback = UTIL.wrapCallback(callback);

        this.unloaded = UTIL.buildTags.apply(this, queries);
      }
    },

    // Returns the asset object that corresponds with a specific
    // version of the library
    "ver": {
      writable: true,
      value: function( version ) {
        return this.assets[version];
      }
    }
  });



  function Asset( libName, attrs ) {
    this.libName = libName;
    this.version = attrs.version;
    this.files = attrs.files;
  }

  Object.defineProperties(Asset.prototype, {
    "toQuery": {
      writable: true,
      value: function() {
        return new Query(this);
      }
    },

    "load": {
      writable: true,
      value: function() {
        var i, callback, arg, files, query;

        if (!arguments.length) {
          query = this.toQuery();
        } else {
          files = [];
          for (i = 0; arg = arguments[i++];)
            if (typeof arg === 'function')
              callback = arg;
            else if (~this.files.indexOf(arg))
              files.push(arg);

          // if a callback is passed but no files,
          // use the default file list
          files = files.length ? files : this.files;

          // build a new query object
          query = new Query ({
            libName: this.libName,
            version: this.version,
            files: files
          });
        }

        if (callback)
          query.callback = UTIL.wrapCallback(callback);

        query.unloaded = UTIL.buildTags.call(query, query);
      }
    },
  });



  function Sandbox() {
    var queries = [],
        arg, callback, parsed, q, i, j;

    // if there are no aliases stored yet, add the arguments
    // to the pending array
    if (!window.Sandbox.aliases) {

      Sandbox.pending = Sandbox.pending || [];
      Sandbox.pending.push([].slice.call(arguments));

    } else {
      // if the first argument is an array of queries or strings
      if (Array.isArray(arguments[0])) {

        // iterate over the queries and parse any strings
        for (i = 0; arg = arguments[0][i++];) {
          if (arg instanceof Query) {
            queries.push(arg);
          } else if (typeof arg === 'string') {
            parsed = UTIL.parseAlias(arg);
            for (j = 0; q = parsed[j++];)
              queries.push(Query.parse(q));
          }
        }

        // assign the callback function if one exists
        callback = typeof arguments[1] === 'function' ? arguments[1] : null;

      // otherwise, if the first argument is not an array
      } else {

        // iterate over the arguments and sort/parse them accordingly
        for (i = 0; arg = arguments[i++];) {
          if (typeof arg === 'function') {
            callback = arg;
          } else if (typeof arg === 'string') {
            parsed = UTIL.parseAlias(arg);
            for (j = 0; q = parsed[j++];)
              queries.push(Query.parse(q));
          }
        }
      }

      // if no queries are passed and a $DEFAULT alias is specified,
      // add $DEFAULT to the queries array
      if (!queries.length && window.Sandbox.aliases.$DEFAULT)
        queries = ['$DEFAULT'];
      else if (!queries.length && !window.Sandbox.aliases.$DEFAULT)
        return null;

      // simple factory to allow constructor to be called without 
      // 'new'
      if (!(this instanceof Sandbox))
        return new Sandbox(queries, callback);
      else {
        this.queries = queries;
        this.loaded = [];
        this.callback = UTIL.wrapCallback(callback);
        this.unloaded = UTIL.buildTags.apply(this, queries);
      }
    }
  }


  // Attach the search method to the global namespace to allow
  // users to search the CDN
  Sandbox.search = CDN.search;


  // setAliases is a self-destructing function that can be called
  // exactly once. 
  Sandbox.setAliases = function( aliases ) {
    var sbArgs, queries, callback, arg, i, j;

    window.Sandbox.aliases = aliases || {};

    // if there are queries pending
    if (Sandbox.pending && Sandbox.pending.length) {

      // iterate over each array of arguments
      for (i = 0; sbArgs = Sandbox.pending[i++];) {

        queries = [];
        callback = null;

        // separate the queries from the callback
        for (j = 0; arg = sbArgs[j++];)
          if (typeof arg === 'string')
            queries.push(arg);
          else if (typeof arg === 'function')
            callback = arg;

        // create a new Sandbox object for each set of args
        new Sandbox(queries, callback);
      }

      delete Sandbox.pending;
    }

    delete Sandbox.setAliases;
  };


  // START Testing namespaces
  window.CDN = CDN;
  window.Search = Search;   // Tests DONE
  window.UTIL = UTIL;
  window.Library = Library; // Tests DONE
  window.Query = Query;     // Tests DONE
  window.Asset = Asset;     // Tests DONE
  // END Testing namespaces

  window.__ = window.Sandbox = Sandbox;

})(window);