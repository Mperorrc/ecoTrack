import { auth } from '@/firebase/firebase';
import React, { useEffect, useState } from 'react';
import { useSendPasswordResetEmail } from 'react-firebase-hooks/auth';
import { toast } from 'react-toastify';


const ResetPassword:React.FC = () => {
	const [email,setEmail] = useState("");
	const [sendPasswordResetEmail,_, error] = useSendPasswordResetEmail(
		auth
	);


	const handleReset = async (e:React.FormEvent<HTMLFormElement>)=>{
		e.preventDefault();
		try {
			const success = await sendPasswordResetEmail(email);
			if(success){
				toast.success("Email sent!", {position:"top-center", autoClose:3000, theme:"dark"});
			}
            else{
                toast.error("Couldn't send Email! Please try later", {position:"top-center", autoClose:3000, theme:"dark"});
            }
		} catch (error:any) {
			toast.error(error.message, {position:"top-center", autoClose:3000, theme:"dark"});
		}
	}

	useEffect(()=>{
		if(error) toast.error(error.message, {position:"top-center", autoClose:3000, theme:"dark"});
	},[error])

    return (
		<form className='space-y-6 px-6 lg:px-8 pb-4 sm:pb-6 xl:pb-8' 
            onSubmit={handleReset}
        >
            <div className="text-xl font-semibold text-white flex items-center justify-center text-center">
                Reset Password
            </div>
			<p className='text-sm text-white '>
				Forgotten your password? Enter your e-mail address below, and we&apos;ll send you an e-mail allowing you
				to reset it.
			</p>
			<div>
				<label htmlFor='email' className='text-sm font-medium block mb-2 text-gray-300'>
					Your email
				</label>
				<input
					type='email'
					name='email'
					id='email'
					className='border-2 outline-none sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-gray-600 border-gray-500 placeholder-gray-400 text-white'
					placeholder='Your Email Address'
					onChange={(e)=>setEmail(e.target.value)}
				/>
			</div>

			<button
				type='submit'
				className='w-1/2 text-white focus:ring-blue-300
                font-medium rounded-lg text-sm px-5 py-2.5 text-center bg-gradient-to-r from-blue-600 to-blue-600
                hover:from-blue-500 hover:to-blue-600 mx-auto block border-2 border-transparent hover:border-blue-800
                hover:shadow-[0_0_10px_rgba(255,0,0,0.8)] transition-all duration-300'
			>
				Reset Password
			</button>
		</form>
	);
}
export default ResetPassword;