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
const formSchema = z.object({
    firstname: z.string().min(1).max(50),
    lastname: z.string().min(1).max(50),
    email: z.string().min(2).max(50),
    password: z.string().min(6).max(50)
  })

export function SignupComponent() {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
          firstname: "",
          lastname: "",
          email: "",
          password: "",
        },
      })

      function onSubmit(values: z.infer<typeof formSchema>) {
        // Do something with the form values.
        // ✅ This will be type-safe and validated.
        signup(values);
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
                <Button type="submit" className="w-full mt-4">Sign Up</Button>
            </form>
        </Form>
    )
}