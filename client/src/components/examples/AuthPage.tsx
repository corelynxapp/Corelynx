import { AuthPage } from '../../pages/AuthPage';

export default function AuthPageExample() {
  return <AuthPage onLogin={(role) => console.log('Logged in as:', role)} />;
}
