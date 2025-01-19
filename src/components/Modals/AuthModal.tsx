import React, { useEffect } from 'react';
import { IoClose } from 'react-icons/io5';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { authModalState } from '@/atoms/authModalAtom';
import Signup from './Signup';
import SignIn from './SignIn';
import ResetPassword from './ResetPassword';


const AuthModal:React.FC = () => {
    
    const authModal = useRecoilValue(authModalState);
    const closeModal = useCloseModal();
    console.log( "AUTH: " + authModal?.type)
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
                    <div className='bg-gradient-to-b from-pink-900 to-slate-900 ease-in-out rounded-lg shadow relative w-full
                        mx-6'
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
                        {authModal.type === "login" && <SignIn />}
                        {authModal.type === "register" && <Signup />}
                        {authModal.type === "forgotPassword" && <ResetPassword />}
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