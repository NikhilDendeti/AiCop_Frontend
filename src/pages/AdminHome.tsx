import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/auth/AuthContext";

/** Placeholder until the admin AI config and usage pages (F5) are built. */
const AdminHome = () => {
  const { user, signOut } = useAuth();
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle>Admin</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">Signed in as {user?.name}. AI configuration and usage pages are coming soon.</p>
          <Button onClick={() => void signOut()}>Sign out</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminHome;
