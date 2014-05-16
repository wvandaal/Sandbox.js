# Sandbox.js

### Description
Sandbox.js is a dynamic asset loader designed using the **cdnjs** API. Namespaced under the global variable `__`, Sandbox.js allows you to load external scripts and CSS style sheets (as well as HTML imports or any other asset you can dream up) directly into your document. Sandbox is currently is development as an extension for the Chrome browser, augmenting the DevTools console to allow you to quickly load in resources to pages that don't have the tools you require. 


### Current Status
Currently Sandbox is only available as a script which can be embedded in your HTML document like any other external script. I am developing the additional functionality for the Chrome extension to allow for more customization and tweaking by the end user (you). I encourage you to play with Sandbox.js in your own projects, however it should be noted that I have not attempted to make this project cross-browser compatible since it will end up as a Chrome extension. 

### Usage
I began building Sandbox.js to help me quickly build and test code samples for StackOverflow questions. I found that debugging in online editors such as JSFiddle and CodePen was tedious and difficult, often leading me to use my own testing arena to build my samples. The downside to this approach is that I needed to constantly include different external scripts from different sources in order to answer these questions. Enter Sandbox.js. The basic inline usage of Sandbox is simple:

```javascript
__('jquery', 'underscore.js', 'backbone.js', function() {
   // do cool stuff with the loaded libraries here 
});
```

Basically, Sandbox will make an AJAX `GET` request to the cdnjs API for each string argument passed to it. If a query *exactly* matches the name of a hosted library on cdnjs, it will be loaded in the order it was passed as an argument to the `__` function. Once all of the libraries have been loaded, an optional callback will be executed, now with access to the newly loaded assets.

If you do not know the exact name of the library you wish to load, you can easily conduct a search using `__.search(query)`, which returns a `Search` object containing the various results as keys, each paired with a `Library` object containing a hash of `Asset`s keyed by version number:

```javascript
__.search('underscore');
{
  "query": "underscore",
  "underscore-contrib": {
    "name": "underscore-contrib",
    "latest": "http://cdnjs.cloudflare.com/ajax/libs/underscore-contrib/0.1.4/underscore-contrib.min.js",
    "version": "0.1.4",
    "description": "The brass buckles on Underscore's utility belt.",
    "assets": {
      "0.1.4": {
        "name": "underscore-contrib",
        "version": "0.1.4",
        "files": [
          "underscore-contrib.js",
          "underscore-contrib.min.js"
        ]
      },
      "0.1.1": {
        "name": "underscore-contrib",
        "version": "0.1.1",
        "files": [
          "underscore-contrib.js",
          "underscore-contrib.min.js"
        ]
      },
      "0.1.0": {
        "name": "underscore-contrib",
        "version": "0.1.0",
        "files": [
          "underscore-contrib.js",
          "underscore-contrib.min.js"
        ]
      }
    }
  },
  "underscore.js": {
    "name": "underscore.js",
    "latest": "http://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.6.0/underscore-min.js",
    "version": "1.6.0",
    "description": "Underscore is a utility-belt library for JavaScript that provides a lot of the functional programming support that you would expect in Prototype.js (or Ruby), but without extending any of the built-in JavaScript objects. It's the tie to go along with jQuery's tux.",
    "assets": {
      "1.6.0": {
        "name": "underscore.js",
        "version": "1.6.0",
        "files": [
          "underscore-min.js",
          "underscore-min.map",
          "underscore.js"
        ]
      },
      "1.5.2": {
        "name": "underscore.js",
        "version": "1.5.2",
        "files": [
          "underscore-min.js",
          "underscore-min.map",
          "underscore.js"
        ]
      },
      ...
  }
```