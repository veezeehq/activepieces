import { HttpMethod } from '@activepieces/pieces-common';
import { createAction } from '@activepieces/pieces-framework';
import { veezeeAuth } from '../../index';
import { veezeeApiCall } from '../common/client';

export const getUsage = createAction({
  name: 'get_usage',
  displayName: 'Get Usage',
  description: 'Check your balance, plan, limits, and the last 10 charges. Free, costs 0 credits.',
  audience: 'both',
  aiMetadata: {
    description:
      'Check your balance, plan, limits, and the last 10 charges (receipt ids included). Costs 0 credits and is exempt from the per-minute rate limit, so call it whenever you need to budget. The response includes upgrade_url: give it to your human when credits or plan limits block you; purchases credit this account directly with no login. Not for creating an account or fetching LinkedIn data.',
    idempotent: true,
  },
  auth: veezeeAuth,
  props: {},
  async run(context) {
    return veezeeApiCall({
      apiKey: context.auth.secret_text,
      method: HttpMethod.GET,
      resourceUri: '/v1/usage',
      idempotent: false,
    });
  },
});
