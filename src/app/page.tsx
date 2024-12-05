"use client"
import { LoginComponent } from "@/components/LoginComponent";
import { SignupComponent } from "@/components/SignupComponent";
import { createClient } from "@/utils/supabase/client";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";

export default function HomePage() {
  const supabase = createClient();
  const [signup, setSignup] = useState(false);

  useEffect(() => {
    const isLoggedIn = async () => {

      const { data } = await supabase.auth.getUser();
      if(data?.user) {
        redirect('/chat');
      }
    }

    isLoggedIn();
  }, [])

  return (
    <>
        <div className="w-screen h-screen grid place-content-center">
            <p className="text-2xl md:text-4xl text-white text-center">Welcome to HotswapAI</p>
            <div className="w-full grid mt-8 justify-center">
              {!signup ? (
                <>
                  <LoginComponent />
                  <div className="flex text-white">
                    <p>Don't have an account?</p>
                    <button onClick={() => setSignup(!signup)}>&nbsp;Create a new account</button>
                  </div>
                </>
              ) : (
                <>
                  <SignupComponent />
                    <div className="flex text-white">
                    <p>Already have an account?</p>
                    <button onClick={() => setSignup(!signup)}>&nbsp;Sign In here</button>
                </div>
                </>
              )}
            </div>
        </div>    
    </>
  )
}