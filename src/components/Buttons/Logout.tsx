import { auth } from '@/firebase/firebase';
import React from 'react';
import { useSignOut } from 'react-firebase-hooks/auth';
import { FiLogOut } from 'react-icons/fi';
import { toast } from 'react-toastify';



const Logout:React.FC = () => {
    
    const [signOut] = useSignOut(auth);

    const handleLogout = async()=>{
        try {
            await signOut();
            toast.success("User Logged out", {position:"top-center", autoClose:3000, theme:"dark"});
        } catch (error:any) {
            toast.error(error.message, {position:"top-center", autoClose:3000, theme:"dark"});
        }
    }

    return <button 
        className="hover:cursor-pointer w-[30px] h-[70%] m-2 flex-1 flex items-center justify-center text-white rounded-xl py-2"
        onClick={handleLogout}
    >
        Logout &nbsp; <FiLogOut />
    </button>
}
export default Logout;