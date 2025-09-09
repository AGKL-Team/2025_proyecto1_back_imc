import { extractUser } from '@/module/auth/infrastructure/decorators/user.decorator';
import { ExecutionContext } from '@nestjs/common';
import { fakeApplicationUser } from '../shared/fakes/user.fake';

describe('extractUser', () => {
  it('should return the user from the request', () => {
    const user = fakeApplicationUser;

    const mockRequest = { user };

    const context: ExecutionContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as unknown as ExecutionContext;

    const result = extractUser(context);

    expect(result).not.toBeNull();
    expect(result).toEqual(user);
  });

  it('should be defined', () => {
    expect(extractUser).toBeDefined();
  });
});
