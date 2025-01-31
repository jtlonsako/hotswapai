import {
    Popover,
    PopoverClose,
    PopoverContent,
    PopoverTrigger
 } from "@radix-ui/react-popover";
import { Carousel, CarouselContent, CarouselItem } from "./ui/carousel";
import { type CarouselApi } from "@/components/ui/carousel"
import { Button } from "./ui/button";
import { useEffect, useState } from "react";
import { createClient } from '@/utils/supabase/client';
import { useConversationStore, useModelStore } from "@/lib/stores";
import { getModels, getProvidersByUser } from "@/db/queries";

//NOTE: Selecting a provider does not auto-update the selected model - FIX THIS.
export function ModelSelector({modelFamily, displayName, isSidebarOpen, setModelFamily, setDisplayName}) {
    const [api, setApi] = useState<CarouselApi>();
    const [providers, setProviders] = useState([{id: 0, company: ''}]);
    const [models, setModels] = useState([]);
    const [userId, setUserId] = useState<string>('');
    const [modelDisplay, setModelDisplay] = useState<Element[]>([<li key="0"></li>])
    const [providersDisplay, setProvidersDisplay] = useState<Element[]>([<li key="0"></li>]);
    const setConversationId = useConversationStore((state) => state.setConversationId)
    const modelName = useModelStore((state) => state.modelName);
    const setModelName = useModelStore((state) => state.setModelName);

    const supabase = createClient();


    useEffect(() => {
        const isLoggedIn = async () => {
  
          const { data, error } = await supabase.auth.getUser();
          setUserId(data.user.id)
        }    
        isLoggedIn();
      }, [])

    useEffect(() => {
        const getProviderList = async () => {
            // const providerList = await getProviders();
            const providerList = await getProvidersByUser(userId);
            const modelList = await getModels();
            console.log(providerList);
            setModels(modelList);
            setProviders(providerList);
        }

        getProviderList();
    }, [userId])

    useEffect(() => {
        if (providers.length >= 1 && providers[0].id !== 0) {
            setProvidersDisplay(providers.map((provider) => {
                return (
                    <li key={provider.company}>
                        <Button className={`w-full text-left ${provider.company === modelFamily ? 'bg-accent text-accent-foreground' : ''}`} variant="ghost" onClick={() => handleModelFamilyPress(provider)}>
                            <div className="grid grid-cols-2 w-full">
                                <p>{provider.company}</p>
                                <p className="justify-self-end">&gt;</p>
                            </div>
                        </Button>
                    </li>
                )
            }))
        } else {
            setProvidersDisplay(
                <>
                    <Button className="w-full text-left" variant="ghost">
                        <div className="grid grid-cols-2 w-full">
                            <p>Add new provider</p>
                            <p className="justify-self-end">+</p>
                        </div>                    
                    </Button>
                </>
            )
            setModelFamily("No Providers Added")
            setModelName("");
            setDisplayName("")
        }

    }, [providers, modelFamily])

    useEffect(() => {
        const currentProviderId = providers.filter((provider) => provider.company === modelFamily)[0]?.id;
        const modelsFromProvider = models.filter((model) => model.provider === currentProviderId)
        setModelDisplay(modelsFromProvider.map((model) => {
            return (
                <li key={model.id}>
                    <PopoverClose asChild>
                        <Button className={`w-full text-left ${model.display_name === displayName ? 'bg-accent text-accent-foreground' : ''}`} variant="ghost" onClick={() => handleModelNamePress(model)}>
                            <p>{model.display_name}</p>
                        </Button>
                    </PopoverClose>
                </li>
            )
        }))
    }, [modelFamily, displayName])

    function handleModelNamePress(model) {
        setModelName(model.api_name);
        setDisplayName(model.display_name);
        setConversationId(-1); //Reset conversationId to start a new conversation
    }

    function handleModelFamilyPress(provider) {
        setModelFamily(provider.company);
        const currentModel = models.filter((model => model.provider === provider.id))[0];
        setModelName(currentModel.api_name);
        setDisplayName(currentModel.display_name);
        api?.scrollNext();
    }

    return (
        <>
            <p className="text-white mb-1 text-xs">Current Model:</p>
            <div className="grid w-44 border border-zinc-600 rounded-lg text-white">
                <Popover>
                    <PopoverTrigger asChild>
                        <div className="w-full h-full p-2 bg-[#2b2b2b] hover:bg-zinc-100 hover:text-black transition-all hover:cursor-pointer rounded-md">
                            <p className="text-left text-lg font-bold">{modelFamily}</p>
                            <p className="text-left text-xs">{displayName}</p>
                        </div>
                    </PopoverTrigger>
                    <PopoverContent className="w-52 md:w-80">
                        <Carousel setApi={setApi} className={`${isSidebarOpen ? 'ml-6' : 'ml-1'}`}>
                            <CarouselContent>
                                <CarouselItem>
                                    <ul className="w-full border border-zinc-600 rounded-lg bg-[#2b2b2b]">
                                        {providersDisplay}
                                    </ul>
                                </CarouselItem>
                                <CarouselItem>
                                    <ul className="w-full border border-zinc-600 rounded-lg bg-[#2b2b2b]">
                                        {/* {modelNameList} */}
                                        {modelDisplay}
                                    </ul>
                                </CarouselItem>
                            </CarouselContent>
                        </Carousel>
                    </PopoverContent>
                </Popover>
            </div>
        </>
    )
}