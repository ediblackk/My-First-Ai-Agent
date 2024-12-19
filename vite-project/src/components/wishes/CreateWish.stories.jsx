import { CreateWish } from './CreateWish';

export default {
  title: 'Components/Wishes/CreateWish',
  component: CreateWish,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
CreateWish este componenta principală pentru crearea unei dorințe noi.
Aceasta gestionează întregul flux de creare, de la introducerea textului până la
analiza AI și confirmarea finală.

## Caracteristici
- Validare input în timp real
- Analiză AI a conținutului
- Preview rezultate analiză
- Gestionare erori
- Responsive design
- Accesibilitate completă
        `
      }
    }
  },
  argTypes: {
    onSuccess: {
      description: 'Callback apelat după crearea cu succes a dorinței',
      control: { type: null }
    },
    onClose: {
      description: 'Callback pentru închiderea modalului',
      control: { type: null }
    }
  }
};

// Template de bază
const Template = (args) => <CreateWish {...args} />;

// Starea inițială
export const Initial = Template.bind({});
Initial.args = {
  onSuccess: (wish) => console.log('Wish created:', wish),
  onClose: () => console.log('Modal closed')
};
Initial.parameters = {
  docs: {
    description: {
      story: 'Starea inițială a formularului de creare dorință.'
    }
  }
};

// Cu conținut valid
export const WithValidContent = Template.bind({});
WithValidContent.args = {
  ...Initial.args
};
WithValidContent.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const input = canvas.getByPlaceholderText('Descrie dorința ta aici...');
  await userEvent.type(input, 'Vreau să învăț programare și să devin developer în 6 luni.');
};
WithValidContent.parameters = {
  docs: {
    description: {
      story: 'Formular cu conținut valid, gata pentru analiză.'
    }
  }
};

// În timpul analizei
export const DuringAnalysis = Template.bind({});
DuringAnalysis.args = {
  ...Initial.args
};
DuringAnalysis.parameters = {
  msw: {
    handlers: [
      rest.post('/api/wishes/analyze', (req, res, ctx) => {
        return res(
          ctx.delay(2000),
          ctx.json({
            analysis: {
              complexity: 7,
              categories: ['Educație', 'Tehnologie'],
              challenges: ['Timp limitat', 'Complexitate ridicată'],
              suggestions: ['Focusare pe practică', 'Mentorat']
            }
          })
        );
      })
    ]
  },
  docs: {
    description: {
      story: 'Starea de loading în timpul analizei AI.'
    }
  }
};

// Cu rezultate analiză
export const WithAnalysisResults = Template.bind({});
WithAnalysisResults.args = {
  ...Initial.args
};
WithAnalysisResults.parameters = {
  msw: {
    handlers: [
      rest.post('/api/wishes/analyze', (req, res, ctx) => {
        return res(
          ctx.json({
            analysis: {
              complexity: 7,
              categories: ['Educație', 'Tehnologie'],
              challenges: ['Timp limitat', 'Complexitate ridicată'],
              suggestions: ['Focusare pe practică', 'Mentorat']
            }
          })
        );
      })
    ]
  },
  docs: {
    description: {
      story: 'Afișarea rezultatelor analizei AI.'
    }
  }
};

// Cu eroare
export const WithError = Template.bind({});
WithError.args = {
  ...Initial.args
};
WithError.parameters = {
  msw: {
    handlers: [
      rest.post('/api/wishes/analyze', (req, res, ctx) => {
        return res(
          ctx.status(500),
          ctx.json({
            error: 'A apărut o eroare în timpul analizei.'
          })
        );
      })
    ]
  },
  docs: {
    description: {
      story: 'Gestionarea stării de eroare.'
    }
  }
};

// Mobile view
export const Mobile = Template.bind({});
Mobile.args = {
  ...Initial.args
};
Mobile.parameters = {
  viewport: {
    defaultViewport: 'mobile'
  },
  docs: {
    description: {
      story: 'Versiunea mobilă a formularului.'
    }
  }
};

// Dark mode
export const DarkMode = Template.bind({});
DarkMode.args = {
  ...Initial.args
};
DarkMode.parameters = {
  backgrounds: {
    default: 'dark'
  },
  docs: {
    description: {
      story: 'Versiunea dark mode a formularului.'
    }
  }
};

// Cu credite insuficiente
export const InsufficientCredits = Template.bind({});
InsufficientCredits.args = {
  ...Initial.args
};
InsufficientCredits.parameters = {
  msw: {
    handlers: [
      rest.post('/api/wishes', (req, res, ctx) => {
        return res(
          ctx.status(400),
          ctx.json({
            error: 'Credite insuficiente pentru creare dorință.'
          })
        );
      })
    ]
  },
  docs: {
    description: {
      story: 'Gestionarea cazului de credite insuficiente.'
    }
  }
};

// Cu validare complexă
export const ComplexValidation = Template.bind({});
ComplexValidation.args = {
  ...Initial.args
};
ComplexValidation.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const input = canvas.getByPlaceholderText('Descrie dorința ta aici...');
  
  // Test conținut prea scurt
  await userEvent.type(input, 'Test');
  expect(canvas.getByText('Dorința trebuie să aibă cel puțin 10 caractere')).toBeInTheDocument();
  
  // Test conținut valid
  await userEvent.clear(input);
  await userEvent.type(input, 'O dorință suficient de lungă pentru validare.');
  expect(canvas.queryByText('Dorința trebuie să aibă cel puțin 10 caractere')).not.toBeInTheDocument();
};
ComplexValidation.parameters = {
  docs: {
    description: {
      story: 'Demonstrarea validării complexe a formularului.'
    }
  }
};

// Cu focus pe accesibilitate
export const AccessibilityFocused = Template.bind({});
AccessibilityFocused.args = {
  ...Initial.args
};
AccessibilityFocused.parameters = {
  a11y: {
    config: {
      rules: [
        {
          id: 'label',
          enabled: true
        },
        {
          id: 'color-contrast',
          enabled: true
        }
      ]
    }
  },
  docs: {
    description: {
      story: 'Demonstrarea caracteristicilor de accesibilitate.'
    }
  }
};
