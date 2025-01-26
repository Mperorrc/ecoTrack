"use client"
import Link from 'next/link';
import React from 'react';
import { authModalState } from '@/atoms/authModalAtom';
import { useSetRecoilState } from 'recoil';
import { useAuthState, useSignOut } from 'react-firebase-hooks/auth';
import { auth } from '@/firebase/firebase';
import {toast} from "react-toastify";
import { FiLogOut } from 'react-icons/fi';
import { useRouter } from 'next/navigation';

type NavbarProps = {
    
};

const Navbar:React.FC<NavbarProps> = () => {
    const setAuthModalstate = useSetRecoilState(authModalState);
    const [user,loading] = useAuthState(auth);
    const [signOut] = useSignOut(auth);
    const router = useRouter();

    const handleClick = ()=>{
        setAuthModalstate((prev) => ({...prev, isOpen: true}));
    }


    const handleLogout = async()=>{
        try {
            await signOut();
            router.push("/");
            toast.success("User Logged out", {position:"top-center", autoClose:3000, theme:"dark"});
        } catch (error:any) {
            toast.error(error.message, {position:"top-center", autoClose:3000, theme:"dark"});
        }
    }

    const handleFootprintNavigation = ()=>{
        if(user?.uid){
            router.push("/footprint");
        }
        else{
            handleClick();
        }
    }

    const handleCommunitiesNavigation = ()=>{
        if(user?.uid){
            router.push("/Communities");
        }
        else{
            handleClick();
        }
    }

    const handleChatbotNav = ()=>{
        if(user?.uid){
            router.push("/chatbot");
        }
        else{
            handleClick();
        }
    }

    const handleLandingPageNav = () =>{
        router.push("/");
    }

    return (
        <div className="flex justify-between items-center h-[8vh] px-6 md:px-12 bg-[#121212] overflow-x-auto ">
            <div className="basis-1/2 flex items-center font-extrabold sm:text-lg text-green-600  ">
                <div className="hover:cursor-pointer text-2xl tracking-wider"
                    onClick={handleLandingPageNav}
                >EcoTrack</div>
            </div>
            
            <div className="flex justify-center gap-x-4 basis-1/2 flex-1 items-center">
                <div 
                    onClick={handleChatbotNav}
                    className="hover:cursor-pointer h-[70%] m-2 flex-1 flex items-center justify-center text-center sm:text-sm md:text-base bg-gradient-to-r from-purple-600 via-blue-900 to-pink-900 text-white rounded-xl py-2"
                >
                    Chatbot
                </div>
                <div 
                    onClick={handleCommunitiesNavigation}
                    className="hover:cursor-pointer h-[70%] m-2 flex-1 flex items-center justify-center text-center sm:text-sm md:text-base bg-gradient-to-r from-purple-600 via-blue-900 to-pink-900 text-white rounded-xl py-2"
                >
                    Communities
                </div>
                <div 
                    onClick={handleFootprintNavigation}
                    className="hover:cursor-pointer h-[70%] m-2 flex-1 flex items-center justify-center text-center sm:text-sm md:text-base bg-gradient-to-r from-purple-600 via-blue-900 to-pink-900 text-white rounded-xl py-2"
                >
                    Your Footprint
                </div>
                {!loading  && user? (
                    <div 
                        className="hover:cursor-pointer h-[70%] m-2 flex-1 flex items-center justify-center text-center sm:text-sm md:text-base py-2 text-white overflow-visible" 
                        onClick={handleLogout}
                    >
                        {user.email}
                        <span className="ml-2">
                            <FiLogOut />
                        </span>
                    </div>    
                ):(
                    <div 
                        onClick={handleClick}
                        className="hover:cursor-pointer h-[70%] m-2 flex-1 flex items-center justify-center sm:text-sm md:text-base bg-gradient-to-r from-purple-600 via-blue-900 to-pink-900 text-white rounded-xl py-2"
                    >
                        Join us
                    </div>

                )}

            </div>
        </div>


    )
}
export default Navbar;