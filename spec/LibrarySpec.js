describe("The Library class", function() {
  
  var q = 'jquery', 
      r, lib;

  beforeEach(function() {
    r = __.search(q);
  });

  it("should store the name of the library", function(done) {
    window.setTimeout(function() {
      lib = r.get(q);
      expect(lib.name).toEqual('jquery');
      done();
    }, 200)
  });

  it("should store the author of the library", function() {
    expect(lib.author).toBeDefined();
  });  

  it("should store the latest version", function() {
    expect(lib.lastversion).toBeDefined();
  });  


  it("should store the mainfile of the library", function() {
    expect(lib.mainfile).toBeDefined();
  }); 

  it("should contain a hash of versions and assets", function() {
    var version = lib.lastversion;

    expect(lib.assets[version] instanceof Asset).toBeTruthy();
  }); 

  describe("the Library.prototype.ver() method", function() {
    
    it("should return an asset", function() {
      expect(lib.ver('1.11.1') instanceof Asset).toBeTruthy();
    });

    it("should return the asset object corresponding with a given version", function() {
      expect(lib.ver('1.11.1')).toEqual(lib.assets['1.11.1']);
    });

  });

  describe("the Library.prototype.load() method", function() {

    it("should accept a callback function that is executed onload", function(done) {
      lib.load(function() {
        expect(1).toEqual(1);
        done();
      });
    });

    it("should accept any number of string queries that will denote which files will be loaded from which version", function(done) {
      lib.load('@1.11.1: [jquery.js]', '@2.1.1 [jquery.min.js]', function() {
        expect(document.querySelector('[src$="jquery@1.11.1(jquery.js),jquery@2.1.1(jquery.min.js)"]')).toBeDefined();
        done();
      });
    });    


    it("should load the latest version if no query string is passed", function(done) {
      var version = lib.lastversion;
      lib.load(function() {
        expect($.fn.jquery).toEqual(version);
        done();
      });
    });

    it("should ignore invalid versions and/or files in queries", function(done) {
      lib.load('@1.11.1: [jquery.j]', '@3.1.1 [jquery.min.js]', '@1.8.2', function() {
        expect($.fn.jquery).toEqual('1.8.2');
        done();
      });
    });
   
  });

});