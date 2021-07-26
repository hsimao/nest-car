import { CanActivate, ExecutionContext } from '@nestjs/common';

export class AuthGuard implements CanActivate {
  // 如果回傳 false, http 會回傳 403 Forbidden 禁止
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();

    return request.session.userId;
  }
}
