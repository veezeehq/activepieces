import { HttpMethod } from '@activepieces/pieces-common';
import { createAction, Property } from '@activepieces/pieces-framework';
import { veezeeAuth } from '../../index';
import { veezeeApiCall } from '../common/client';

export const getPosts = createAction({
  name: 'get_posts',
  displayName: 'Get Posts',
  description: 'Fetch the recent LinkedIn posts of one person or one company. Costs 4 credits per page.',
  audience: 'both',
  aiMetadata: {
    description:
      "Fetch the recent LinkedIn posts of one person or one company. identifier accepts a profile or company URL, slug, or URN; the entity type is detected automatically. Returns one page of posts (text, created_at, author, likes, comments_count, shares, is_repost, url) with a cursor for older posts. Costs 4 credits per page. Use this for 'what has X been posting', voice-of-company research, or activity checks before outreach. Not for reading one specific post you already have a URL for, and not for keyword search across LinkedIn.",
    idempotent: true,
  },
  auth: veezeeAuth,
  props: {
    identifier: Property.ShortText({
      displayName: 'Identifier',
      description: 'Person or company URL, slug, or URN.',
      required: true,
    }),
    cursor: Property.ShortText({
      displayName: 'Cursor',
      description: 'Cursor from a previous page, for older posts.',
      required: false,
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
    const { identifier, cursor, freshness, max_credits } = context.propsValue;
    return veezeeApiCall({
      apiKey: context.auth.secret_text,
      method: HttpMethod.GET,
      resourceUri: '/v1/posts',
      query: {
        identifier,
        cursor,
        freshness,
        max_credits,
      },
    });
  },
});
