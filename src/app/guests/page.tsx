'use client';
import Link from 'next/link';
import { useState, useEffect, useMemo, useRef } from 'react';
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
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from '@/components/ui/textarea';
import { useUser, useFirebase } from '@/firebase';
import { ref, onValue, set, push, remove, update } from 'firebase/database';
import { useToast } from '@/hooks/use-toast';
import type { Guest } from '@/lib/types';
import { Loader2, Upload, Download, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export default function GuestsPage() {
    const { user } = useUser();
    const { database } = useFirebase();
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [guests, setGuests] = useState<Guest[]>([]);
    
    const [isGuestDialogOpen, setIsGuestDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    
    const [activeGuest, setActiveGuest] = useState<Guest | null>(null);
    const [guestToDelete, setGuestToDelete] = useState<Guest | null>(null);

    const [formState, setFormState] = useState<Partial<Guest>>({
        name: '', side: 'bride', status: 'pending', group: '', email: '', phone: '', notes: '', diet: 'none'
    });

    const [sideFilter, setSideFilter] = useState<'all' | 'bride' | 'groom'>('all');
    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'confirmed'>('all');
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
                    })).reverse(); // show most recent first
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
        let baseGuests = guests;

        if (sideFilter !== 'all') {
            baseGuests = guests.filter(guest => guest.side === sideFilter);
        }

        const summaryData = {
            total: baseGuests.length,
            confirmed: baseGuests.filter(g => g.status === 'confirmed').length,
            pending: baseGuests.filter(g => g.status === 'pending').length,
        };
        
        let displayGuests = guests;

        if (sideFilter !== 'all') {
            displayGuests = displayGuests.filter(guest => guest.side === sideFilter);
        }

        if (statusFilter !== 'all') {
            displayGuests = displayGuests.filter(g => g.status === statusFilter);
        }

        if (searchQuery) {
            displayGuests = displayGuests.filter(g => 
                g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (g.group && g.group.toLowerCase().includes(searchQuery.toLowerCase()))
            );
        }

        return { filteredGuests: displayGuests, summary: summaryData };
    }, [guests, sideFilter, statusFilter, searchQuery]);

    const openGuestDialog = (guest: Guest | null) => {
        setActiveGuest(guest);
        setFormState(guest || { name: '', side: 'bride', status: 'pending', group: '', email: '', phone: '', notes: '', diet: 'none' });
        setIsGuestDialogOpen(true);
    };
    
    const handleCloseGuestDialog = () => {
        setIsGuestDialogOpen(false);
        setActiveGuest(null);
    }

    const handleSaveGuest = async () => {
        if (!user || !database || !formState.name) {
            toast({ variant: 'destructive', title: 'Invalid input', description: 'Guest name is required.' });
            return;
        }
    
        const guestData = { ...formState, notes: formState.notes || '', group: formState.group || '' };
        delete guestData.id;
    
        try {
            if (activeGuest?.id) {
                const guestRef = ref(database, `users/${user.uid}/guests/${activeGuest.id}`);
                await update(guestRef, guestData);
                toast({ variant: 'success', title: 'Success', description: 'Guest updated.' });
            } else {
                const guestsRef = ref(database, `users/${user.uid}/guests`);
                const newGuestRef = push(guestsRef);
                await set(newGuestRef, guestData);
                toast({ variant: 'success', title: 'Success', description: 'Guest added.' });
            }
            handleCloseGuestDialog();
        } catch (e: any) {
            toast({ variant: 'destructive', title: 'Error', description: e.message || 'Could not save guest.' });
        }
    };
    
    const openDeleteDialog = (guest: Guest) => {
        setGuestToDelete(guest);
        setIsDeleteDialogOpen(true);
    };
    
    const handleCloseDeleteDialog = () => {
        setIsDeleteDialogOpen(false);
        setGuestToDelete(null);
    }

    const handleConfirmDelete = async () => {
        if (!user || !database || !guestToDelete) return;
        try {
            await remove(ref(database, `users/${user.uid}/guests/${guestToDelete.id}`));
            toast({ variant: 'success', title: 'Success', description: 'Guest deleted.' });
        } catch (e: any) {
            toast({ variant: 'destructive', title: 'Error', description: e.message || 'Could not delete guest.' });
        } finally {
            handleCloseDeleteDialog();
        }
    };
    
    const handleFormChange = (field: keyof Omit<Guest, 'id'>, value: string) => {
        setFormState(prev => ({ ...prev, [field]: value }));
    };

    const handleDownloadTemplate = () => {
        const headers = ['name', 'side', 'status', 'group', 'email', 'phone', 'notes', 'diet'];
        const sampleData = [
            'John Doe', 'bride', 'pending', 'College Friends', 'john.doe@example.com', '123-456-7890', 'Allergic to peanuts', 'veg'
        ];
        const csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + sampleData.join(",");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "guest_template.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleDownloadGuestList = () => {
        if (guests.length === 0) {
            toast({ variant: 'default', title: 'Guest List Empty', description: 'There are no guests to download.' });
            return;
        }

        const headers = ['name', 'side', 'status', 'group', 'email', 'phone', 'notes', 'diet'];
        
        const escapeCsvValue = (value: any) => {
            if (value === null || value === undefined) {
                return '';
            }
            const stringValue = String(value);
            if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
                return `"${stringValue.replace(/"/g, '""')}"`;
            }
            return stringValue;
        };

        const csvRows = guests.map(guest => 
            headers.map(header => escapeCsvValue(guest[header as keyof Guest])).join(',')
        );

        const csvContent = [headers.join(','), ...csvRows].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "guest_list.csv");
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
                toast({ variant: 'destructive', title: 'Empty File', description: 'The CSV file is empty.' });
                return;
            }
            const headers = lines[0].trim().split(',').map(h => h.trim().toLowerCase());
            const requiredHeaders = ['name', 'side', 'status'];
            if (!requiredHeaders.every(h => headers.includes(h))) {
                toast({ variant: 'destructive', title: 'Invalid CSV Template', description: 'Missing required columns: name, side, status.' });
                return;
            }
            
            const guestsToUpload: Omit<Guest, 'id'>[] = lines.slice(1).map(line => {
                const values = line.split(',');
                const guestObj: { [key: string]: string } = {};
                headers.forEach((header, index) => {
                    guestObj[header] = values[index]?.trim() || '';
                });

                return {
                    name: guestObj.name,
                    side: ['bride', 'groom', 'both'].includes(guestObj.side) ? guestObj.side as Guest['side'] : 'both',
                    status: ['pending', 'confirmed'].includes(guestObj.status) ? guestObj.status as Guest['status'] : 'pending',
                    group: guestObj.group || '',
                    email: guestObj.email || '',
                    phone: guestObj.phone || '',
                    notes: guestObj.notes || '',
                    diet: ['none', 'veg', 'non-veg'].includes(guestObj.diet) ? guestObj.diet as Guest['diet'] : 'none',
                };
            }).filter(g => g.name);

            if (guestsToUpload.length === 0) {
                toast({ variant: 'destructive', title: 'No Guests Found', description: 'No valid guest data found in the file.' });
                return;
            }

            try {
                const updates: { [key: string]: any } = {};
                guestsToUpload.forEach(guest => {
                    const newGuestKey = push(ref(database, `users/${user.uid}/guests`)).key;
                    if(newGuestKey) updates[newGuestKey] = guest;
                });
                await update(ref(database, `users/${user.uid}/guests`), updates);
                toast({ variant: 'success', title: 'Upload Successful', description: `${guestsToUpload.length} guests imported.` });
            } catch (e) {
                toast({ variant: 'destructive', title: 'Upload Failed', description: 'An error occurred during upload.' });
            }
        };
        reader.readAsText(file);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    if (loading) {
      return (
        <div className="flex h-screen items-center justify-center bg-background-light dark:bg-background-dark">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }
    
    const confirmedPercentage = summary.total > 0 ? Math.round((summary.confirmed / summary.total) * 100) : 0;

    return (
        <div className="flex flex-col min-h-screen">
            <header className="sticky top-0 z-20 flex flex-col bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center p-4 justify-between">
                    <Link href="/" className="text-foreground flex size-10 shrink-0 items-center -ml-2 rounded-full hover:bg-secondary">
                        <span className="material-symbols-outlined text-2xl font-bold">arrow_back_ios_new</span>
                    </Link>
                    <h2 className="text-foreground text-xl font-extrabold leading-tight tracking-tight flex-1 text-center">Guest List</h2>
                    <div className="flex w-10 items-center justify-end">
                       <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-foreground">
                                    <span className="material-symbols-outlined font-bold">more_horiz</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onSelect={handleUploadClick}>
                                    <Upload className="mr-2 h-4 w-4" />
                                    <span>Import from CSV</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onSelect={handleDownloadGuestList}>
                                    <Download className="mr-2 h-4 w-4" />
                                    <span>Export to CSV</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onSelect={handleDownloadTemplate}>
                                    <Download className="mr-2 h-4 w-4" />
                                    <span>Download CSV Template</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                         <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden"
                            accept=".csv,text/csv"
                        />
                    </div>
                </div>
                <div className="px-4 pb-4">
                    <div className="flex p-1 bg-secondary dark:bg-slate-900 rounded-2xl">
                        <button onClick={() => setSideFilter('all')} className={cn("flex-1 py-2.5 text-sm font-bold rounded-xl transition-all", sideFilter === 'all' ? 'bg-background text-primary shadow-sm ring-1 ring-black/5' : 'text-muted-foreground')}>All Sides</button>
                        <button onClick={() => setSideFilter('bride')} className={cn("flex-1 py-2.5 text-sm font-bold rounded-xl transition-all", sideFilter === 'bride' ? 'bg-background text-primary shadow-sm ring-1 ring-black/5' : 'text-muted-foreground')}>Bride's</button>
                        <button onClick={() => setSideFilter('groom')} className={cn("flex-1 py-2.5 text-sm font-bold rounded-xl transition-all", sideFilter === 'groom' ? 'bg-background text-primary shadow-sm ring-1 ring-black/5' : 'text-muted-foreground')}>Groom's</button>
                    </div>
                </div>
                <div className="px-4 pb-4">
                    {summary.total > 0 ? (
                        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-pink-500 to-rose-500 p-6 text-white shadow-lg dark:from-primary/80 dark:via-pink-500/80 dark:to-rose-500/80">
                            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10" />
                            <div className="absolute -left-12 -bottom-12 h-32 w-32 rounded-full bg-white/10" />

                            <div className="relative z-10">
                                <div className="mb-2 flex items-center justify-between">
                                    <p className="text-sm font-medium uppercase tracking-widest text-white/80">
                                        Confirmed Guests
                                    </p>
                                </div>
                                <h1 className="mb-6 text-4xl font-bold tracking-tight">
                                    {summary.confirmed}
                                </h1>

                                <div>
                                    <div className="h-2 w-full overflow-hidden rounded-full bg-white/30">
                                        <div
                                            className="h-full rounded-full bg-white transition-all duration-500"
                                            style={{ width: `${confirmedPercentage}%` }}
                                        />
                                    </div>
                                    <div className="mt-2 flex justify-between text-xs font-semibold text-white/90">
                                        <span>Pending: {summary.pending}</span>
                                        <span>Total: {summary.total}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                         <div className="rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 p-8 text-center flex flex-col items-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-800 mb-4">
                                <span className="material-symbols-outlined text-4xl text-slate-500">group_add</span>
                            </div>
                            <h3 className="text-xl font-bold mb-2">Build Your Guest List</h3>
                            <p className="text-sm text-muted-foreground mb-6 max-w-xs">Add your first guest to start tracking RSVPs and managing your event.</p>
                            <Button size="lg" onClick={() => openGuestDialog(null)}>
                                <span className="material-symbols-outlined mr-2 h-5 w-5">add</span> Add First Guest
                            </Button>
                        </div>
                    )}
                </div>
            </header>
            <main className="flex-1 flex flex-col bg-slate-50 dark:bg-background-dark/40">
                <div className="px-4 py-4">
                    <div className="flex w-full items-stretch rounded-2xl h-12 bg-card ring-1 ring-inset ring-border">
                        <div className="text-muted-foreground flex items-center justify-center pl-4">
                            <span className="material-symbols-outlined text-xl">search</span>
                        </div>
                        <input className="form-input flex w-full border-none bg-transparent h-full placeholder:text-muted-foreground px-3 text-base font-medium focus:ring-0" placeholder="Search guests..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                    </div>
                </div>
                <div className="flex gap-2 px-4 pb-4 overflow-x-auto no-scrollbar">
                    <button onClick={() => setStatusFilter('all')} className={cn("flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-full px-6", statusFilter === 'all' ? 'bg-primary text-white shadow-md shadow-primary/20' : 'bg-card border')}>
                        <p className={cn("text-sm font-bold", statusFilter !== 'all' && "text-foreground")}>All Guests</p>
                    </button>
                    <button onClick={() => setStatusFilter('confirmed')} className={cn("flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-full px-6", statusFilter === 'confirmed' ? 'bg-primary text-white shadow-md shadow-primary/20' : 'bg-card border')}>
                        <p className={cn("text-sm font-bold", statusFilter !== 'confirmed' && "text-foreground")}>Confirmed</p>
                    </button>
                    <button onClick={() => setStatusFilter('pending')} className={cn("flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-full px-6", statusFilter === 'pending' ? 'bg-primary text-white shadow-md shadow-primary/20' : 'bg-card border')}>
                        <p className={cn("text-sm font-bold", statusFilter !== 'pending' && "text-foreground")}>Pending</p>
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto px-4 pb-24">
                    <div className="py-2 flex items-center justify-between">
                        <p className="text-muted-foreground text-[11px] font-black uppercase tracking-[0.15em]">Showing {filteredGuests.length} Guests</p>
                        <div className="flex items-center gap-1 text-primary text-[11px] font-extrabold">
                            <span>SORT: RECENT</span>
                            <span className="material-symbols-outlined text-sm">unfold_more</span>
                        </div>
                    </div>
                    {filteredGuests.length > 0 ? (
                        <Accordion type="single" collapsible className="space-y-3">
                            {filteredGuests.map(guest => (
                                <AccordionItem value={guest.id} key={guest.id} className="bg-card rounded-2xl shadow-sm border data-[state=open]:ring-2 data-[state=open]:ring-primary/20 overflow-hidden">
                                    <AccordionTrigger className="flex items-center gap-4 p-4 text-left w-full hover:no-underline">
                                        <Avatar className="h-14 w-14 text-xl flex-shrink-0 border-2 border-primary/20 shadow-inner">
                                            <AvatarFallback className="bg-primary/10 text-primary font-extrabold text-2xl">
                                                {guest.name ? guest.name.charAt(0).toUpperCase() : ''}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 flex flex-col min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="text-foreground text-base font-extrabold leading-tight truncate">{guest.name}</h3>
                                                {guest.side !== 'both' && (
                                                    <span className={cn(
                                                        "flex-shrink-0 text-[9px] font-black px-2 py-0.5 rounded-md border uppercase tracking-tighter",
                                                        guest.side === 'bride' ? 'bg-primary/10 text-primary border-primary/20' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-500 border-blue-200 dark:border-blue-800'
                                                    )}>{guest.side}</span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className={cn(
                                                    "px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest",
                                                    guest.status === 'confirmed' && 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
                                                    guest.status === 'pending' && 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                                                )}>{guest.status}</span>
                                                {guest.group && <span className="text-muted-foreground text-[10px] font-bold">• {guest.group}</span>}
                                            </div>
                                        </div>
                                        <ChevronDown className="h-5 w-5 shrink-0 transition-transform duration-200 text-gray-400 data-[state=open]:rotate-180" />
                                    </AccordionTrigger>
                                    <AccordionContent className="px-4 pb-4 pt-2 border-t border-secondary space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            {guest.email && <div className="space-y-1">
                                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Email</p>
                                                <p className="text-sm font-bold text-foreground flex items-center gap-1 truncate">
                                                    <span className="material-symbols-outlined text-primary text-base">mail</span>
                                                    {guest.email}
                                                </p>
                                            </div>}
                                            {guest.phone && <div className="space-y-1">
                                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Phone</p>
                                                <p className="text-sm font-bold text-foreground flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-primary text-base">call</span>
                                                    {guest.phone}
                                                </p>
                                            </div>}
                                        </div>
                                        <div className={cn("space-y-1 p-3 rounded-xl", guest.notes ? 'bg-primary/5' : 'bg-secondary')}>
                                            <p className={cn("text-[10px] font-black uppercase tracking-widest flex items-center gap-1", guest.notes ? "text-primary/80" : "text-muted-foreground")}>
                                                <span className="material-symbols-outlined text-xs">notes</span>
                                                Special Notes
                                            </p>
                                            <p className={cn("text-sm font-medium leading-relaxed", guest.notes ? "text-foreground" : "text-muted-foreground italic")}>{guest.notes || 'No notes added yet.'}</p>
                                        </div>
                                        <div className="flex gap-2 pt-2">
                                            <button onClick={() => openGuestDialog(guest)} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary/10 text-primary text-xs font-black uppercase tracking-widest border border-primary/20 active:bg-primary/20 transition-colors">
                                                <span className="material-symbols-outlined text-lg">edit</span>
                                                Edit
                                            </button>
                                            <button onClick={() => openDeleteDialog(guest)} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-destructive/10 text-destructive text-xs font-black uppercase tracking-widest border border-destructive/20 active:bg-destructive/20 transition-colors">
                                                <span className="material-symbols-outlined text-lg">delete</span>
                                                Delete
                                            </button>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    ) : (
                        <div className="text-center p-10 flex flex-col items-center justify-center gap-4 text-muted-foreground h-full">
                            <span className="material-symbols-outlined text-6xl text-slate-400">groups</span>
                            <h3 className="text-lg font-semibold text-foreground">No Guests Found</h3>
                            <p>Your guest list is empty or your filters cleared everyone!</p>
                        </div>
                    )}
                </div>
            </main>
            <div className="fixed bottom-28 right-6 z-30">
                <Button onClick={() => openGuestDialog(null)} className="w-14 h-14 rounded-full shadow-lg shadow-primary/30 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform">
                    <span className="material-symbols-outlined text-3xl">add</span>
                </Button>
            </div>
            
             <Dialog open={isGuestDialogOpen} onOpenChange={handleCloseGuestDialog}>
                <DialogContent className="sm:max-w-[425px] grid-rows-[auto_minmax(0,1fr)_auto] p-0 max-h-[90dvh]">
                    <DialogHeader className="p-6 pb-0">
                        <DialogTitle>{activeGuest ? 'Edit' : 'Add'} Guest</DialogTitle>
                    </DialogHeader>
                    <ScrollArea className="h-full">
                      <div className="grid gap-4 py-4 px-6">
                          <div className="space-y-2">
                              <Label htmlFor="name" className="text-sm font-extrabold text-foreground uppercase tracking-wider">Name</Label>
                              <Input id="name" value={formState.name || ''} onChange={(e) => handleFormChange('name', e.target.value)} />
                          </div>
                          <div className="space-y-2">
                              <Label htmlFor="group" className="text-sm font-extrabold text-foreground uppercase tracking-wider">Group</Label>
                              <Input id="group" value={formState.group || ''} onChange={(e) => handleFormChange('group', e.target.value)} placeholder="e.g. Family, Friends" />
                          </div>
                          <div className="space-y-2">
                              <Label className="text-sm font-extrabold text-foreground uppercase tracking-wider">Side</Label>
                              <RadioGroup value={formState.side} onValueChange={(val) => handleFormChange('side', val as 'bride' | 'groom' | 'both')} className="flex gap-4 pt-1">
                                  <div className="flex items-center space-x-2"><RadioGroupItem value="bride" id="r-bride" /><Label htmlFor="r-bride" className="font-normal text-base">Bride</Label></div>
                                  <div className="flex items-center space-x-2"><RadioGroupItem value="groom" id="r-groom" /><Label htmlFor="r-groom" className="font-normal text-base">Groom</Label></div>
                                  <div className="flex items-center space-x-2"><RadioGroupItem value="both" id="r-both" /><Label htmlFor="r-both" className="font-normal text-base">Both</Label></div>
                              </RadioGroup>
                          </div>
                          <div className="space-y-2">
                              <Label className="text-sm font-extrabold text-foreground uppercase tracking-wider">Status</Label>
                              <RadioGroup value={formState.status} onValueChange={(val) => handleFormChange('status', val as 'pending' | 'confirmed')} className="flex gap-4 pt-1">
                                  <div className="flex items-center space-x-2"><RadioGroupItem value="pending" id="s-pending" /><Label htmlFor="s-pending" className="font-normal text-base">Pending</Label></div>
                                  <div className="flex items-center space-x-2"><RadioGroupItem value="confirmed" id="s-confirmed" /><Label htmlFor="s-confirmed" className="font-normal text-base">Confirmed</Label></div>
                              </RadioGroup>
                          </div>
                          <div className="space-y-2">
                              <Label className="text-sm font-extrabold text-foreground uppercase tracking-wider">Dietary Preference</Label>
                              <RadioGroup value={formState.diet || 'none'} onValueChange={(val) => handleFormChange('diet', val as 'none' | 'veg' | 'non-veg')} className="flex gap-4 pt-1">
                                  <div className="flex items-center space-x-2"><RadioGroupItem value="none" id="d-none" /><Label htmlFor="d-none" className="font-normal text-base">None</Label></div>
                                  <div className="flex items-center space-x-2"><RadioGroupItem value="veg" id="d-veg" /><Label htmlFor="d-veg" className="font-normal text-base">Veg</Label></div>
                                  <div className="flex items-center space-x-2"><RadioGroupItem value="non-veg" id="d-nonveg" /><Label htmlFor="d-nonveg" className="font-normal text-base">Non-Veg</Label></div>
                              </RadioGroup>
                          </div>
                          <div className="space-y-2">
                              <Label htmlFor="email" className="text-sm font-extrabold text-foreground uppercase tracking-wider">Email</Label>
                              <Input id="email" type="email" value={formState.email || ''} onChange={(e) => handleFormChange('email', e.target.value)} />
                          </div>
                          <div className="space-y-2">
                              <Label htmlFor="phone" className="text-sm font-extrabold text-foreground uppercase tracking-wider">Phone</Label>
                              <Input id="phone" type="tel" value={formState.phone || ''} onChange={(e) => handleFormChange('phone', e.target.value)} />
                          </div>
                          <div className="space-y-2">
                              <Label htmlFor="notes" className="text-sm font-extrabold text-foreground uppercase tracking-wider">Notes</Label>
                              <Textarea id="notes" value={formState.notes || ''} onChange={(e) => handleFormChange('notes', e.target.value)} placeholder="e.g. Party size, allergies, +1s..."/>
                          </div>
                      </div>
                    </ScrollArea>
                    <DialogFooter className="p-6 pt-0 border-t mt-4">
                        <Button onClick={handleSaveGuest} className="w-full mt-4 h-12 text-base">Save Guest</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog open={isDeleteDialogOpen} onOpenChange={handleCloseDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the guest "{guestToDelete?.name}".
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={handleCloseDeleteDialog}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
