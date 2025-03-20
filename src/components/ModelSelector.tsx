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

const modelDetails = {
    OpenAI: [{
        modelName: "gpt-4o-mini",
        displayName: "GPT-4o mini ($)"
    }, {
        modelName: "chatgpt-4o-latest",
        displayName: "GPT-4o latest ($$)"
    }, {
        modelName: "gpt-4-turbo",
        displayName: "GPT-4 Turbo ($$$)"
    }, {
        modelName: "gpt-3.5-turbo",
        displayName: "GPT-3.5 Turbo ($$)"
    }],
    Anthropic: [{
        modelName: "claude-3-opus-20240229",
        displayName: "Claude-3 Opus ($$$$)"
    }, {
        modelName: "claude-3-haiku-20240307",
        displayName: "Claude-3.5 Haiku ($$)"
    }, {
        modelName: "claude-3-5-sonnet-20240620",
        displayName: "Claude-3.5 Sonnet ($$$)"
    }],
    Google: [{
        modelName: "gemini-1.5-pro-latest",
        displayName: "Gemini-1.5 Pro Latest ($$)"
    }, {
        modelName: "gemini-1.5-pro",
        displayName: "Gemini-1.5 Pro ($$)"
    }, {
        modelName: "gemini-1.5-flash-latest",
        displayName: "Gemini-1.5 Flash Latest ($)"
    }, {
        modelName: "gemini-1.5-flash",
        displayName: "Gemini-1.5 Flash ($)"
    }],
    DeepSeek: [{
        modelName: "deepseek-chat",
        displayName: "DeepSeek Chat ($)"
    }, {
        modelName: "deepseek-reasoner",
        displayName: "DeepSeek R1 ($$)"
    }]
}

export function ModelSelector({modelFamily, displayName, isSidebarOpen, setModelFamily, setDisplayName}) {
    const [api, setApi] = useState<CarouselApi>();
    const [providers, setProviders] = useState([{id: 0, company: ''}]);
    const [models, setModels] = useState([]);
    const [modelDisplay, setModelDisplay] = useState<Element[]>([<li key="0"></li>])
    const [providersDisplay, setProvidersDisplay] = useState<Element[]>([<li key="0"></li>]);
    const [loading, setLoading] = useState(true);
    const setConversationId = useConversationStore((state) => state.setConversationId)
    const modelName = useModelStore((state) => state.modelName);
    const setModelName = useModelStore((state) => state.setModelName);

    useEffect(() => {
        const getProviderList = async () => {
            setLoading(true); // Set loading to true before fetching
            const providerList = await getProviders()
            const currentProviderId = providerList.filter((provider) => provider.company === modelFamily)[0].id;
            const modelList = await getModelsByProvider(currentProviderId);
            setProviders(providerList);
            setLoading(false); // Set loading to false after fetching

        }

        getProviderList();
    }, [])

    useEffect(() => {
        const getModelList = async () => {
            const currentProviderId = providers.filter((provider) => provider.company === modelFamily)[0]?.id;
            const modelList = await getModelsByProvider(currentProviderId);
            console.log(modelList);
            setModels(modelList);
        }

        getModelList();
        setProvidersDisplay(providers.map((provider) => {
            return (
                <li key={provider.company}>
                    <Button className={`w-full text-left ${provider.company === modelFamily ? 'bg-accent text-accent-foreground' : ''}`} variant="ghost" onClick={() => handleModelFamilyPress(provider.company)}>
                        <div className="grid grid-cols-2 w-full">
                            <p>{provider.company}</p>
                            <p className="justify-self-end">&gt;</p>
                        </div>
                    </Button>
                </li>
            )
        }))

    }, [providers, modelFamily])

    useEffect(() => {
        setModelDisplay(models.map((model) => {
            return (
                <li key={model.id}>
                    <PopoverClose asChild>
                        <Button className={`w-full text-left ${model.displayName === modelName ? 'bg-accent text-accent-foreground' : ''}`} variant="ghost" onClick={() => handleModelNamePress(model)}>{model.display_name}</Button>
                    </PopoverClose>
                </li>
            )
        }))
    }, [modelFamily, models])

    const modelNameList = modelDetails[modelFamily].map((model) => {
            return(
                <li key={model.modelName}>
                    <PopoverClose asChild>
                        <Button className={`w-full text-left ${model.modelName === modelName ? 'bg-accent text-accent-foreground' : ''}`} variant="ghost" onClick={() => handleModelNamePress(model)}>{model.displayName}</Button>
                    </PopoverClose>
                </li>
            )
    })

    const modelFamilyList = createModelFamilyList();

    useEffect(() => {
        setModelName(modelDetails[modelFamily][0].modelName)
        setDisplayName(modelDetails[modelFamily][0].displayName)
    }, [modelFamily])

    function handleModelNamePress(model) {
        setModelName(model.api_name);
        setDisplayName(model.display_name);
        setConversationId(-1); //Reset conversationId to start a new conversation
    }

    function handleModelFamilyPress(key) {
        setModelFamily(key);
        api?.scrollNext();
    }

    function createModelFamilyList() {
        const modelFamilyList = []
        for(const key in modelDetails) {
            modelFamilyList.push(
                <li key={key}>
                    <Button className={`w-full text-left ${key === modelFamily ? 'bg-accent text-accent-foreground' : ''}`} variant="ghost" onClick={() => handleModelFamilyPress(key)}>
                        <div className="grid grid-cols-2 w-full">
                            <p>{key}</p>
                            <p className="justify-self-end">&gt;</p>
                        </div>
                    </Button>
                </li>
            )
        }
        return modelFamilyList;    
    }

    return (
        <>
            <div>
                <p className="text-white mb-1 text-xs">Current Model:</p>
                <div className="grid w-44 border border-zinc-600 rounded-lg text-white">
                    <Popover>
                        <PopoverTrigger asChild>
                            <div className="w-full h-full p-2 bg-[#2b2b2b] hover:bg-zinc-100 hover:text-black transition-all hover:cursor-pointer rounded-md">
                                <p className="text-left text-lg font-bold">{modelFamily}</p>
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
                                            {/* {modelNameList} */}
                                            {modelDisplay}
                                        </ul>
                                    </CarouselItem>
                                </CarouselContent>
                            </Carousel>
                            )}
                        </PopoverContent>
                    </Popover>
                </div>
            </div>
        </>
    )
}