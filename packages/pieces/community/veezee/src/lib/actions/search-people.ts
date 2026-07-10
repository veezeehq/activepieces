import { HttpMethod } from '@activepieces/pieces-common';
import { createAction, Property } from '@activepieces/pieces-framework';
import { veezeeAuth } from '../../index';
import { veezeeApiCall } from '../common/client';

export const searchPeople = createAction({
  name: 'search_people',
  displayName: 'Search People',
  description: 'Find people on LinkedIn by keywords and filters. Costs 10 credits including the first 10 results.',
  audience: 'both',
  aiMetadata: {
    description:
      "Find people on LinkedIn by keywords and filters. The right action when you have a name, role, or 'who is the X at Y' question without a profile URL. Pass keywords (free text: name, title, or both) and any of first_name, last_name, title, school, current_company, past_company. Company filters accept a company name, slug, numeric id, or URN; names are resolved for you. Costs 10 credits including the first 10 results; each further 10 results add 1 credit (limit max 30). A cursor page is a new call priced by its own limit, so one larger-limit call is cheaper than paginating. Returns name, position, location, urn, public_identifier per result, a cursor for the next page, and total_matches. Results with is_anonymous=true are private profiles; do not pass them to Get Profile. For one known person with a URL/slug, call Get Profile directly instead.",
    idempotent: true,
  },
  auth: veezeeAuth,
  props: {
    keywords: Property.ShortText({
      displayName: 'Keywords',
      description: 'Free-text query: a name, a title, or both.',
      required: false,
    }),
    first_name: Property.ShortText({ displayName: 'First Name', required: false }),
    last_name: Property.ShortText({ displayName: 'Last Name', required: false }),
    title: Property.ShortText({
      displayName: 'Title',
      description: 'Current job title filter.',
      required: false,
    }),
    school: Property.ShortText({ displayName: 'School', required: false }),
    current_company: Property.ShortText({
      displayName: 'Current Company',
      description: 'Company name, slug, numeric id, or urn:li:fsd_company URN.',
      required: false,
    }),
    past_company: Property.ShortText({
      displayName: 'Past Company',
      description: 'Same accepted forms as Current Company.',
      required: false,
    }),
    limit: Property.Number({
      displayName: 'Limit',
      description: 'How many results to return (1-30, default 10).',
      required: false,
    }),
    cursor: Property.ShortText({
      displayName: 'Cursor',
      description: 'Cursor from a previous page.',
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
    const {
      keywords,
      first_name,
      last_name,
      title,
      school,
      current_company,
      past_company,
      limit,
      cursor,
      freshness,
      max_credits,
    } = context.propsValue;
    return veezeeApiCall({
      apiKey: context.auth.secret_text,
      method: HttpMethod.GET,
      resourceUri: '/v1/people',
      query: {
        keywords,
        first_name,
        last_name,
        title,
        school,
        current_company,
        past_company,
        limit,
        cursor,
        freshness,
        max_credits,
      },
    });
  },
});
