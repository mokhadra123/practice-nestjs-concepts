import { SetMetadata } from '@nestjs/common';
import { IS_PUBLIC_KEY } from '../constants';

export const Protected = () => SetMetadata(IS_PUBLIC_KEY, false);
