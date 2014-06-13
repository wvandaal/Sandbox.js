describe("The Query class", function() {
  var q, query;

  beforeEach(function() {
    q = 'jqueryui @2.1.1 : [jquery.min.js, jqueryui.js, jqueryui.css]';
    query = Query.parse(q);
  });
  
  it("should parse a string and return a Query object", function() {
    expect(query instanceof Query).toBeTruthy();
  });

  it("should store the name", function() {
    expect(query.name).toEqual('jqueryui');
  });

  it("should store the version if it is provided", function() {
    expect(query.version).toEqual('2.1.1');
  });

  it("should store an array of files if they are specified", function() {
    expect(query.files).toEqual(['jquery.min.js', 'jqueryui.js', 'jqueryui.css']);
  });

  describe("the stringify() method", function() {
    
    it("should return a formatted string based on the defined properties of the instance", function() {
      expect(query.stringify()).toEqual('jqueryui@2.1.1(jquery.min.js+jqueryui.js+jqueryui.css)');
    });

    it("should return a formatted string of only one file extension if that extension is passed as an argument", function() {
      expect(query.stringify('js')).toEqual('jqueryui@2.1.1(jquery.min.js+jqueryui.js)');
      expect(query.stringify('css')).toEqual('jqueryui@2.1.1(jqueryui.css)');
    });
  });

});