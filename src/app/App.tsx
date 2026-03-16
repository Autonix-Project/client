import { RouterProvider } from 'react-router';
import { Toaster } from 'sonner';
import { AuthProvider } from './contexts/AuthContext';
import { router } from './routes';

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
      <Toaster 
        position="top-right" 
        toastOptions={{
          style: {
            background: '#1A1A1A',
            color: '#E8E8E8',
            border: '1px solid #2A2A2A',
          },
        }}
      />
    </AuthProvider>
  );
}
