import { Avatar, AvatarFallback } from '@radix-ui/react-avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { createClient } from '@/utils/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { ApiKeyManagement } from './ApiKeyManagement';
import { useEffect, useState } from 'react';
import { getUserInfo, updateUserInfo } from '@/db/queries';
import { userInfo } from 'os';

export function ProfileMenu() {
    const [userId, setUserId] = useState("");
    const [currentUserInfo, setUserInfo] = useState({firstName: '', lastName: '', initials: ''})
    const supabase = createClient();

    useEffect(() => {
        const isLoggedIn = async () => {
  
          const { data, error } = await supabase.auth.getUser();

          if(error) throw error;


          setUserId(data.user!.id)
          const loadedUserInfo = await getUserInfo(data.user!.id);
          const initials = loadedUserInfo[0].first_name.charAt(0) + loadedUserInfo[0].last_name.charAt(0);
          setUserInfo({firstName: loadedUserInfo[0].first_name, lastName: loadedUserInfo[0].last_name, initials});
        }
    
        isLoggedIn();
      }, [])


    async function handleSignOut() {
        await supabase.auth.signOut();
        redirect('/');    }

    return (
            <DropdownMenu>
                <DropdownMenuTrigger className="hover:bg-slate-200 hover:text-black text-slate-200 bg-slate-400 transition-colors rounded-full px-5 py-4">
                    <Avatar>
                    <AvatarFallback>{currentUserInfo.initials}</AvatarFallback>
                    </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <Dialog>
                        <DropdownMenuLabel>{currentUserInfo.firstName + " " + currentUserInfo.lastName}</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DialogTrigger asChild>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                Settings
                            </DropdownMenuItem>
                        </DialogTrigger>
                        <DropdownMenuItem className="bg-red-200">
                            <button onClick={handleSignOut} className="text-red-600 font-bold">
                                <p>Sign Out</p>
                            </button>
                        </DropdownMenuItem>
                        <SettingsDialog userId={userId} />
                    </Dialog>
                </DropdownMenuContent>
            </DropdownMenu>
    )
}

// function SettingsDialog({userId}: {userId: string}) {

//     return (
//         <DialogContent className='bg-white'>
//             <DialogHeader>
//                 <DialogTitle className='text-slate-600'>Settings</DialogTitle>
//             </DialogHeader>
//             <Tabs defaultValue="account" className="w-full md:w-[400px]">
//                     <TabsList className="grid w-full grid-cols-2">
//                         <TabsTrigger value="account">Account</TabsTrigger>
//                         <TabsTrigger value="apiKeys">API Keys</TabsTrigger>
//                     </TabsList>
//                     <TabsContent value="account">
//                         <Card>
//                         <CardHeader>
//                             <CardTitle>Account</CardTitle>
//                             <CardDescription>
//                             Make changes to your account here. Click save when you're done.
//                             </CardDescription>
//                         </CardHeader>
//                         <CardContent className="space-y-2">
//                             <div className="space-y-1">
//                             <Label htmlFor="firstName">First Name</Label>
//                             <Input id="firstName" placeholder='Enter First Name' />
//                             </div>
//                             <div className="space-y-1">
//                             <Label htmlFor="lastName">Last Name</Label>
//                             <Input id="lastName" placeholder='Enter Last Name' />
//                             </div>
//                         </CardContent>
//                         <CardFooter>
//                             <Button>Save changes</Button>
//                         </CardFooter>
//                         </Card>
//                     </TabsContent>
//                     <TabsContent value="apiKeys">
//                         <Card>
//                         <CardHeader>
//                             <CardTitle>API Keys</CardTitle>
//                             <CardDescription>
//                             Make changes to your currently available API Keys, or add new ones.
//                             </CardDescription>
//                         </CardHeader>
//                         <CardContent className="">
//                             <ApiKeyManagement userId={userId} />
//                         </CardContent>
//                         </Card>
//                     </TabsContent>
//                 </Tabs>
//         </DialogContent>

//     )
// }

function SettingsDialog({ userId }: { userId: string }) {
    const [userInfo, setUserInfo] = useState({ firstName: '', lastName: '' });

    useEffect(() => {
        const fetchUserInfo = async () => {
            const loadedUserInfo = await getUserInfo(userId);
            setUserInfo({
                firstName: loadedUserInfo[0].first_name,
                lastName: loadedUserInfo[0].last_name,
            });
        };

        if (userId) {
            fetchUserInfo();
        }
    }, [userId]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setUserInfo((prev) => ({
            ...prev,
            [id]: value, // Dynamically update the field based on the input's id
        }));
    };

    const handleSaveChanges = async () => {
        await updateUserInfo(userId, userInfo.firstName, userInfo.lastName)
    };

    return (
        <DialogContent className="bg-white">
            <DialogHeader>
                <DialogTitle className="text-slate-600">Settings</DialogTitle>
            </DialogHeader>
            <Tabs defaultValue="account" className="w-full md:w-[400px]">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="account">Account</TabsTrigger>
                    <TabsTrigger value="apiKeys">API Keys</TabsTrigger>
                </TabsList>
                <TabsContent value="account">
                    <Card>
                        <CardHeader>
                            <CardTitle>Account</CardTitle>
                            <CardDescription>
                                Make changes to your account here. Click save when you're done.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="space-y-1">
                                <Label htmlFor="firstName">First Name</Label>
                                <Input
                                    id="firstName"
                                    placeholder="Enter First Name"
                                    value={userInfo.firstName}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="lastName">Last Name</Label>
                                <Input
                                    id="lastName"
                                    placeholder="Enter Last Name"
                                    value={userInfo.lastName}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button onClick={handleSaveChanges}>Save changes</Button>
                        </CardFooter>
                    </Card>
                </TabsContent>
                <TabsContent value="apiKeys">
                    <Card>
                        <CardHeader>
                            <CardTitle>API Keys</CardTitle>
                            <CardDescription>
                                Make changes to your currently available API Keys, or add new ones.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="">
                            <ApiKeyManagement userId={userId} />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </DialogContent>
    );
}