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
import { useConversationStore, useModelStore } from "@/lib/stores";
import { getModelsByProvider, getProviders } from "@/db/queries";

export function ModelSelector({currentProvider, displayName, isSidebarOpen, setCurrentProvider, setDisplayName, userId}: 
    {currentProvider: string, displayName: string, isSidebarOpen: boolean, setCurrentProvider: Function, setDisplayName: Function, userId: string}) {
    const [api, setApi] = useState<CarouselApi>();
    const [providers, setCurrentProviders] = useState<{id: number, company: string}[]>([]);
    const [models, setModels] = useState<{
        displayName: string;
        id: number;
        provider: number | null;
        apiName: string;
    }[]>([]);
    const [modelDisplay, setModelDisplay] = useState<React.ReactNode[]>([<li key="0"></li>])
    const [providersDisplay, setCurrentProvidersDisplay] = useState<React.ReactNode[]>([<li key="0"></li>]);
    const [loading, setLoading] = useState(true);
    const [loadingModels, setLoadingModels] = useState(false);
    const setConversationId = useConversationStore((state) => state.setConversationId)
    const modelName = useModelStore((state) => state.modelName);
    const setModelName = useModelStore((state) => state.setModelName);

    useEffect(() => {
        const getProviderList = async () => {
            setLoading(true); // Set loading to true before fetching
            const providerList = await getProviders(userId)
            setCurrentProviders(providerList);
            if(providerList.length > 0 ) setCurrentProvider(providerList[0].company);
            setLoading(false); // Set loading to false after fetching
        }

        getProviderList();
    }, [userId])

    useEffect(() => {
        const getModelList = async () => {
            setLoadingModels(true); // Set loading models to true
            //Check if any providers are currently selected
            if(providers.length > 0) {
                const currentProviderId = providers.filter(provider => provider.company === currentProvider)[0].id;
                const modelList = await getModelsByProvider(currentProviderId);
                setModels(modelList);
                setLoadingModels(false); // Set loading models to false after fetching
            } else {
                //display special message and stop further execution
            }
        }

        getModelList();
        setCurrentProvidersDisplay(providers.map((provider) => {
            return (
                <li key={provider.company}>
                    <Button className={`w-full text-left ${provider.company === currentProvider ? 'bg-accent text-accent-foreground' : ''}`} variant="ghost" onClick={() => handleModelFamilyPress(provider.company)}>
                        <div className="grid grid-cols-2 w-full">
                            <p>{provider.company}</p>
                            <p className="justify-self-end">&gt;</p>
                        </div>
                    </Button>
                </li>
            )
        }))

    }, [providers, currentProvider])

    //Change currently selected model immediately when a new provider is selected
    useEffect(() => {
        if(models.length > 0){
            setModelName(models[0].apiName);
            setDisplayName(models[0].displayName);
        }
    }, [models])

    //Change which model list item is highlighted when you choose a new model
    useEffect(() => {
        setModelDisplay(models.map((model) => {
            return (
                <li key={model.id}>
                    <PopoverClose asChild>
                        <Button className={`w-full text-left ${model.displayName === displayName ? 'bg-accent text-accent-foreground' : ''}`} variant="ghost" onClick={() => handleModelNamePress(model)}>{model.displayName}</Button>
                    </PopoverClose>
                </li>
            )
        }))
    }, [models, displayName])

    useEffect(() => {
        if (currentProvider && api) {
            api.scrollNext();
        }
    }, [currentProvider]);


    function handleModelNamePress(model: {apiName: string, displayName: string}) {
        setModelName(model.apiName);
        setDisplayName(model.displayName);
        setConversationId(-1); //Reset conversationId to start a new conversation
    }

    function handleModelFamilyPress(key: string) {
        setCurrentProvider(key);  
    }

    return (
        <>
            <div>
                <p className="text-white mb-1 text-xs">Current Model:</p>
                <div className="grid w-44 border border-zinc-600 rounded-lg text-white">
                    {loading ? (
                        <div className="w-full h-full p-2 bg-[#2b2b2b] rounded-md">
                            <div className="flex justify-center items-center py-4">
                                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-white"></div>
                            </div>
                        </div>
                    ) : providers.length > 0 ? (
                        <Popover>
                            <PopoverTrigger asChild>
                            <div className="w-full h-full p-2 bg-[#2b2b2b] hover:bg-zinc-100 hover:text-black transition-all hover:cursor-pointer rounded-md">
                                <p className="text-left text-lg font-bold">{currentProvider}</p>
                                <p className="text-left text-xs">{displayName}</p>
                            </div>
                            </PopoverTrigger>
                            <PopoverContent className="w-52 md:w-96">
                                {loading ? (
                                    <div className="flex justify-center items-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
                                    </div>
                                ) : (
                                    <Carousel setApi={setApi} className={`${isSidebarOpen ? 'md:ml-24' : 'ml-1'}`}>
                                        <CarouselContent>
                                            <CarouselItem>
                                            <ul className="w-full border border-zinc-600 rounded-lg bg-[#2b2b2b]">
                                                {providersDisplay}
                                            </ul>
                                        </CarouselItem>
                                        <CarouselItem>
                                            <ul className="w-full border border-zinc-600 rounded-lg bg-[#2b2b2b]">
                                                {loadingModels ? (
                                                    <div className="flex justify-center items-center py-4">
                                                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
                                                    </div>
                                                ) : (
                                                    modelDisplay
                                                )}
                                            </ul>
                                        </CarouselItem>
                                    </CarouselContent>
                                </Carousel>
                                )}
                            </PopoverContent>
                        </Popover>
                    ) : (
                        <div className="w-full h-full p-2 bg-[#2b2b2b] hover:bg-[#2f2f2f] hover:text-zinc-200 transition-all hover:cursor-not-allowed rounded-md">
                            <p className="text-left text-md font-bold">No Providers Available</p>
                            <p className="text-left text-xs">Add API Keys in your profile settings to gain chat access</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}