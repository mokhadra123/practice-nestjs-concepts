import { seconds } from '@nestjs/throttler';

export const throttlerConfig = [
  { name: 'short', ttl: seconds(1), limit: 3 },
  { name: 'long', ttl: seconds(60), limit: 100 },
];
