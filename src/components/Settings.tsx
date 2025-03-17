import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/lib/hooks/use-toast";
import { getNotificationSettings, saveNotificationSettings } from "@/lib/services/notification-service";
import { exportUserData, importUserData, clearUserData } from "@/lib/services/data-service";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Define the NotificationSettings interface
interface NotificationSettings {
  enabled: boolean;
  reminderDays: number;
  lastNotificationDate: string | null;
}

export default function Settings() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [reminderDays, setReminderDays] = useState(3);
  const [isLoading, setIsLoading] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [overwriteExisting, setOverwriteExisting] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Load notification settings when component mounts
    const settings = getNotificationSettings();
    setNotificationsEnabled(settings.enabled);
    setReminderDays(settings.reminderDays);
    setIsLoading(false);
  }, []);

  const handleSaveSettings = () => {
    const settings: NotificationSettings = {
      enabled: notificationsEnabled,
      reminderDays: reminderDays,
      lastNotificationDate: getNotificationSettings().lastNotificationDate,
    };

    saveNotificationSettings(settings);

    toast({
      title: "Settings Saved",
      description: "Your notification settings have been updated.",
      variant: "default",
    });
  };

  const handleExportData = () => {
    exportUserData();
  };

  const handleImportClick = () => {
    setImportDialogOpen(true);
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const success = await importUserData(file, overwriteExisting);
      if (success) {
        setImportDialogOpen(false);
      }
    } finally {
      setIsImporting(false);
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleClearData = () => {
    if (window.confirm("Are you sure you want to clear all your data? This action cannot be undone.")) {
      clearUserData();
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading settings...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl sm:text-2xl font-bold">Settings</h2>

      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Configure how and when you receive reminders about your goals.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-1">
              <Label htmlFor="notifications">Enable Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive reminders when you haven't logged progress on your goals.
              </p>
            </div>
            <Switch id="notifications" checked={notificationsEnabled} onCheckedChange={setNotificationsEnabled} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reminderDays">Reminder Frequency (days)</Label>
            <Input
              id="reminderDays"
              type="number"
              min={1}
              max={30}
              value={reminderDays}
              onChange={(e) => setReminderDays(parseInt(e.target.value) || 3)}
              disabled={!notificationsEnabled}
              className="w-24"
            />
            <p className="text-sm text-muted-foreground">Number of days of inactivity before receiving a reminder.</p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-start gap-2">
          <Button onClick={handleSaveSettings} className="w-full sm:w-auto">
            Save Settings
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
          <CardDescription>Export, import, or clear your goal tracking data.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Export Data</h3>
            <p className="text-sm text-muted-foreground">Download a backup of all your goals and progress data.</p>
            <Button variant="outline" onClick={handleExportData} className="w-full sm:w-auto">
              Export as JSON
            </Button>
          </div>

          <Separator className="my-4" />

          <div className="space-y-2">
            <h3 className="text-lg font-medium">Import Data</h3>
            <p className="text-sm text-muted-foreground">Import previously exported data from another device.</p>
            <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" onClick={handleImportClick} className="w-full sm:w-auto">
                  Import from JSON
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px] w-[95vw] max-w-full">
                <DialogHeader>
                  <DialogTitle>Import Data</DialogTitle>
                  <DialogDescription>
                    This will import goals and progress data from a JSON file. You can choose to merge with or replace
                    your existing data.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="flex items-center space-x-2">
                    <Switch id="overwrite" checked={overwriteExisting} onCheckedChange={setOverwriteExisting} />
                    <Label htmlFor="overwrite">Replace existing data</Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {overwriteExisting
                      ? "This will delete all your current goals and progress data before importing."
                      : "This will keep your existing data and add the imported goals and progress."}
                  </p>
                  <input type="file" accept=".json" ref={fileInputRef} className="hidden" onChange={handleFileSelect} />
                </div>
                <DialogFooter className="flex flex-col sm:flex-row gap-2">
                  <Button variant="outline" onClick={() => setImportDialogOpen(false)} className="w-full sm:w-auto">
                    Cancel
                  </Button>
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isImporting}
                    className="w-full sm:w-auto"
                  >
                    {isImporting ? "Importing..." : "Select File"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Separator className="my-4" />

          <div className="space-y-2">
            <h3 className="text-lg font-medium">Clear Data</h3>
            <p className="text-sm text-muted-foreground">
              Delete all your goals and progress data. This cannot be undone.
            </p>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="destructive" className="w-full sm:w-auto">
                  Clear All Data
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px] w-[95vw] max-w-full">
                <DialogHeader>
                  <DialogTitle>Are you sure?</DialogTitle>
                  <DialogDescription>
                    This will permanently delete all your goals and progress data. This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-4">
                  <Button variant="outline" onClick={() => {}} className="w-full sm:w-auto">
                    Cancel
                  </Button>
                  <Button variant="destructive" onClick={handleClearData} className="w-full sm:w-auto">
                    Yes, Delete Everything
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
