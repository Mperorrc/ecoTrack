"use client"
import Link from 'next/link';
import React from 'react';
import { authModalState } from '@/atoms/authModalAtom';
import { useSetRecoilState } from 'recoil';

type NavbarProps = {
    
};

const Navbar:React.FC<NavbarProps> = () => {
    const setAuthModalstate = useSetRecoilState(authModalState);

    const handleClick = ()=>{
        setAuthModalstate((prev) => ({...prev, isOpen: true}));
    }
    return (
        <div className="flex justify-between items-center h-[8vh] px-6 md:px-12 bg-black overflow-x-auto ">
            <div className="basis-1/2 flex justify-center items-center font-extrabold sm:text-lg text-green-600  ">
                <div className="hover:cursor-pointer text-2xl tracking-wider">EcoTrack</div>
            </div>
            
            <div className="flex justify-center gap-x-4 basis-1/2 flex-1 items-center">
                <Link 
                    href={"/"} 
                    className="hover:cursor-pointer h-[70%] m-2 flex-1 flex items-center justify-center text-center sm:text-sm md:text-base bg-gradient-to-r from-purple-600 via-blue-900 to-pink-900 text-white rounded-xl py-2"
                >
                    Chatbot
                </Link>
                <Link 
                    href={"/"} 
                    className="hover:cursor-pointer h-[70%] m-2 flex-1 flex items-center justify-center text-center sm:text-sm md:text-base bg-gradient-to-r from-purple-600 via-blue-900 to-pink-900 text-white rounded-xl py-2"
                >
                    Add Travels
                </Link>
                <Link 
                    href={"/"} 
                    className="hover:cursor-pointer h-[70%] m-2 flex-1 flex items-center justify-center text-center sm:text-sm md:text-base bg-gradient-to-r from-purple-600 via-blue-900 to-pink-900 text-white rounded-xl py-2"
                >
                    Add Footprint
                </Link>
                <div 
                    onClick={handleClick}
                    className="hover:cursor-pointer h-[70%] m-2 flex-1 flex items-center justify-center text-center sm:text-sm md:text-base bg-gradient-to-r from-purple-600 via-blue-900 to-pink-900 text-white rounded-xl py-2"
                >
                    Join us
                </div>

            </div>
        </div>


    )
}
export default Navbar;