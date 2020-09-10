const generators = require('../../lib/generators');
const stubs = require('../../lib/stubs');

const index = require('../../lib/index');

const should = require('should');

describe('@sage/bnkc-fnb-util-testing-stubs.index', function(){
    it('should export the correct modules', () => {
        should(index).eql({ generators, stubs });
    });
});
