import { ConflictException } from '@nestjs/common';
import { positionBetween } from '@board/shared';
import { safePosition } from './lists.service.js';

describe('safePosition', () => {
  const a = positionBetween(null, null);
  const b = positionBetween(a, null);

  it('returns a key between the neighbours', () => {
    const key = safePosition(a, b);
    expect(key > a && key < b).toBe(true);
  });

  it('turns out-of-order neighbours (a stale client view) into a 409', () => {
    expect(() => safePosition(b, a)).toThrow(ConflictException);
  });
});
