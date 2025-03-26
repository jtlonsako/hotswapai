import { signup } from "@/utils/actions";
import { z } from 'zod';
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

const formSchema = z.object({
    firstname: z.string().min(1).max(50),
    lastname: z.string().min(1).max(50),
    email: z.string().min(2).max(50),
    password: z.string().min(6).max(50)
  })

export function SignupComponent({ onSuccessfulSignup }: { onSuccessfulSignup: () => void }) {
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
          firstname: "",
          lastname: "",
          email: "",
          password: "",
        },
      })

      async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true);
        try {
          const result = await signup(values);
          if (result.success) {
            toast({
              title: "Account Created Successfully",
              description: "Please check your email to verify your account before logging in.",
              variant: "default",
            });
            onSuccessfulSignup(); //Set home page back to signup
          } else {
            toast({
              title: "Signup Failed",
              description: result.error || "There was an error creating your account. Please try again.",
              variant: "destructive",
            });
          }
        } catch (error) {
          toast({
            title: "Signup Error",
            description: error.message || "An unexpected error occurred.",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      }

    return(
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="w-full md:w-64 space-y-4 text-zinc-200">
                <FormField
                    control={form.control}
                    name="firstname"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                        <Input placeholder="Enter first name" type="text" {...field} />
                        </FormControl>
                        {/* <FormDescription>
                        Enter your username here
                        </FormDescription> */}
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="lastname"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Enter last name" type="text" {...field} />
                            </FormControl>
                            {/* <FormDescription>
                                Enter your password here
                            </FormDescription> */}
                            <FormMessage />
                        </FormItem>
                    )}
                /> 
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                        <Input placeholder="elonmusk@x.com" type="email" {...field} />
                        </FormControl>
                        {/* <FormDescription>
                        Enter your username here
                        </FormDescription> */}
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                                <Input placeholder="******" type="password" {...field} />
                            </FormControl>
                            {/* <FormDescription>
                                Enter your password here
                            </FormDescription> */}
                            <FormMessage />
                        </FormItem>
                    )}
                />  
                <Button type="submit" className="w-full mt-4" disabled={isLoading}>
                    {isLoading ? (
                        <>
                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                            Signing Up...
                        </>
                    ) : (
                        "Sign Up"
                    )}
                </Button>
            </form>
        </Form>
    )
}