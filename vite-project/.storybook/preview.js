import { initialize, mswDecorator } from 'msw-storybook-addon';
import { withThemeByClassName } from '@storybook/addon-styling';
import '../src/app.css';

// Initialize MSW
initialize();

/** @type { import('@storybook/react').Preview } */
const preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    // Layout default
    layout: 'centered',
    // Viewport presets
    viewport: {
      viewports: {
        mobile: {
          name: 'Mobile',
          styles: {
            width: '375px',
            height: '667px',
          },
        },
        tablet: {
          name: 'Tablet',
          styles: {
            width: '768px',
            height: '1024px',
          },
        },
        desktop: {
          name: 'Desktop',
          styles: {
            width: '1280px',
            height: '800px',
          },
        },
      },
    },
    // A11y config
    a11y: {
      config: {
        rules: [
          {
            id: 'color-contrast',
            enabled: true,
          },
        ],
      },
    },
    // Backgrounds
    backgrounds: {
      default: 'light',
      values: [
        {
          name: 'light',
          value: '#ffffff',
        },
        {
          name: 'dark',
          value: '#1a1a1a',
        },
      ],
    },
    // Docs config
    docs: {
      source: {
        state: 'open',
      },
    },
  },
  // Global decorators
  decorators: [
    // MSW decorator
    mswDecorator,
    // Theme decorator
    withThemeByClassName({
      themes: {
        light: '',
        dark: 'dark',
      },
      defaultTheme: 'light',
    }),
    // Wallet provider decorator
    (Story) => (
      <WalletProviderWrapper>
        <Story />
      </WalletProviderWrapper>
    ),
    // Error boundary decorator
    (Story) => (
      <ErrorBoundary>
        <Story />
      </ErrorBoundary>
    ),
    // Router decorator
    (Story) => (
      <BrowserRouter>
        <Story />
      </BrowserRouter>
    ),
  ],
};

// Mock handlers
export const handlers = [
  // Auth handlers
  rest.post('/api/auth/verify', (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        token: 'mock-token',
        user: {
          publicKey: req.body.publicKey,
          credits: 100,
          activeWishes: 2,
          totalWishes: 5
        }
      })
    );
  }),

  // Wish handlers
  rest.get('/api/wishes', (req, res, ctx) => {
    return res(
      ctx.json({
        wishes: [
          {
            _id: 'wish-1',
            content: 'Test wish 1',
            status: 'pending',
            createdAt: new Date().toISOString()
          },
          {
            _id: 'wish-2',
            content: 'Test wish 2',
            status: 'completed',
            createdAt: new Date().toISOString()
          }
        ],
        pagination: {
          total: 2,
          pages: 1,
          page: 1,
          limit: 10
        }
      })
    );
  }),

  // Admin handlers
  rest.get('/api/admin/stats/overview', (req, res, ctx) => {
    return res(
      ctx.json({
        stats: {
          users: 100,
          activeUsers: 50,
          totalWishes: 200,
          completedWishes: 150,
          totalCredits: 1000
        }
      })
    );
  })
];

export default preview;
