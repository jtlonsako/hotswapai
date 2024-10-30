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
    }]
}

export function ModelSelector({modelFamily, displayName, isSidebarOpen, setModelFamily, setDisplayName}) {
    const [api, setApi] = useState<CarouselApi>();
    const setConversationId = useConversationStore((state) => state.setConversationId)
    const modelName = useModelStore((state) => state.modelName);
    const setModelName = useModelStore((state) => state.setModelName);

    const modelNameList = modelDetails[modelFamily].map((model) => {
            return(
                    <li key={model.modelName}>
                        {model.modelName === modelName ? (
                            <PopoverClose asChild>
                                <Button className="w-full text-left bg-accent text-accent-foreground" variant="ghost" onClick={() => handleModelNamePress(model)}>{model.displayName}</Button>
                            </PopoverClose>

                        ) : (
                            <PopoverClose asChild>
                                <Button className="w-full text-left" variant="ghost" onClick={() => handleModelNamePress(model)}>{model.displayName}</Button>
                            </PopoverClose>
                        )}
                    </li>
            )
    })

    const modelFamilyList = createModelFamilyList();

    useEffect(() => {
        setModelName(modelDetails[modelFamily][0].modelName)
        setDisplayName(modelDetails[modelFamily][0].displayName)
    }, [modelFamily])

    function handleModelNamePress(model) {
        setModelName(model.modelName);
        setDisplayName(model.displayName);
        setConversationId(-1); //Reset conversationId to start a new conversation
    }

    //NOTE: Atm, the carousel transition is janky because this whole component is re-rendered whenever I change modelFamily.
    //Gotta find a way to make it smooth.
    function handleModelFamilyPress(key) {
        setModelFamily(key);
        api?.scrollNext();
    }

    function createModelFamilyList() {
        const modelFamilyList = []
        for(const key in modelDetails) {
            modelFamilyList.push(
                <li key={key}>
                    {key === modelFamily ? (
                        <Button className="w-full text-left bg-accent text-accent-foreground" variant="ghost" onClick={() => handleModelFamilyPress(key)}>
                            <div className="grid grid-cols-2 w-full">
                                <p>{key}</p>
                                <p className="justify-self-end">&gt;</p>
                            </div>
                        </Button>
                    ) : (
                        <Button className="w-full text-left" variant="ghost" onClick={() => handleModelFamilyPress(key)}>
                            <div className="grid grid-cols-2 w-full">
                                <p>{key}</p>
                                <p className="justify-self-end">&gt;</p>
                            </div>
                        </Button>
                    )}
                </li>
            )
        }
        return modelFamilyList;    
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
                    <PopoverContent className="w-96">
                        <Carousel setApi={setApi} className={`${isSidebarOpen ? 'ml-24' : 'ml-1'}`}>
                            <CarouselContent>
                                <CarouselItem>
                                    <ul className="w-full border border-zinc-600 rounded-lg bg-[#2b2b2b]">
                                        {modelFamilyList}
                                    </ul>
                                </CarouselItem>
                                <CarouselItem>
                                    <ul className="w-full border border-zinc-600 rounded-lg bg-[#2b2b2b]">
                                        {modelNameList}
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