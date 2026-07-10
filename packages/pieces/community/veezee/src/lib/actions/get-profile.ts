import { HttpMethod } from '@activepieces/pieces-common';
import { createAction, Property } from '@activepieces/pieces-framework';
import { veezeeAuth } from '../../index';
import { veezeeApiCall } from '../common/client';

export const getProfile = createAction({
  name: 'get_profile',
  displayName: 'Get Profile',
  description: "Fetch one person's LinkedIn profile (overview plus up to 2 requested sections at no extra cost). Costs 4 credits base.",
  audience: 'both',
  aiMetadata: {
    description:
      "Fetch one person's LinkedIn profile. identifier accepts a profile URL, the slug after /in/, or a urn:li:fsd_profile URN. Always returns the overview (name, headline, location, current position, follower counts) plus up to 2 requested sections from about|experience|education|skills at no extra cost; each section beyond 2 adds 2 credits (max 4 sections). Costs 4 credits base. If you only have a name, use Search People first; this action does not search. For companies use Get Company.",
    idempotent: true,
  },
  auth: veezeeAuth,
  props: {
    identifier: Property.ShortText({
      displayName: 'Identifier',
      description: 'Profile URL, slug (after /in/), or urn:li:fsd_profile URN.',
      required: true,
    }),
    sections: Property.StaticMultiSelectDropdown({
      displayName: 'Sections',
      description: 'Extra profile sections to include. The first 2 are included in the base price; each one beyond that adds 2 credits (max 4 total).',
      required: false,
      options: {
        options: [
          { label: 'About', value: 'about' },
          { label: 'Experience', value: 'experience' },
          { label: 'Education', value: 'education' },
          { label: 'Skills', value: 'skills' },
        ],
      },
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
    const { identifier, sections, freshness, max_credits } = context.propsValue;
    return veezeeApiCall({
      apiKey: context.auth.secret_text,
      method: HttpMethod.GET,
      resourceUri: '/v1/profiles',
      query: {
        identifier,
        sections: sections && sections.length > 0 ? sections.join(',') : undefined,
        freshness,
        max_credits,
      },
    });
  },
});
