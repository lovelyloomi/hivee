import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertCircle, Ban, CheckCircle, Shield, AlertTriangle, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Report {
  id: string;
  reporter_id: string;
  reported_user_id: string;
  reason: string;
  description: string;
  status: string;
  created_at: string;
}

interface SuspiciousActivity {
  id: string;
  user_id: string | null;
  activity_type: string;
  details: any;
  created_at: string;
}

interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  target_type: string | null;
  target_id: string | null;
  details: any;
  created_at: string;
}

export const AdminDashboard = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<Report[]>([]);
  const [suspiciousActivities, setSuspiciousActivities] = useState<SuspiciousActivity[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    checkAdminStatus();
  }, [user]);

  const checkAdminStatus = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .single();

      if (data && !error) {
        setIsAdmin(true);
        loadDashboardData();
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDashboardData = async () => {
    try {
      // Load reports
      const { data: reportsData } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (reportsData) setReports(reportsData);

      // Load suspicious activities
      const { data: activitiesData } = await supabase
        .from('suspicious_activity')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (activitiesData) setSuspiciousActivities(activitiesData);

      // Load audit logs
      const { data: logsData } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (logsData) setAuditLogs(logsData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    }
  };

  const handleReportAction = async (reportId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('reports')
        .update({ status: newStatus })
        .eq('id', reportId);

      if (error) throw error;

      // Log the action
      await supabase
        .from('audit_logs')
        .insert({
          user_id: user?.id,
          action: `report_${newStatus}`,
          target_type: 'report',
          target_id: reportId,
          details: { status: newStatus },
        });

      toast.success(`Report ${newStatus}`);
      loadDashboardData();
    } catch (error) {
      console.error('Error updating report:', error);
      toast.error('Failed to update report');
    }
  };

  const handleBanUser = async (userId: string, reason: string) => {
    try {
      // Create audit log for ban
      const { error } = await supabase
        .from('audit_logs')
        .insert({
          user_id: user?.id,
          action: 'user_banned',
          target_type: 'user',
          target_id: userId,
          details: { reason },
        });

      if (error) throw error;

      toast.success('User banned successfully');
      loadDashboardData();
    } catch (error) {
      console.error('Error banning user:', error);
      toast.error('Failed to ban user');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">Loading admin dashboard...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Access Denied
            </CardTitle>
            <CardDescription>
              You don't have permission to access the admin dashboard.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Shield className="h-8 w-8" />
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground">Manage reports, security, and user activity</p>
      </div>

      <Tabs defaultValue="reports" className="space-y-4">
        <TabsList>
          <TabsTrigger value="reports" className="gap-2">
            <AlertCircle className="h-4 w-4" />
            Reports ({reports.filter(r => r.status === 'pending').length})
          </TabsTrigger>
          <TabsTrigger value="suspicious" className="gap-2">
            <AlertTriangle className="h-4 w-4" />
            Suspicious Activity ({suspiciousActivities.length})
          </TabsTrigger>
          <TabsTrigger value="audit" className="gap-2">
            <Eye className="h-4 w-4" />
            Audit Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>User Reports</CardTitle>
              <CardDescription>Review and moderate reported content and users</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {reports.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No reports to review</p>
                  ) : (
                    reports.map((report) => (
                      <Card key={report.id}>
                        <CardContent className="pt-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <Badge variant={report.status === 'pending' ? 'destructive' : 'secondary'}>
                                {report.status}
                              </Badge>
                              <p className="text-sm text-muted-foreground mt-1">
                                {format(new Date(report.created_at), 'PPp')}
                              </p>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <p><strong>Reason:</strong> {report.reason}</p>
                            <p><strong>Description:</strong> {report.description || 'No description provided'}</p>
                            <p className="text-sm text-muted-foreground">
                              Reported User: {report.reported_user_id}
                            </p>
                          </div>
                          {report.status === 'pending' && (
                            <div className="flex gap-2 mt-4">
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleBanUser(report.reported_user_id, report.reason)}
                              >
                                <Ban className="h-4 w-4 mr-2" />
                                Ban User
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleReportAction(report.id, 'resolved')}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Resolve
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleReportAction(report.id, 'dismissed')}
                              >
                                Dismiss
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suspicious">
          <Card>
            <CardHeader>
              <CardTitle>Suspicious Activity</CardTitle>
              <CardDescription>Monitor automated security alerts</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {suspiciousActivities.map((activity) => (
                    <Card key={activity.id}>
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <Badge variant="outline">{activity.activity_type}</Badge>
                            <p className="text-sm text-muted-foreground mt-1">
                              {format(new Date(activity.created_at), 'PPp')}
                            </p>
                          </div>
                        </div>
                        <pre className="mt-2 text-xs bg-muted p-2 rounded">
                          {JSON.stringify(activity.details, null, 2)}
                        </pre>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit">
          <Card>
            <CardHeader>
              <CardTitle>Audit Logs</CardTitle>
              <CardDescription>Complete history of admin actions</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {auditLogs.map((log) => (
                    <Card key={log.id}>
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <Badge>{log.action}</Badge>
                            <p className="text-sm text-muted-foreground mt-1">
                              {format(new Date(log.created_at), 'PPp')}
                            </p>
                          </div>
                        </div>
                        {log.details && (
                          <pre className="mt-2 text-xs bg-muted p-2 rounded">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
