import { createFileRoute } from '@tanstack/react-router';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

/**
 * Settings Route (/settings)
 *
 * User settings and preferences
 */
export const Route = createFileRoute('/_authenticated/settings')({
  component: Settings,
});

function Settings() {
  const { user } = useAuth();

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">Settings</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Settings Cards */}
      <div className="grid gap-6">
        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Your account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Email</p>
              <p className="text-base">{user?.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">User ID</p>
              <p className="text-base font-mono text-xs sm:text-sm break-all">{user?.id}</p>
            </div>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
            <CardDescription>Customize your experience</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              More preferences will be available soon.
            </p>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle>Data Management</CardTitle>
            <CardDescription>Export or delete your data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Button variant="outline" size="sm" disabled>
                Export Data
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                Download all your migraine episode data
              </p>
            </div>
            <div className="pt-4 border-t">
              <Button variant="destructive" size="sm" disabled>
                Delete Account
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                Permanently delete your account and all data
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
