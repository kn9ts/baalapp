var request = require('superagent'),
  _expect = require('expect.js');

describe('Root route test', function() {
  /**
   * Display a listing of the resource.
   * GET / (root route)
   *
   * @return Response
   */
  it('should return index.html', function(done) {
    request
      .get('http://localhost:3000')
      .accept('text/html')
      .end(function(err, res) {
        if (res.ok) {
          _expect(res.header['content-type']).to.match(/(text\/html)/g);
          done();
        } else {
          throw err;
        }
      });
  });
});
