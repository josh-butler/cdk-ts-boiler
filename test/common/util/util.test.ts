import {expires} from '../../../src/common/util/util';

describe('test-util-util', () => {
  it('should-return-expires-number', async () => {
    const exp = expires();
    expect(typeof exp).toEqual('number');
  });
});
