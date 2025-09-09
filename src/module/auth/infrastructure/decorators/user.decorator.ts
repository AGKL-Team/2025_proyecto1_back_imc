import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '@supabase/supabase-js';

export function extractUser(ctx: ExecutionContext): User {
  const request = ctx.switchToHttp().getRequest();
  return request.user as User;
}

export const UserFromRequest = createParamDecorator(
  (_: unknown, ctx: ExecutionContext) => extractUser(ctx),
);
