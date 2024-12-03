import { getUserApiKeys } from "@/db/queries";
import { z } from 'zod';
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useEffect, useState } from "react";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
  } from "@/components/ui/accordion"
  import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
  } from "@/components/ui/form"
  import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from "./ui/input";
import { saveApiSecret } from '@/db/queries';
import { Button } from "./ui/button";

const formSchema = z.object({
    provider: z.string().min(2).max(50),
    apiKey: z.string().min(6).max(300)
  })

export function ApiKeyManagement({userId = ""} : {userId: string}) {
    const [apiKeyData, setApiKeyData] = useState(<></>);

      useEffect(() => {
        if(userId !== ''){
            console.log(userId)
            getUserApiKeys(userId).then((data) => {
                let apiKeyList: [] = [];
                data.forEach((apiKey) => {
                    apiKeyList = [...apiKeyList,
                        <tr>
                            <td key={apiKey.name}>{apiKey.provider}</td>
                        </tr>
                    ]
                })
    
                setApiKeyData(apiKeyList);
            })
        }
      }, [userId])

    //   async function onSubmit(values: z.infer<typeof formSchema>) {
    //     // Do something with the form values.
    //     // ✅ This will be type-safe and validated.
    //     await saveApiSecret(values.provider, values.apiKey, userId.current!)
    //   }

    return(
        <>
            <table>
                <thead>
                    <tr>
                        <th>Available Providers</th>
                    </tr>
                </thead>
                <tbody>
                    {apiKeyData}
                </tbody>
            </table>
            <AddApiKey userId={userId} />
        </>
    )
}

function AddApiKey({userId}: {userId: string}) {

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
          provider: "",
          apiKey: "",
        },
      })

      async function onSubmit(values: z.infer<typeof formSchema>) {
        // Do something with the form values.
        // ✅ This will be type-safe and validated.
        await saveApiSecret(values.provider, values.apiKey, userId!)
      }

    return (
        <>
        <Accordion type="single" collapsible>
            <AccordionItem value="item-1">
                <AccordionTrigger>Add API Key</AccordionTrigger>
                <AccordionContent>
                <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="w-full grid justify-center md:justify-start md:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="apiKey"
                        render={({ field }) => (
                        <FormItem className="w-40 text-zinc-500">
                            <FormLabel>API Key</FormLabel>
                            <FormControl>
                            <Input placeholder="sk-*****" type="text" {...field} />
                            </FormControl>
                            {/* <FormDescription>
                                Enter your API Key here
                            </FormDescription> */}
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="provider"
                        render={({ field }) => (
                            <FormItem className="md:ml-2 text-zinc-500">
                                <FormLabel>Provider</FormLabel>
                                <FormControl>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <SelectTrigger className="w-40">
                                            <SelectValue placeholder="LLM Provider" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="openai">OpenAI</SelectItem>
                                            <SelectItem value="anthropic">Anthropic</SelectItem>
                                            <SelectItem value="google">Google</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FormControl>
                                {/* <FormDescription>
                                    Enter your password here
                                </FormDescription> */}
                                <FormMessage />
                            </FormItem>
                        )}
                    />  
                    <Button type="submit" className="w-full mt-4">Submit Key</Button>
                </form>
            </Form>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
        </>
    )
}