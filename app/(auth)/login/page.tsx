import type { Metadata } from 'next';
import LoginForm from './login-form';

export const metadata: Metadata = { title: 'Sign In' };

export default function LoginPage() {
  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
        <p className="text-sm text-gray-500 mt-1">Sign in to your ServiHub account</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
        <LoginForm />
      </div>

      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-400 border-t pt-4">
            Demo — Client:{' '}
            <span className="font-mono text-gray-600">mubarak@servihub.dev / client123</span>
            <br />
            Provider:{' '}
            <span className="font-mono text-gray-600">victor@servihub.dev / provider123</span>
          </p>
        </div>
      )}
    </div>
  );
}
