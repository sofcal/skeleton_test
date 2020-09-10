const index = require('../../lib/index');

const should = require('should');

describe('@sage/bnkc-fnb-authoriser-cloudid.index', function(){
    it('should export the run function', () => {
       should(index.run).be.a.Function();
    });
});
