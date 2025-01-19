"use client";
import React, { useState, useEffect } from 'react';
import { IoClose } from 'react-icons/io5';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { authModalState } from '@/atoms/authModalAtom';


const AuthModal:React.FC = () => {
    const [isMounted, setIsMounted] = useState(false);

    // Always call hooks in the same order, even before the component is mounted
    const authModal = useRecoilValue(authModalState); // Use it unconditionally
    const closeModal = useCloseModal();

    useEffect(() => {
        setIsMounted(true); // Mark component as mounted
    }, []);

    // Don't render the component during SSR, only after mounting
    if (!isMounted) return null;
    return(
        <>
            <div className='absolute top-0 left-0 w-full h-full flex items-center
                justify-center bg-black bg-opacity-60'
                onClick={closeModal}
            ></div>
            <div className='w-full sm:w-[450px] absolute top-[50%] left-[50%]
                translate-x-[-50%] translate-y-[-50%] flex justify-center items-center'
            >
                <div className='relative w-full h-full mx-auto flex items-center
                    justify-center'
                >
                    <div className='bg-white rounded-lg shadow relative w-full
                        bg-gradient-to-b from-brand-orange to-slate-900 mx-6'
                    >
                        <div className='flex justify-end p-2'>
                            <button
                                type='button'
                                className='bg-transparent rounded-lg text-sm p-1.5
                                ml-auto inline-flex items-center hover:bg-red-600
                                hover:text-black text-white hover:text-bo'
                                onClick={closeModal}
                            >
                                <IoClose className='h-5 w-5'/>
                            </button>
                        </div>
                        {authModal?.type === "login" && <div>HI</div>}
                        {authModal?.type === "register" && <div>HI</div>}
                        {authModal?.type === "forgotPassword" && <div>HI</div>}
                    </div>
                </div>
            </div>
        </>
    )
}
export default AuthModal;

function useCloseModal(){
    const setAuthModalState = useSetRecoilState(authModalState);

    const closeModal = () =>{
        setAuthModalState((prev) => ({...prev,type:"login", isOpen:false}))
    }

    useEffect(()=>{

        const handleEsc = (e:KeyboardEvent)=>{
            if(e.key === "Escape") closeModal();
        };

        window.addEventListener("keydown",(e)=>handleEsc(e));
        return ()=> removeEventListener("keydown",handleEsc);
    },[]);

    return closeModal;
}