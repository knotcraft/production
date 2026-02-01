
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useUser, useFirebase } from '@/firebase';
import { ref, get, update, remove, onValue, push, set } from 'firebase/database';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Trash2, Upload, LogOut, User, Image as ImageIcon, Sparkles, AlertTriangle, Calendar as CalendarIcon, Link as LinkIcon, Copy } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from '@/components/ui/skeleton';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  const { user, loading: userLoading } = useUser();
  const { database, auth } = useFirebase();
  const router = useRouter();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: '',
    partnerName: '',
    weddingDate: '',
    heroImage: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isTasksAlertOpen, setIsTasksAlertOpen] = useState(false);
  
  const [newImage, setNewImage] = useState<string | null>(null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [invitationCode, setInvitationCode] = useState('');
  const [partnerCode, setPartnerCode] = useState('');
  const [generatingCode, setGeneratingCode] = useState(false);
  const [joining, setJoining] = useState(false);
  const [linkedPartner, setLinkedPartner] = useState<{name: string, uid: string} | null>(null);

  useEffect(() => {
    if (user && database) {
      const userRef = ref(database, 'users/' + user.uid);
      const unsubscribeUser = onValue(userRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          setFormData({
            name: data.name || user.displayName || '',
            partnerName: data.partnerName || '',
            weddingDate: data.weddingDate || '',
            heroImage: data.heroImage || '',
          });
          setLinkedPartner(data.linkedPartner || null);
        }
        setLoading(false);
      });
      return () => unsubscribeUser();
    } else if (!user && !userLoading) {
      setLoading(false);
    }
  }, [user, database, userLoading]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSaveChanges = async () => {
    if (!user || !database) return;
    setSaving(true);
    try {
      await update(ref(database, `users/${user.uid}`), {
        name: formData.name,
        partnerName: formData.partnerName,
        weddingDate: formData.weddingDate,
      });
      toast({
        variant: 'success',
        title: 'Success!',
        description: 'Your details have been updated.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: error.message || 'Could not save your details.',
      });
    } finally {
      setSaving(false);
    }
  };

  const resizeImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (!event.target?.result) {
            return reject(new Error("FileReader did not load file."));
        }
        const img = document.createElement('img');
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1920;
          const MAX_HEIGHT = 1080;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            return reject(new Error('Could not get canvas context'));
          }
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
          resolve(dataUrl);
        };
        img.onerror = reject;
        img.src = event.target.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };
  
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        setIsProcessingImage(true);
        toast({ title: "Processing image...", description: "Please wait a moment." });
        try {
            const resizedDataUrl = await resizeImage(file);
            setNewImage(resizedDataUrl);
        } catch (error) {
            toast({
              variant: "destructive",
              title: "Image Processing Failed",
              description: "Could not process the selected image. Please try another one.",
            });
        } finally {
            setIsProcessingImage(false);
        }
    }
  };

  const handleSaveImage = async () => {
      if (!user || !database || !newImage) return;
      setIsProcessingImage(true);
      try {
          await update(ref(database, `users/${user.uid}`), {
              heroImage: newImage,
          });
          setFormData(prev => ({...prev, heroImage: newImage}));
          setNewImage(null);
          toast({
              variant: 'success',
              title: 'Success!',
              description: 'Your dashboard image has been updated.',
          });
      } catch (error: any) {
          toast({
              variant: 'destructive',
              title: 'Uh oh! Something went wrong.',
              description: error.message || 'Could not save your image.',
          });
      } finally {
          setIsProcessingImage(false);
      }
  };

  const handleSignOut = async () => {
    if (auth) {
      await signOut(auth);
      router.push('/login');
    }
  };

  const handleDeleteAllTasks = async () => {
    if (!user || !database) {
      toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to perform this action.'});
      return;
    }

    const updates: { [key: string]: null } = {};
    updates[`users/${user.uid}/tasks`] = null;
    if (linkedPartner?.uid) {
        updates[`users/${linkedPartner.uid}/tasks`] = null;
    }

    try {
      await update(ref(database), updates);
      toast({ variant: 'success', title: 'Success!', description: 'All tasks have been deleted.' });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Uh oh! Something went wrong.', description: error.message || 'Could not delete tasks.' });
    } finally {
      setIsTasksAlertOpen(false);
    }
  };

  const generateInvitation = async () => {
    if (!user || !database) return;
    setGeneratingCode(true);
    try {
        const invRef = push(ref(database, 'invitations'));
        await set(invRef, { fromUid: user.uid, fromName: formData.name });
        setInvitationCode(invRef.key!);
    } catch(e: any) {
        toast({ variant: 'destructive', title: 'Error generating code', description: e.message || 'Could not generate invitation code.'})
    } finally {
        setGeneratingCode(false);
    }
  };

  const joinPartnerPlan = async () => {
    if (!user || !database || !partnerCode) {
        toast({ variant: 'destructive', title: 'Error', description: 'Please enter an invitation code.'})
        return;
    }
    setJoining(true);
    try {
        const invRef = ref(database, `invitations/${partnerCode}`);
        const invSnapshot = await get(invRef);
        if (!invSnapshot.exists()) {
            throw new Error('Invalid invitation code.');
        }
        const { fromUid, fromName } = invSnapshot.val();

        // Sync data
        const partnerDataSnap = await get(ref(database, `users/${fromUid}`));
        const myDataSnap = await get(ref(database, `users/${user.uid}`));
        const partnerData = partnerDataSnap.val() || {};
        const myData = myDataSnap.val() || {};
        
        const mergedTasks = { ...(partnerData.tasks || {}), ...(myData.tasks || {}) };
        const mergedGuests = { ...(partnerData.guests || {}), ...(myData.guests || {}) };

        const updates: { [key: string]: any } = {};
        // Link accounts
        updates[`/users/${user.uid}/linkedPartner`] = { uid: fromUid, name: fromName };
        updates[`/users/${fromUid}/linkedPartner`] = { uid: user.uid, name: formData.name };
        // Sync data
        updates[`/users/${user.uid}/tasks`] = mergedTasks;
        updates[`/users/${fromUid}/tasks`] = mergedTasks;
        updates[`/users/${user.uid}/guests`] = mergedGuests;
        updates[`/users/${fromUid}/guests`] = mergedGuests;
        // Delete invitation
        updates[`/invitations/${partnerCode}`] = null;
        
        await update(ref(database), updates);

        toast({ variant: 'success', title: "You're linked!", description: `You and ${fromName} are now sharing plans.`});
        setIsLinkDialogOpen(false);

    } catch (e: any) {
        toast({ variant: 'destructive', title: 'Failed to Join', description: e.message });
    } finally {
        setJoining(false);
    }
  };
  
  const handleUnlink = async () => {
    if (!user || !database || !linkedPartner) return;
    
    const updates: { [key: string]: null } = {};
    updates[`/users/${user.uid}/linkedPartner`] = null;
    updates[`/users/${linkedPartner.uid}/linkedPartner`] = null;

    try {
        await update(ref(database), updates);
        toast({ variant: 'success', title: 'Accounts Unlinked', description: 'Your accounts are no longer sharing data.'});
    } catch (e: any) {
        toast({ variant: 'destructive', title: 'Error', description: e.message || 'Could not unlink accounts.'});
    }
  };


  const defaultHeroImage = PlaceHolderImages.find(img => img.id === 'wedding-hero');
  const currentImageSrc = newImage || formData.heroImage || defaultHeroImage?.imageUrl;

  if (loading || userLoading) {
    return (
      <div className="p-4 pt-8 animate-fade-in space-y-8">
        <header className="flex items-center justify-between">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-6 w-32" />
          <div className="w-10" />
        </header>
        <div className="flex flex-col items-center pt-4 pb-4">
          <Skeleton className="w-24 h-24 rounded-full mb-4" />
          <Skeleton className="h-8 w-40 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="space-y-6 px-2">
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-48 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in pb-12">
       <header className="flex items-center justify-between p-4">
          <Link href="/" className="text-foreground flex size-10 shrink-0 items-center justify-center -ml-2 rounded-full hover:bg-secondary">
            <span className="material-symbols-outlined text-2xl font-bold">arrow_back_ios_new</span>
          </Link>
          <h1 className="text-lg font-bold text-center flex-1">Settings</h1>
           <div className="w-10" />
      </header>

      <div className="flex flex-col items-center pt-4 pb-8 border-b">
        <Avatar className="w-24 h-24 mb-4 border-4 border-primary/20">
            <AvatarImage src={user?.photoURL || ''} alt={formData.name} />
            <AvatarFallback className="bg-primary/10 text-primary">
                <User className="h-10 w-10" />
            </AvatarFallback>
        </Avatar>
        <h2 className="text-2xl font-bold">{formData.name}</h2>
        <p className="text-muted-foreground">{user?.email}</p>
      </div>

      <div className="p-4 space-y-8">
        
        {/* Wedding Details Section */}
        <div className="space-y-3">
          <h3 className="font-bold px-2 flex items-center gap-2 text-foreground">
            <Sparkles className="text-primary h-5 w-5" />
            Wedding Details
          </h3>
          <div className="space-y-4 rounded-xl border bg-card p-4">
            <div className="space-y-2">
              <Label htmlFor="name">Your Name</Label>
              <Input id="name" value={formData.name} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="partnerName">Partner's Name</Label>
              <Input id="partnerName" value={formData.partnerName} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label>Wedding Date</Label>
               <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.weddingDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.weddingDate ? format(new Date(formData.weddingDate + "T00:00:00"), "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.weddingDate ? new Date(formData.weddingDate + "T00:00:00") : undefined}
                    onSelect={(date) => {
                        if (date) {
                            setFormData((prev) => ({ ...prev, weddingDate: format(date, 'yyyy-MM-dd') }))
                        }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <Button onClick={handleSaveChanges} disabled={saving} className="w-full">
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Save Details'}
            </Button>
          </div>
        </div>

        {/* Appearance Section */}
        <div className="space-y-3">
            <h3 className="font-bold px-2 flex items-center gap-2 text-foreground">
                <ImageIcon className="text-primary h-5 w-5" />
                Appearance
            </h3>
            <div className="space-y-4 rounded-xl border bg-card p-4">
                 <Label>Dashboard Image</Label>
                 <p className="text-sm text-muted-foreground -mt-2">Change the hero image on your main dashboard.</p>
                <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
                    {currentImageSrc && (
                        <Image
                            src={currentImageSrc}
                            alt="Dashboard hero image preview"
                            fill
                            className="object-cover"
                        />
                    )}
                     {isProcessingImage && (
                        <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    )}
                </div>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageFileChange}
                    className="hidden"
                    accept="image/png, image/jpeg, image/webp"
                />
                {newImage ? (
                    <div className="flex gap-2">
                        <Button onClick={() => { setNewImage(null); if(fileInputRef.current) fileInputRef.current.value = ''; }} variant="outline" className="w-full">
                            Cancel
                        </Button>
                        <Button onClick={handleSaveImage} disabled={isProcessingImage} className="w-full">
                            {isProcessingImage ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Save Image'}
                        </Button>
                    </div>
                ) : (
                    <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="w-full" disabled={isProcessingImage}>
                        <Upload className="mr-2 h-4 w-4" />
                        Choose Image
                    </Button>
                )}
            </div>
        </div>

        {/* Partner Sync Section */}
        <div className="space-y-3">
          <h3 className="font-bold px-2 flex items-center gap-2 text-foreground">
            <LinkIcon className="text-primary h-5 w-5" />
            Partner Sync
          </h3>
          <div className="space-y-4 rounded-xl border bg-card p-4">
            {linkedPartner ? (
                <div>
                    <p className="text-sm text-muted-foreground">You are linked with <span className="font-bold text-foreground">{linkedPartner.name}</span>.</p>
                    <p className="text-sm text-muted-foreground">Your tasks and guest list are being synced.</p>
                    <Button variant="outline" className="w-full mt-4" onClick={handleUnlink}>
                        <LinkIcon className="mr-2 h-4 w-4" />
                        Unlink Account
                    </Button>
                </div>
            ) : (
                <>
                <p className="text-sm text-muted-foreground">Share your dashboard, tasks, and guest list with your partner by linking your accounts.</p>
                <Button variant="outline" className="w-full" onClick={() => setIsLinkDialogOpen(true)}>
                    <LinkIcon className="mr-2 h-4 w-4" />
                    Link with Partner
                </Button>
                </>
            )}
          </div>
        </div>

        {/* Account Section */}
         <div className="space-y-3">
          <h3 className="font-bold px-2 flex items-center gap-2 text-foreground">
            <User className="text-primary h-5 w-5" />
            Account
          </h3>
          <div className="space-y-4 rounded-xl border bg-card p-4">
              <Button variant="outline" onClick={handleSignOut} className="w-full">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
            </Button>
          </div>
        </div>

        {/* Danger Zone Section */}
        <div className="space-y-3 pt-4">
            <h3 className="font-bold px-2 flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5"/>
                Danger Zone
            </h3>
            <div className="space-y-4 rounded-xl border border-destructive/50 bg-destructive/5 p-4">
                <div>
                  <p className="font-semibold">Delete All Tasks</p>
                  <p className="text-sm text-destructive/80">This will permanently delete all task data for you and your linked partner. This action cannot be undone.</p>
                </div>
                <Button
                  variant="destructive"
                  onClick={() => setIsTasksAlertOpen(true)}
                  className="w-full"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete All Tasks
                </Button>
            </div>
        </div>

      </div>

      <AlertDialog open={isTasksAlertOpen} onOpenChange={setIsTasksAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete all of your
              task data for you and your linked partner.
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

      <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Link with Partner</DialogTitle>
                <DialogDescription>
                    Share an invitation code with your partner, or enter a code they sent you. Linking will merge and sync your tasks and guest lists.
                </DialogDescription>
            </DialogHeader>
            <Tabs defaultValue="invite" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="invite">Invite</TabsTrigger>
                    <TabsTrigger value="accept">Accept</TabsTrigger>
                </TabsList>
                <TabsContent value="invite" className="pt-4">
                    <div className="space-y-3 text-center">
                        <p className="text-sm text-muted-foreground">Share this one-time code with your partner.</p>
                        {invitationCode ? (
                            <div className="flex items-center space-x-2">
                                <Input value={invitationCode} readOnly className="font-mono text-lg h-12 text-center tracking-widest" />
                                <Button size="icon" onClick={() => { navigator.clipboard.writeText(invitationCode); toast({ title: 'Copied!'})}}>
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </div>
                        ) : (
                             <Button onClick={generateInvitation} disabled={generatingCode} className="w-full">
                                {generatingCode ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Generate Code"}
                            </Button>
                        )}
                    </div>
                </TabsContent>
                <TabsContent value="accept" className="pt-4">
                     <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="partner-code">Invitation Code</Label>
                            <Input id="partner-code" value={partnerCode} onChange={(e) => setPartnerCode(e.target.value)} placeholder="Enter code from partner" />
                        </div>
                        <Button onClick={joinPartnerPlan} disabled={joining} className="w-full">
                            {joining ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Join Partner's Plan"}
                        </Button>
                    </div>
                </TabsContent>
            </Tabs>
        </DialogContent>
    </Dialog>

    </div>
  );
}

    