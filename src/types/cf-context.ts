import { Context } from 'hono';
import { BlankInput } from 'hono/types';

import { TEnvContext } from './';

export type TDefaultContext = {
    Bindings: TEnvContext;
};

export type TCFContext = Context<TDefaultContext, '/', BlankInput>;