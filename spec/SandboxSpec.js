describe("The Sandbox global namespace: __", function() {
  
  describe("when called as a function", function() {
    var sandbox, q;

    beforeEach(function() {
      window.Sandbox.aliases = {
        '$': 'jquery @1.7.1',
        '_': 'underscorejs @1.5.2',
        '$DEFAULT': '$ & _'
      };
    });

    it("should load the newest version of jQuery when only the library name is specified", function(done) {
      q = 'jquery';
      __(q, function() {
        expect($).toEqual(window.jQuery);
        done();
      });
    });

    it("should load a given version when specified", function(done) {
      q = 'jquery@1.11.1';
      __(q, function() {
        expect($.fn.jquery).toEqual("1.11.1");
        done();
      });
    });

    it("should load multiple libraries and versions", function(done) {
      q = ['jquery@2.1.0', 'underscorejs@1.5.2'];
      __(q, function() {
        expect($.fn.jquery).toEqual("2.1.0");
        expect(_.VERSION).toEqual("1.5.2");
        done();
      });
    });

    it("should load a specific file when specified", function(done) {
      q = 'jquery:[jquery.js]';
      __(q, function() {
        expect($('[src$="jquery(jquery.js)"]').length).toEqual(1);
        done();
      });
    });

    
    describe("with an alias query", function() {

      it("should properly load a script by its alias", function(done) {
        q = '$';
        __(q, function() {
          expect($.fn.jquery).toEqual('1.7.1');
          done();
        });
      });

      it("should properly load multiple aliases in one call", function(done) {
        q = ['$', '_'];
        __(q, function() {
          expect($.fn.jquery).toEqual('1.7.1');
          expect(_.VERSION).toEqual('1.5.2');
          done();
        });
      });

      it("should allow for nested aliases", function(done) {
        q = '$DEFAULT';
        __(q, function() {
          expect($.fn.jquery).toEqual('1.7.1');
          expect(_.VERSION).toEqual('1.5.2');
          done();
        });
      });      
    });

    describe("with no queries", function() {

      it("when called without query, it should load the $DEFAULT alias if there is one", function(done) {
        __(function() {
          expect($.fn.jquery).toEqual('1.7.1');
          expect(_.VERSION).toEqual('1.5.2');
          done();
        });
      });

      it("when called without query, if there is no $DEFAULT alias it should return null", function() {
        delete window.Sandbox.aliases.$DEFAULT;
        s = __();
        expect(s).toBe(null);
      });
    });

  });


  describe("the __.search() method", function() {
    
    it("should return a single item if no wildcards are used in the query", function(done) {
      q = 'jquery';
      s = __.search(q);
      window.setTimeout(function() {
        expect(Object.keys(s[0]).length).toEqual(1);
        done();
      }, 200);
    });

    it("should return a collection if wildcards are used in the query", function(done) {
      q = 'jq*';
      s = __.search(q);
      window.setTimeout(function() {
        expect(Object.keys(s[0]).length).toBeGreaterThan(1);
        done();
      }, 200);
    });

  });
});