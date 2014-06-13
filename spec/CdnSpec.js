describe("The CDN object", function() {
  describe("Stores the appropriate constants:", function() {
    
    it("should store the name of the current CDN", function() {
      expect(CDN.name).toEqual("jsdelivr");
    });

    it("should store the base API URL", function() {
      expect(CDN.apiBaseURL()).toEqual("http://api.jsdelivr.com/v1/" + 
        CDN.name + "/libraries?");
    });

    it("should return the base CDN URL if called without a modifier", function() {
      expect(CDN.cdnBaseURL()).toEqual("//cdn.jsdelivr.net/");
    });

    it("should return the base CDN URL plus the modifier", function() {
      expect(CDN.cdnBaseURL("g")).toEqual("//cdn.jsdelivr.net/g/");
    });

  });


  describe("Builds URLs", function() {

    it("should build the appropriate API URL", function() {
      var q = Query.parse('jquery@2.1.*(jquery.min.js)');

      expect(CDN.buildApiURL(q)).toEqual('http://api.jsdelivr.com/v1/jsdelivr/libraries?name=jquery&lastversion=2.1.*');
    });


  });

  describe("Searches the CDN using the API", function() {
    
    it("should return an array containing a Search object", function() {
      var q = 'jquery@2.1.1';

      expect(CDN.search(q)).toEqual([new Search('jquery')]);
    });


  });
});








