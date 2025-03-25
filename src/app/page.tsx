"use client"
import { LoginComponent } from "@/components/LoginComponent";
import { createClient } from "@/utils/supabase/client";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button"
import { SignupComponent } from "@/components/SignupComponent";

export default function HomePage() {
  const [signingIn, setSigningIn] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    const isLoggedIn = async () => {

      const { data } = await supabase.auth.getUser();
      if(data?.user) {
        redirect('/chat');
      }
    }

    isLoggedIn();
  }, [])

  function loginOrSignup(option: boolean) {
    setSigningIn(option);
  }

  return (
    <>
        <div className="w-screen h-screen grid place-content-center">
            <p className="text-2xl md:text-4xl text-white text-center">Welcome to HotswapAI</p>
            <div className="w-full grid mt-8 justify-center">
                {/* <SignInButton className="h-fit border border-zinc-200 rounded-lg hover:bg-zinc-500 transition-colors p-2 text-white" /> */}
                {signingIn ? (
                  <LoginComponent />
                ) : (
                  <SignupComponent />
                )}
                <button className="mt-3 text-blue-300 hover:text-blue-100" onClick={() => loginOrSignup(!signingIn)}>
                  {signingIn ? (
                    <p>Create an Account</p>
                  ) : (
                    <p>Already have an account? Sign in</p>
                  )}
                </button>
            </div>
        </div>    
    </>
  )
}