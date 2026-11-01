import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router';

import '@fontsource-variable/albert-sans';
import '@fontsource/noto-nastaliq-urdu';
import '@/theme/theme.css';

import { router } from '@/app/router';
import { store } from '@/store';

const root = document.getElementById('root');
if (!root) throw new Error('index.html has no #root element');

createRoot(root).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </StrictMode>,
);
