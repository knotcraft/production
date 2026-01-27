'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useUser, useFirebase } from '@/firebase';
import { ref, remove } from 'firebase/database';
import { useToast } from '@/hooks/use-toast';
import { Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function SettingsPage() {
  const { user } = useUser();
  const { database } = useFirebase();
  const { toast } = useToast();
  const [isTasksAlertOpen, setIsTasksAlertOpen] = useState(false);

  const handleDeleteAllTasks = async () => {
    if (!user || !database) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'You must be logged in to perform this action.',
      });
      return;
    }
    try {
      const tasksRef = ref(database, `users/${user.uid}/tasks`);
      await remove(tasksRef);
      toast({
        variant: 'success',
        title: 'Success!',
        description: 'All tasks have been deleted.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: error.message || 'Could not delete tasks.',
      });
    } finally {
      setIsTasksAlertOpen(false);
    }
  };

  return (
    <div className="p-4 pt-8">
      <h1 className="text-2xl font-bold text-center">Settings</h1>
      <p className="text-muted-foreground mt-2 text-center">Manage your app settings here.</p>

      <div className="mt-8">
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
            <CardDescription className="text-destructive/80">
              These actions are permanent and cannot be undone.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="destructive"
              onClick={() => setIsTasksAlertOpen(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete All Tasks
            </Button>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={isTasksAlertOpen} onOpenChange={setIsTasksAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete all of your
              task data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAllTasks}
              className="bg-destructive hover:bg-destructive/90"
            >
              Yes, delete all tasks
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
