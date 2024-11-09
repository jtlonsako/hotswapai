import { SignInButton } from "@clerk/nextjs";
import { Button } from "./ui/button";


export function LoginScreen() {
    return(
        <div className="w-screen h-screen grid place-content-center">
            <p className="text-2xl md:text-4xl text-white text-center">Welcome to HotswapAI</p>
            <div className="w-full grid mt-8 justify-center">
                <SignInButton className="h-fit border border-zinc-200 rounded-lg hover:bg-zinc-500 transition-colors p-2 text-white" />
            </div>
        </div>
    )
}