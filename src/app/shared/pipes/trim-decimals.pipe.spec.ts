import { TrimDecimalsPipe } from './trim-decimals.pipe';

describe('TrimDecimalsPipe', () => {
  it('create an instance', () => {
    const pipe = new TrimDecimalsPipe();
    expect(pipe).toBeTruthy();
  });
});
