import { BadRequestException } from '@nestjs/common';
import { moveCardSchema, registerSchema } from '@board/shared';
import { ZodValidationPipe } from './zod-validation.pipe.js';

describe('ZodValidationPipe', () => {
  it('returns the parsed (normalised) value', () => {
    const pipe = new ZodValidationPipe(registerSchema);
    expect(pipe.transform({ email: 'A@B.COM', name: ' Amal ', password: 'long-enough' })).toEqual({
      email: 'a@b.com',
      name: 'Amal',
      password: 'long-enough',
    });
  });

  it('throws 400 with field errors', () => {
    const pipe = new ZodValidationPipe(moveCardSchema);
    try {
      pipe.transform({ toListId: '', version: 0 });
      expect.unreachable();
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);
      const body = (error as BadRequestException).getResponse() as { issues: { fieldErrors: object } };
      expect(Object.keys(body.issues.fieldErrors)).toEqual(expect.arrayContaining(['toListId', 'version']));
    }
  });
});
