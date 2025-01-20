import { authModalState } from '@/atoms/authModalAtom';
import Link from 'next/link';
import { auth } from '@/firebase/firebase';
import React, { useState } from 'react';
import { useSignInWithEmailAndPassword } from 'react-firebase-hooks/auth';
import { toast } from 'react-toastify';
import { useSetRecoilState } from 'recoil';


const SignIn:React.FC = () => {
    
    const setAuthModalstate = useSetRecoilState(authModalState);

    const [inputs,setInputs] = useState({email:" ",password:" "});

    const closeAuthModal =  function(){
        setAuthModalstate((prev) => ({...prev, isOpen: false}));
    }

    const [
        signInWithEmailAndPassword,
        loading
    ] = useSignInWithEmailAndPassword(auth);

    const handleInputChange =(e:React.ChangeEvent<HTMLInputElement>)=>{
        setInputs((prev)=>({...prev,[e.target.name]:e.target.value}));
    }

    const handleSubmitForm = async (e:React.FormEvent<HTMLFormElement>)=>{
        e.preventDefault();
        try {
            if(!inputs.email || !inputs.password){
                toast.error("Please fill all the fields", {position:"top-center", autoClose:3000, theme:"dark"});
            }

            const newUser = await signInWithEmailAndPassword(inputs.email,inputs.password);
            
            if(!newUser){
                throw new Error("Login Failed");
            }
            
            toast.success("User Logged in Successfully", {position:"top-center", autoClose:3000, theme:"dark"});
            closeAuthModal();
        } catch (error:any) {
            if(error?.message == "Login Failed") toast.error("Invalid Username or Password", {position:"top-center", autoClose:3000, theme:"dark"});
            else toast.error("An unexpected error occured!", {position:"top-center", autoClose:3000, theme:"dark"});
        }
    }

    const handleClick = (type:"register"|"forgotPassword") =>{
        setAuthModalstate((prev) => ({...prev, type: type}))
    }


    return (
        <form className='space-y-6 px-6 py-4' 
            onSubmit={handleSubmitForm}
        >
            <div className="text-xl font-semibold text-white flex items-center justify-center text-center">
                Sign in to EcoTrack
            </div>
            <div>
                <label htmlFor='email' className='text-sm font-medium block text-gray-300'>
                    Your Email
                </label>
                <input 
                    onChange={handleInputChange} 
                    type='email' 
                    name='email' 
                    id="email" 
                    className='
                        border-2 outline-none sm:text-sm rounded-lg focus:ring-blue-500
                        block w-full p-2.5 bg-gray-600 border-gray-500 placeholder-gray-400
                        text-white
                    ' 
                    placeholder='Your email Address'
                />
            </div>
            <div>
                <label htmlFor='password' className='text-sm font-medium block text-gray-300'>
                    Your Password
                </label>
                <input 
                    onChange={handleInputChange} 
                    type='password'
                    name='password' 
                    id="password" 
                    className='
                        border-2 outline-none sm:text-sm rounded-lg focus:ring-blue-500
                        block w-full p-2.5 bg-gray-600 border-gray-500 placeholder-gray-400
                        text-white
                    '  
                    placeholder='******'
                />
            </div>
            <button type='submit' className='w-1/2 text-white focus:ring-blue-300
            font-medium rounded-lg text-sm px-5 py-2.5 text-center bg-gradient-to-r from-blue-600 to-blue-600
            hover:from-blue-500 hover:to-blue-600 mx-auto block border-2 border-transparent hover:border-blue-800
            hover:shadow-[0_0_10px_rgba(255,0,0,0.8)] transition-all duration-300'>
                {loading?"Loading...":"Login"}
            </button>
            <div className='text-sm font-medium text-gray-300'>
                Forgot your Password?{" "}
                <Link href="#" className='text-blue-700 hover:underline'
                    onClick={()=>handleClick("forgotPassword")}
                >
                    Reset
                </Link>
            </div>
            <div className='text-sm font-medium text-gray-300'>
                Not Registered Yet?{" "}
                <Link href="#" className='text-blue-700 hover:underline'
                    onClick={()=>handleClick("register")}
                >
                    Create Account
                </Link>
            </div>
        </form>
    )
}
export default SignIn;