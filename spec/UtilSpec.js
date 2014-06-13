describe("The UTIL object", function() {
    
  describe("RegExps", function() {
    describe("The filesRE", function() {
      it("should not capture files if none are present", function() {
        var q = "jquery";
        expect(UTIL.filesRE.exec(q)).toBe(null);
      });

      it("should capture files if present", function() {
        var q = "jqueryui: [jquery.min.js, jquery-ui.min.js]"
        expect(UTIL.filesRE.exec(q)[1]).toEqual('jquery.min.js, jquery-ui.min.js');
      });
    });


    describe("The versionRE", function() {
      it("should extract the version", function() {
        var q = "jqueryui@2.1.1:[jquery.min.js, jquery-ui.min.js]";
        expect(UTIL.versionRE.exec(q)[1]).toEqual('2.1.1');
      });

      it("should extract the version when wildcards are present", function() {
        var q = "jqueryui@2.*.1:[jquery.min.js, jquery-ui.min.js]";
        expect(UTIL.versionRE.exec(q)[1]).toEqual('2.*.1');
      });

      it("should be null if no version is present", function() {
        var q = "jqueryui:[jquery.min.js, jquery-ui.min.js]";
        expect(UTIL.versionRE.exec(q)).toBe(null);
      });
    });


    describe("The nameRE", function() {
      it("should extract the name", function() {
        var q = "jqueryui(jquery.min.js, jquery-ui.min.js)";
        expect(UTIL.nameRE.exec(q)[1]).toEqual('jqueryui')
      });

      it("should extract the name if wildcards are present", function() {
        var q = "jquery*@2.1.1(adfa)";
        expect(UTIL.nameRE.exec(q)[1]).toEqual('jquery*');
      });
    });

    describe("The extensionRE", function() {
      var str, match;

      
      it("should identify the last extension of a given string", function() {
        str = 'some-file.js';
        match = UTIL.extensionRE.exec(str);
        expect(match).toBeDefined();
        expect(match[1]).toEqual('js');
      });

      it("should ignore compound file extensions", function() {
        str = 'some-file.min.js';
        match = UTIL.extensionRE.exec(str);
        expect(match).toBeDefined();
        expect(match[1]).toEqual('js');
      });

    });
  });

  describe("The extensions object", function() {
  
    it("should store an extensions hash", function() {
      expect(UTIL.extensions).toBeDefined();
    });

    it("each extension should have a tagName", function() {
      expect(UTIL.extensions.js.tagName).toBeDefined();  
    });

    it("each extension should have a pathAttr", function() {
      expect(UTIL.extensions.js.pathAttr).toBeDefined(); 
    });

  });

  describe("parsing aliases with parseAlias()", function() {
    var q = ['$','bootstrap', '$DEFAULT'],
        parseAlias = UTIL.parseAlias;

    it("should handle a normal alias", function() {
      expect(parseAlias(q[0])).toEqual(['jquery @1.7.1']);
    });

    it("should return the original query string if no alias exists", function() {
      expect(parseAlias(q[1])).toEqual(['bootstrap']);
    });

    it("should handle nested aliases", function() {
      window.Sandbox.aliases.$DEFAULT = '$ & _';
      expect(parseAlias(q[2])).toEqual(['jquery @1.7.1', 'underscorejs @1.5.2']);
    });

  });

  describe("building tag paths", function() {
    // UTIL.buildPaths
    // UTIL.buildTags
    // UTIL.appendTo

    var queries = [
      "jquery@1.11.1", 
      Query.parse("underscore@1.5.2:[underscore.min.js]").stringify(), 
      Query.parse("bootstrap: [css/bootstrap.css, js/bootstrap.min.js]")
    ];
   

  });


});