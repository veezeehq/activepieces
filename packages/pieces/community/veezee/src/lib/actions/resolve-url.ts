import { HttpMethod } from '@activepieces/pieces-common';
import { createAction, Property } from '@activepieces/pieces-framework';
import { veezeeAuth } from '../../index';
import { veezeeApiCall } from '../common/client';

export const resolveUrl = createAction({
  name: 'resolve_url',
  displayName: 'Resolve URL',
  description: 'Identify what a LinkedIn URL points at before fetching it. Costs 2 credits.',
  audience: 'both',
  aiMetadata: {
    description:
      'Identify what a LinkedIn URL points at before fetching it. Give any LinkedIn profile, company, or post URL (utm params, www/m subdomains, trailing slashes are fine); get back {type: person|company|post, id, handle, canonical_url}. For profile URLs, id is the stable person URN; for company URLs, id is the stable company URN; for post URLs, id is the activity URN extracted from the URL. Use the returned handle or id with Get Profile, Get Company, or Get Posts. Costs 2 credits. Skip this action when you already have a slug, URN, or clean URL: Get Profile and Get Company accept those directly, so resolving first would waste 2 credits. Not for non-LinkedIn URLs.',
    idempotent: true,
  },
  auth: veezeeAuth,
  props: {
    url: Property.ShortText({
      displayName: 'URL',
      description: 'A LinkedIn URL, e.g. https://www.linkedin.com/in/williamhgates or .../company/microsoft.',
      required: true,
    }),
  },
  async run(context) {
    const { url } = context.propsValue;
    return veezeeApiCall({
      apiKey: context.auth.secret_text,
      method: HttpMethod.GET,
      resourceUri: '/v1/resolve',
      query: { url },
    });
  },
});
