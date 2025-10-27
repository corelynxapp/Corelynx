import { AppHeader } from '../AppHeader';

export default function AppHeaderExample() {
  return (
    <div className="space-y-4">
      <AppHeader
        userName="John Doe"
        userRole="partner"
        onLogout={() => console.log('Logout clicked')}
      />
      <AppHeader
        userName="Sarah Smith"
        userRole="agent"
        onLogout={() => console.log('Logout clicked')}
      />
      <AppHeader
        userName="Admin User"
        userRole="admin"
        onLogout={() => console.log('Logout clicked')}
      />
    </div>
  );
}
