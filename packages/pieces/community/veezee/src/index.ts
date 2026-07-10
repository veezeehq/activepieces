import { createPiece, PieceAuth, PieceCategory } from '@activepieces/pieces-framework';
import {
  AuthenticationType,
  createCustomApiCallAction,
  httpClient,
  HttpMethod,
} from '@activepieces/pieces-common';
import { getProfile } from './lib/actions/get-profile';
import { searchPeople } from './lib/actions/search-people';
import { getCompany } from './lib/actions/get-company';
import { getPosts } from './lib/actions/get-posts';
import { resolveUrl } from './lib/actions/resolve-url';
import { getUsage } from './lib/actions/get-usage';

const BASE_URL = 'https://api.veezee.io';

const markdownDescription = `
To use Veezee:
1. Get an API key: call \`POST ${BASE_URL}/v1/provision\` (no signup, no card) for a free trial key, or find your key in your Veezee dashboard.
2. Paste the API key here.

See the docs at https://veezee.io/docs.
`;

export const veezeeAuth = PieceAuth.SecretText({
  displayName: 'API Key',
  description: markdownDescription,
  required: true,
  validate: async ({ auth }) => {
    try {
      await httpClient.sendRequest({
        method: HttpMethod.GET,
        url: `${BASE_URL}/v1/usage`,
        authentication: {
          type: AuthenticationType.BEARER_TOKEN,
          token: auth,
        },
      });
      return { valid: true };
    } catch (error) {
      return { valid: false, error: 'Invalid API key. Please check your Veezee API key.' };
    }
  },
});

export const veezee = createPiece({
  displayName: 'Veezee',
  description: 'LinkedIn people and company data: profiles, people search, companies, posts.',
  auth: veezeeAuth,
  minimumSupportedRelease: '0.36.1',
  logoUrl: 'https://cdn.activepieces.com/pieces/veezee.png',
  categories: [PieceCategory.SALES_AND_CRM],
  authors: ['veezeehq'],
  actions: [
    getProfile,
    searchPeople,
    getCompany,
    getPosts,
    resolveUrl,
    getUsage,
    createCustomApiCallAction({
      baseUrl: () => BASE_URL,
      auth: veezeeAuth,
      authMapping: async (auth) => ({
        Authorization: `Bearer ${(auth as { secret_text: string }).secret_text}`,
      }),
    }),
  ],
  triggers: [],
});
