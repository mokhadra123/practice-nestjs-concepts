import { seconds, Throttle } from '@nestjs/throttler';

export const ThrottleAuth = (limit: number) =>
  Throttle({ short: { ttl: seconds(60), limit } });
