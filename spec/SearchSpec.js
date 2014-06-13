describe("The Search class", function() {
  var q, s;
    
  it("should store the query", function(done) {
    q = Query.parse('jquery');
    s = new Search(q);

    window.setTimeout(function() {
      expect(s.query).toEqual(q);
      done();
    }, 200);
  });

  it("should store the number of results", function() {
    expect(s.length).toEqual(1);
  });  

});