import { login } from "@/utils/actions";
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
    email: z.string().min(2).max(50),
    password: z.string().min(6).max(50)
  })

export function LoginComponent() {
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
          email: "",
          password: "",
        },
      })

      async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true);
        try {
          const result = await login(values);
          if (!result.success) {
            toast({
              title: "Login Failed",
              description: result.error || "Invalid email or password. Please try again.",
              variant: "destructive",
            });
          }
        } catch (error) {
          toast({
            title: "Login Error",
            description: error.message,
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
                            Signing In...
                        </>
                    ) : (
                        "Sign In"
                    )}
                </Button>
            </form>
        </Form>
    )
}