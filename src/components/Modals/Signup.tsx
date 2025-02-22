import { authModalState } from '@/atoms/authModalAtom';
import React, { useState } from 'react';
import { useSetRecoilState } from 'recoil';
import {useCreateUserWithEmailAndPassword} from 'react-firebase-hooks/auth'
import { auth, firestore } from '@/firebase/firebase';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { collection, doc, getDocs, query, setDoc, where } from 'firebase/firestore';


const Signup:React.FC = () => {
    
    const setAuthModalstate = useSetRecoilState(authModalState);
    const [inputs,setInputs] = useState({email:"", username:"", password:"", resetPassword:""});
    
    const [
        createUserWithEmailAndPassword,
        loading,
    ] = useCreateUserWithEmailAndPassword(auth);

    const handleClick = () =>{
        setAuthModalstate((prev) => ({...prev, type: "login"}))
    };

    
    const handleInputChange = (e:React.ChangeEvent<HTMLInputElement>) =>{
        setInputs((prev)=>({...prev,[e.target.name]:e.target.value}));
    };
    
    const handleRegister = async (e:React.FormEvent<HTMLFormElement>)=>{
        e.preventDefault();
        try {
            toast.loading("Registering User...", {position:"top-center", toastId:"signUpLoadingToast" ,autoClose:6000, theme:"dark"});
            if(!inputs.email || !inputs.username || !inputs.password){
                throw new Error("Please fill all the fields");
            }

            if(inputs.password.length<6){
                throw new Error("Password must contain at least 6 characters");
            }

            if(inputs.password!==inputs.resetPassword){
                throw new Error("Passwords dont match");   
            }

            const querySnapshot = await getDocs(
                query(
                    collection(firestore, "users"),
                    where("displayName", "==", inputs.username),
                )
            );
            
            if(querySnapshot?.docs?.length){
                throw new Error("This username already exists!")
            }

            console.log(inputs)
            const newUser = await createUserWithEmailAndPassword(inputs.email,inputs.password);

            console.log(newUser)
            if(!newUser){
                throw new Error("User Creation Failed!");
            }           

            const userData = {
                user_uid: newUser.user.uid,
                displayName: inputs.username,
                email: newUser.user.email,
                createdAt: Date.now(),
                updatedAt: Date.now(),
                groupId: null
            }
            
            await setDoc(doc(firestore,"users",newUser.user.uid), userData);
            handleClick();
            toast.dismiss("signUpLoadingToast");
            toast.success("User "+inputs.username+" registered successfully",{position:"top-center", toastId:"signUpSuccessToast" ,autoClose:6000, theme:"dark"})
        } catch (error:any) {
            toast.dismiss("signUpLoadingToast");
            toast.error(error.message, {position:"top-center", autoClose:3000, theme:"dark"});
        }
    }

    return (
        <form className='space-y-6 px-6 py-4' 
            onSubmit={handleRegister}
        >
            <div className="text-xl font-semibold text-white flex items-center justify-center text-center">
                Register to track your carbon footprint
            </div>
            <div>
                <label htmlFor='email' className='text-sm font-medium block text-gray-300'>
                    Email
                </label>
                <input 
                    name='email' 
                    type='email' 
                    id="email" 
                    className='
                    border-2 outline-none sm:text-sm rounded-lg focus:ring-blue-500
                    block w-full p-2.5 bg-gray-600 border-gray-500 placeholder-gray-400
                    text-white
                    ' 
                    placeholder='Your email Address'
                    onChange={handleInputChange} 
                />
            </div>
            <div>
                <label htmlFor='username' className='text-sm font-medium block text-gray-300'>
                    Username
                </label>
                <input 
                    onChange={handleInputChange} 
                    type='username' 
                    name='username' 
                    id="username" 
                    className='
                        border-2 outline-none sm:text-sm rounded-lg focus:ring-blue-500
                        block w-full p-2.5 bg-gray-600 border-gray-500 placeholder-gray-400
                        text-white
                    ' 
                    placeholder='Your Username'
                />
            </div>
            <div>
                <label htmlFor='password' className='text-sm font-medium block text-gray-300'>
                    Password
                </label>
                <input 
                    onChange={handleInputChange} 
                    type='password'
                    name='password' 
                    id="password" 
                    className='
                        border-2 outline-none sm:text-sm rounded-lg focus:ring-blue-500
                        block w-full p-2.5 bg-gray-600 border-gray-500 placeholder-gray-400
                        text-white items-center
                    '  
                    placeholder='******'
                />
            </div>
            <div>
                <label htmlFor='resetPassword' className='text-sm font-medium block text-gray-300'>
                    Re-Enter Password
                </label>
                <input 
                    onChange={handleInputChange} 
                    type='password'
                    name='resetPassword' 
                    id="resetPassword" 
                    className='
                        border-2 outline-none sm:text-sm rounded-lg focus:ring-blue-500
                        block w-full p-2.5 bg-gray-600 border-gray-500 placeholder-gray-400
                        text-white items-center
                    '  
                    placeholder='******'
                />
            </div>
            <button type='submit' className='w-1/2 text-white focus:ring-blue-300
            font-medium rounded-lg text-sm px-5 py-2.5 text-center bg-gradient-to-r from-blue-600 to-blue-600
            hover:from-blue-500 hover:to-blue-600 mx-auto block border-2 border-transparent hover:border-blue-800
            hover:shadow-[0_0_10px_rgba(255,0,0,0.8)] transition-all duration-300'>
                {loading? "Registering...":"Sign Up"}
            </button>
            <div className='text-sm font-medium text-gray-300'>
                Already have an account?{" "}
                <Link href="#" className='text-blue-700 hover:underline' onClick={handleClick}>
                    Sign In
                </Link>
            </div>
        </form>
    )
}
export default Signup;