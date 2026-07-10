import { HttpMethod } from '@activepieces/pieces-common';
import { createAction, Property } from '@activepieces/pieces-framework';
import { veezeeAuth } from '../../index';
import { veezeeApiCall } from '../common/client';

export const getCompany = createAction({
  name: 'get_company',
  displayName: 'Get Company',
  description: "Fetch one company's LinkedIn page. Costs 4 credits base.",
  audience: 'both',
  aiMetadata: {
    description:
      "Fetch one company's LinkedIn page: name, description, industry, employee count, headquarters, website, founding year, specialities, and the URN/numeric id needed for Search People company filters. identifier accepts a company URL, the slug after /company/, a numeric LinkedIn company id, or a website domain like 'microsoft.com'. Costs 4 credits base (a domain identifier quotes base+4 credits, refunded at settlement for previously resolved domains). This action does not search by name: if you only have an approximate company name, use Search People's current_company filter or give the exact slug. For the company's posts, use Get Posts with the same identifier.",
    idempotent: true,
  },
  auth: veezeeAuth,
  props: {
    identifier: Property.ShortText({
      displayName: 'Identifier',
      description: "Company URL, slug (after /company/), numeric LinkedIn company id, or website domain (e.g. 'microsoft.com').",
      required: true,
    }),
    freshness: Property.StaticDropdown({
      displayName: 'Freshness',
      description: 'recent (default) serves cached data from the last few hours when available; realtime forces a live fetch for +2 credits (refunded if it falls back to cached data).',
      required: false,
      options: {
        options: [
          { label: 'Recent (cached)', value: 'recent' },
          { label: 'Realtime (live fetch)', value: 'realtime' },
        ],
      },
    }),
    max_credits: Property.Number({
      displayName: 'Max Credits',
      description: 'Spend ceiling for this one call. The call is rejected (nothing charged) if its quote exceeds this.',
      required: false,
    }),
  },
  async run(context) {
    const { identifier, freshness, max_credits } = context.propsValue;
    return veezeeApiCall({
      apiKey: context.auth.secret_text,
      method: HttpMethod.GET,
      resourceUri: '/v1/companies',
      query: {
        identifier,
        freshness,
        max_credits,
      },
    });
  },
});
