
'use client';
import Link from 'next/link';
import { useState, useEffect, useMemo, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from '@/components/ui/textarea';
import { useUser, useDatabase } from '@/firebase';
import { ref, onValue, set, push, remove, update } from 'firebase/database';
import { toast } from '@/hooks/use-toast';
import type { Guest } from '@/lib/types';
import { Loader2, MoreVertical, Mail, Phone, FileText, Pencil, Trash2, Leaf, Beef, Upload, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';

const statusFilters: Guest['status'][] = ['pending', 'confirmed', 'declined'];

export default function GuestsPage() {
    const { user } = useUser();
    const database = useDatabase();
    const [loading, setLoading] = useState(true);
    const [guests, setGuests] = useState<Guest[]>([]);
    
    // Dialog states
    const [isGuestDialogOpen, setIsGuestDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    
    // Active item state
    const [activeGuest, setActiveGuest] = useState<Guest | null>(null);

    // Form state
    const [formState, setFormState] = useState<Partial<Guest>>({
        name: '',
        side: 'both',
        status: 'pending',
        group: '',
        email: '',
        notes: '',
        diet: 'none',
    });

    // Filtering and Searching
    const [sideFilter, setSideFilter] = useState<'all' | 'bride' | 'groom'>('all');
    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'confirmed' | 'declined'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    
    const fileInputRef = useRef<HTMLInputElement>(null);


    useEffect(() => {
        if (user && database) {
            const guestsRef = ref(database, `users/${user.uid}/guests`);
            const unsubscribe = onValue(guestsRef, (snapshot) => {
                const data = snapshot.val();
                if (data) {
                    const guestsList: Guest[] = Object.entries(data).map(([id, guest]) => ({
                        id,
                        ...(guest as Omit<Guest, 'id'>)
                    }));
                    setGuests(guestsList);
                } else {
                    setGuests([]);
                }
                setLoading(false);
            });

            return () => unsubscribe();
        } else if (!user) {
            setLoading(false);
        }
    }, [user, database]);
    
    const { filteredGuests, summary } = useMemo(() => {
        let filtered = guests;
        
        if (sideFilter !== 'all') {
            filtered = filtered.filter(g => g.side === sideFilter || g.side === 'both');
        }

        if (statusFilter !== 'all') {
            filtered = filtered.filter(g => g.status === statusFilter);
        }

        if (searchQuery) {
            filtered = filtered.filter(g => 
                g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                g.group?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        const confirmedGuests = guests.filter(g => g.status === 'confirmed');
        const summaryData = {
            total: guests.length,
            confirmed: confirmedGuests.length,
            pending: guests.filter(g => g.status === 'pending').length,
            declined: guests.filter(g => g.status === 'declined').length,
            veg: confirmedGuests.filter(g => g.diet === 'veg').length,
            nonVeg: confirmedGuests.filter(g => g.diet === 'non-veg').length,
        };

        return { filteredGuests: filtered, summary: summaryData };
    }, [guests, sideFilter, statusFilter, searchQuery]);


    const openGuestDialog = (guest: Guest | null) => {
        setActiveGuest(guest);
        setFormState(guest || { name: '', side: 'both', status: 'pending', group: '', email: '', notes: '', diet: 'none' });
        setIsGuestDialogOpen(true);
    };

    const handleSaveGuest = async () => {
        if (!user || !database || !formState.name) {
            toast({ variant: 'destructive', title: 'Invalid input', description: 'Guest name is required.' });
            return;
        }

        const guestData = { ...formState };
        delete guestData.id;

        try {
            if (activeGuest?.id) {
                // Editing existing guest
                const guestRef = ref(database, `users/${user.uid}/guests/${activeGuest.id}`);
                await update(guestRef, guestData);
                toast({ title: 'Success', description: 'Guest updated.' });
            } else {
                // Adding new guest
                const guestsRef = ref(database, `users/${user.uid}/guests`);
                const newGuestRef = push(guestsRef);
                await set(newGuestRef, guestData);
                toast({ title: 'Success', description: 'Guest added.' });
            }
            setIsGuestDialogOpen(false);
            setActiveGuest(null);
        } catch(e) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not save guest.' });
        }
    };

    const openDeleteDialog = (guest: Guest) => {
        setActiveGuest(guest);
        setIsDeleteDialogOpen(true);
    };

    const handleDeleteGuest = async () => {
        if (!user || !database || !activeGuest) return;
        try {
            await remove(ref(database, `users/${user.uid}/guests/${activeGuest.id}`));
            toast({ title: 'Success', description: 'Guest deleted.' });
            setIsDeleteDialogOpen(false);
            setActiveGuest(null);
        } catch (e) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not delete guest.' });
        }
    };
    
    const handleFormChange = (field: keyof Omit<Guest, 'id'>, value: string) => {
        setFormState(prev => ({ ...prev, [field]: value }));
    };

    const handleDownloadTemplate = () => {
        const headers = ['name', 'side', 'status', 'group', 'email', 'phone', 'notes', 'diet'];
        const sampleData = [
            'John Doe', // name
            'bride', // side (bride, groom, or both)
            'pending', // status (pending, confirmed, or declined)
            'College Friends', // group
            'john.doe@example.com', // email
            '123-456-7890', // phone
            'Allergic to peanuts', // notes
            'veg' // diet (none, veg, non-veg)
        ];
        const csvContent = "data:text/csv;charset=utf-8," 
            + headers.join(",") + "\n" 
            + sampleData.join(",");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "guest_template.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            const text = e.target?.result as string;
            if (!user || !database) return;

            const lines = text.split('\n').filter(line => line.trim() !== '');
            if (lines.length <= 1) {
                toast({ variant: 'destructive', title: 'Empty File', description: 'The selected CSV file is empty.' });
                return;
            }
            const headers = lines[0].trim().split(',').map(h => h.trim().toLowerCase());
            const requiredHeaders = ['name', 'side', 'status'];
            
            const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
            if (missingHeaders.length > 0) {
                toast({
                    variant: 'destructive',
                    title: 'Invalid CSV Template',
                    description: `Missing columns: ${missingHeaders.join(', ')}. Please download the template.`,
                });
                return;
            }
            
            const guestsToUpload: Omit<Guest, 'id'>[] = [];
            for (let i = 1; i < lines.length; i++) {
                const values = lines[i].trim().split(',');
                const guest: Partial<Guest> = {};
                
                headers.forEach((header, index) => {
                    const key = header as keyof Guest;
                    const value = values[index]?.trim() || '';

                    if (key === 'name' && value) guest.name = value;
                    if (key === 'group') guest.group = value;
                    if (key === 'email') guest.email = value;
                    if (key === 'phone') guest.phone = value;
                    if (key === 'notes') guest.notes = value;
                    if (key === 'side' && ['bride', 'groom', 'both'].includes(value)) guest.side = value as Guest['side'];
                    if (key === 'status' && ['pending', 'confirmed', 'declined'].includes(value)) guest.status = value as Guest['status'];
                    if (key === 'diet' && ['none', 'veg', 'non-veg'].includes(value)) guest.diet = value as Guest['diet'];
                });
                
                if (guest.name && guest.side && guest.status) {
                    guestsToUpload.push({
                        name: guest.name,
                        side: guest.side,
                        status: guest.status,
                        group: guest.group || '',
                        email: guest.email || '',
                        phone: guest.phone || '',
                        notes: guest.notes || '',
                        diet: guest.diet || 'none',
                    });
                }
            }

            if (guestsToUpload.length === 0) {
                toast({ variant: 'destructive', title: 'No Guests Found', description: 'The CSV file does not contain valid guest data.' });
                return;
            }

            try {
                const guestsRef = ref(database, `users/${user.uid}/guests`);
                const updates: { [key: string]: any } = {};
                guestsToUpload.forEach(guest => {
                    const newGuestKey = push(guestsRef).key;
                    if(newGuestKey) {
                       updates[newGuestKey] = guest;
                    }
                });

                await update(ref(database, `users/${user.uid}/guests`), updates);

                toast({ title: 'Upload Successful', description: `${guestsToUpload.length} guests have been added.` });
            } catch (e) {
                toast({ variant: 'destructive', title: 'Upload Failed', description: 'An error occurred while uploading guests.' });
            } finally {
                if (fileInputRef.current) fileInputRef.current.value = '';
            }
        };
        reader.readAsText(file);
    };


    if (loading) {
      return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    return (
        <div className="flex flex-col bg-background-light dark:bg-background-dark min-h-screen">
            <header className="sticky top-0 z-40 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center p-4 justify-between">
                    <Link href="/" className="text-slate-900 dark:text-white flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors">
                        <span className="material-symbols-outlined">arrow_back_ios_new</span>
                    </Link>
                    <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-tight flex-1 text-center">Guest List</h2>
                    <div className="flex size-10 items-center justify-end">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <MoreVertical className="h-5 w-5" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onSelect={handleUploadClick}>
                                    <Upload className="mr-2 h-4 w-4" />
                                    <span>Upload CSV</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onSelect={handleDownloadTemplate}>
                                    <Download className="mr-2 h-4 w-4" />
                                    <span>Download Template</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
                 <div className="px-4 pb-4">
                    <div className="flex p-1 bg-[#f4f0f1] dark:bg-slate-800 rounded-xl">
                        <button onClick={() => setSideFilter('all')} className={cn("flex-1 py-2 text-sm font-semibold rounded-lg transition-colors", sideFilter === 'all' ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-muted-foreground')}>All</button>
                        <button onClick={() => setSideFilter('bride')} className={cn("flex-1 py-2 text-sm font-semibold rounded-lg transition-colors", sideFilter === 'bride' ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-muted-foreground')}>Bride's</button>
                        <button onClick={() => setSideFilter('groom')} className={cn("flex-1 py-2 text-sm font-semibold rounded-lg transition-colors", sideFilter === 'groom' ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-muted-foreground')}>Groom's</button>
                    </div>
                </div>
                 <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 px-4 pb-4">
                    <div className="flex flex-col gap-1 rounded-xl p-3 border border-[#e6dbde] dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
                        <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider">Total Invited</p>
                        <p className="text-primary tracking-light text-xl font-bold leading-tight">{summary.total}</p>
                    </div>
                    <div className="flex flex-col gap-1 rounded-xl p-3 border border-[#e6dbde] dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
                        <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider">Confirmed</p>
                        <p className="text-green-600 tracking-light text-xl font-bold leading-tight">{summary.confirmed}</p>
                    </div>
                    <div className="flex flex-col gap-1 rounded-xl p-3 border border-[#e6dbde] dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
                        <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider">Pending</p>
                        <p className="text-gray-500 tracking-light text-xl font-bold leading-tight">{summary.pending}</p>
                    </div>
                    <div className="flex flex-col gap-1 rounded-xl p-3 border border-[#e6dbde] dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
                        <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider">Veg</p>
                        <p className="text-teal-600 tracking-light text-xl font-bold leading-tight">{summary.veg}</p>
                    </div>
                     <div className="flex flex-col gap-1 rounded-xl p-3 border border-[#e6dbde] dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
                        <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider">Non-Veg</p>
                        <p className="text-orange-600 tracking-light text-xl font-bold leading-tight">{summary.nonVeg}</p>
                    </div>
                </div>
            </header>

            <main className="bg-background-light dark:bg-background-dark pb-24">
                <div className="px-4 py-3">
                     <div className="relative">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground">search</span>
                        <Input 
                            className="pl-11 h-12 w-full bg-[#f4f0f1] dark:bg-slate-800 border-none rounded-xl"
                            placeholder="Search guests..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
                <div className="flex flex-wrap gap-2 px-4 pb-4">
                    <button onClick={() => setStatusFilter('all')} className={cn("flex h-9 items-center justify-center gap-x-2 rounded-full px-5 shadow-sm transition-colors", statusFilter === 'all' ? 'bg-primary text-white' : 'bg-[#f4f0f1] dark:bg-gray-800 border border-gray-100 dark:border-gray-700')}>
                        <p className={cn("text-sm", statusFilter === 'all' ? 'font-semibold' : 'font-medium text-foreground dark:text-gray-300')}>All Guests</p>
                    </button>
                    {statusFilters.map(status => (
                        <button key={status} onClick={() => setStatusFilter(status)} className={cn("flex h-9 items-center justify-center gap-x-2 rounded-full px-5 shadow-sm transition-colors", statusFilter === status ? 'bg-primary text-white' : 'bg-[#f4f0f1] dark:bg-gray-800 border border-gray-100 dark:border-gray-700')}>
                            <p className={cn("text-sm capitalize", statusFilter === status ? 'font-semibold' : 'font-medium text-foreground dark:text-gray-300')}>{status}</p>
                        </button>
                    ))}
                </div>
                
                <div className="flex-1 overflow-y-auto px-2">
                     <div className="px-3 py-2 flex items-center justify-between">
                        <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest">Showing {filteredGuests.length} Guests</p>
                    </div>

                    {filteredGuests.length === 0 ? (
                        <div className="text-center p-10 flex flex-col items-center justify-center gap-4 text-muted-foreground">
                             <span className="material-symbols-outlined text-6xl text-slate-400">groups</span>
                             <h3 className="text-lg font-semibold text-foreground dark:text-slate-200">Your Guest List is Empty</h3>
                            <p>Click the '+' button to start adding guests to your wedding.</p>
                        </div>
                    ) : (
                        <div className="space-y-2 p-2">
                            {filteredGuests.map(guest => (
                                <div key={guest.id} className={cn(
                                    "bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4",
                                    guest.status === 'declined' && 'opacity-60'
                                )}>
                                    <Avatar>
                                        <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                            {guest.name.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <p className="font-bold text-foreground">{guest.name}</p>
                                            {guest.side !== 'both' && (
                                                <span className={cn(
                                                    "text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase",
                                                    guest.side === 'bride' ? 'bg-pink-50 text-pink-500 border-pink-100' : 'bg-blue-50 text-blue-500 border-blue-100'
                                                )}>{guest.side}</span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                            {guest.group && (
                                                <span className="font-medium">{guest.group}</span>
                                            )}
                                            {guest.group && guest.diet && guest.diet !== 'none' && <span className="text-slate-300 dark:text-slate-700">&bull;</span>}
                                            {guest.diet && guest.diet !== 'none' && (
                                                <div className="flex items-center gap-1">
                                                    {guest.diet === 'veg' ? <Leaf className="h-3 w-3 text-green-500" /> : <Beef className="h-3 w-3 text-orange-500" />}
                                                    <span className="capitalize">{guest.diet}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <span className={cn(
                                            "px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                                            guest.status === 'confirmed' && 'bg-green-100 text-green-700',
                                            guest.status === 'pending' && 'bg-gray-100 text-gray-600',
                                            guest.status === 'declined' && 'bg-red-50 text-red-600'
                                        )}>
                                            {guest.status}
                                        </span>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                {guest.email && (
                                                    <DropdownMenuLabel className="flex items-center gap-2 font-normal text-muted-foreground px-2 py-1.5">
                                                        <Mail className="h-4 w-4 shrink-0" />
                                                        <span className="truncate">{guest.email}</span>
                                                    </DropdownMenuLabel>
                                                )}
                                                {guest.phone && (
                                                    <DropdownMenuLabel className="flex items-center gap-2 font-normal text-muted-foreground px-2 py-1.5">
                                                        <Phone className="h-4 w-4 shrink-0" />
                                                        <span className="truncate">{guest.phone}</span>
                                                    </DropdownMenuLabel>
                                                )}
                                                {guest.notes && (
                                                    <DropdownMenuLabel className="flex items-center gap-2 font-normal text-muted-foreground px-2 py-1.5">
                                                        <FileText className="h-4 w-4 shrink-0" />
                                                        <span className="truncate">{guest.notes}</span>
                                                    </DropdownMenuLabel>
                                                )}
                                                {(guest.email || guest.phone || guest.notes) && <DropdownMenuSeparator />}
                                                <DropdownMenuItem onClick={() => openGuestDialog(guest)}>
                                                    <Pencil className="mr-2 h-4 w-4" /> Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => openDeleteDialog(guest)} className="text-destructive">
                                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                    accept="text/csv,.csv"
                />
            </main>

             <Dialog open={isGuestDialogOpen} onOpenChange={setIsGuestDialogOpen}>
                <DialogContent className="sm:max-w-[425px] grid-rows-[auto_minmax(0,1fr)_auto] p-0 max-h-[90dvh]">
                    <DialogHeader className="p-6 pb-0">
                        <DialogTitle>{activeGuest ? 'Edit' : 'Add'} Guest</DialogTitle>
                    </DialogHeader>
                    <ScrollArea className="h-full">
                      <div className="grid gap-4 py-4 px-6">
                          <div className="space-y-2">
                              <Label htmlFor="name">Name</Label>
                              <Input id="name" value={formState.name || ''} onChange={(e) => handleFormChange('name', e.target.value)} />
                          </div>
                          <div className="space-y-2">
                              <Label htmlFor="group">Group</Label>
                              <Input id="group" value={formState.group || ''} onChange={(e) => handleFormChange('group', e.target.value)} placeholder="e.g. Family, Friends" />
                          </div>
                          <div className="space-y-2">
                              <Label>Side</Label>
                              <RadioGroup value={formState.side} onValueChange={(val) => handleFormChange('side', val as 'bride' | 'groom' | 'both')} className="flex gap-4 pt-1">
                                  <div className="flex items-center space-x-2"><RadioGroupItem value="bride" id="r-bride" /><Label htmlFor="r-bride" className="font-normal">Bride</Label></div>
                                  <div className="flex items-center space-x-2"><RadioGroupItem value="groom" id="r-groom" /><Label htmlFor="r-groom" className="font-normal">Groom</Label></div>
                                  <div className="flex items-center space-x-2"><RadioGroupItem value="both" id="r-both" /><Label htmlFor="r-both" className="font-normal">Both</Label></div>
                              </RadioGroup>
                          </div>
                          <div className="space-y-2">
                              <Label>Status</Label>
                              <RadioGroup value={formState.status} onValueChange={(val) => handleFormChange('status', val as 'pending' | 'confirmed' | 'declined')} className="flex gap-4 pt-1">
                                  <div className="flex items-center space-x-2"><RadioGroupItem value="pending" id="s-pending" /><Label htmlFor="s-pending" className="font-normal">Pending</Label></div>
                                  <div className="flex items-center space-x-2"><RadioGroupItem value="confirmed" id="s-confirmed" /><Label htmlFor="s-confirmed" className="font-normal">Confirmed</Label></div>
                                  <div className="flex items-center space-x-2"><RadioGroupItem value="declined" id="s-declined" /><Label htmlFor="s-declined" className="font-normal">Declined</Label></div>
                              </RadioGroup>
                          </div>
                          <div className="space-y-2">
                              <Label>Dietary Preference</Label>
                              <RadioGroup value={formState.diet || 'none'} onValueChange={(val) => handleFormChange('diet', val as 'none' | 'veg' | 'non-veg')} className="flex gap-4 pt-1">
                                  <div className="flex items-center space-x-2"><RadioGroupItem value="none" id="d-none" /><Label htmlFor="d-none" className="font-normal">None</Label></div>
                                  <div className="flex items-center space-x-2"><RadioGroupItem value="veg" id="d-veg" /><Label htmlFor="d-veg" className="font-normal">Veg</Label></div>
                                  <div className="flex items-center space-x-2"><RadioGroupItem value="non-veg" id="d-nonveg" /><Label htmlFor="d-nonveg" className="font-normal">Non-Veg</Label></div>
                              </RadioGroup>
                          </div>
                          <div className="space-y-2">
                              <Label htmlFor="email">Email</Label>
                              <Input id="email" type="email" value={formState.email || ''} onChange={(e) => handleFormChange('email', e.target.value)} />
                          </div>
                          <div className="space-y-2">
                              <Label htmlFor="phone">Phone</Label>
                              <Input id="phone" type="tel" value={formState.phone || ''} onChange={(e) => handleFormChange('phone', e.target.value)} />
                          </div>
                          <div className="space-y-2">
                              <Label htmlFor="notes">Notes</Label>
                              <Textarea id="notes" value={formState.notes || ''} onChange={(e) => handleFormChange('notes', e.target.value)} placeholder="e.g. Party of 2, allergies"/>
                          </div>
                      </div>
                    </ScrollArea>
                    <DialogFooter className="p-6 pt-0">
                        <Button onClick={handleSaveGuest} className="w-full">Save Guest</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

             <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the guest "{activeGuest?.name}".
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteGuest} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <div className="fixed bottom-28 right-6 z-30">
                <Button onClick={() => openGuestDialog(null)} className="w-14 h-14 rounded-full shadow-lg shadow-primary/30 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform">
                    <span className="material-symbols-outlined text-3xl">add</span>
                </Button>
            </div>
        </div>
    );
}
    

    

    