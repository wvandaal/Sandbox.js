describe("The Asset class", function() {

  var s, q, lib, asset;

  beforeEach(function() {
    q = 'jquery';
    s = __.search(q);
  });
  
  it("should store the libName", function(done) {
    window.setTimeout(function() {
      lib = s.get('jquery');
      asset = lib.ver('1.11.1');
      expect(asset.libName).toEqual('jquery');
      done();
    }, 500);
  });

  it("should store the version", function() {
    expect(asset.version).toEqual('1.11.1');
  });  

  it("should store an array of file names", function() {
    var files = ['jquery.js', 'jquery.min.js', 'jquery.min.map'];

    expect(asset.files).toEqual(files);
  }); 

  it("should convert itself to a Query object when toQuery() is called", function() {
    expect(asset.toQuery() instanceof Query).toEqual(true);
  });

  describe("the Asset.prototype.load() method", function() {
    
    it("should load all listed and supported files if called with no string arguments", function(done) {
      asset.load(function() {
        expect($('[src$="' + asset.toQuery().stringify('js') + '"]').length).toBeGreaterThan(0);
        done();
      });
    });    

    it("should call a callback function if one is passed", function(done) {
      asset.load(function() {
        expect(1).toEqual(1);
        done();
      });
    });    


    it("should load a given list of files if they are part of the asset", function(done) {
      asset = lib.ver('1.8.2');
      asset.load('jquery.js', function() {
        expect($('[src$="@1.8.2(jquery.js)"]').length).toBeGreaterThan(0);
        done();
      });   
    });


    it("should load all listed and supported files if called with invalid string arguments", function(done) {
      asset.load('adsfasf', function() {
        expect($('[src$="' + asset.toQuery().stringify('js') + '"]').length).toBeGreaterThan(0);
        done();
      });
    });   
  }); 
});