'use client';
import { auth } from '@/firebase/firebase';
import React, { useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { toast } from 'react-toastify';

type CommunitiesProps = {};

const Communities: React.FC<CommunitiesProps> = () => {
    const [formData, setFormData] = useState({
        eventName: '',
        eventDescription: '',
        eventAddress: '',
        city: '',
        dateTime: '',
    });
    const [user,loading] = useAuthState(auth);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
    
        const { eventName, eventDescription, eventAddress, city, dateTime } = formData;
    
        if (!eventName || !eventDescription || !eventAddress || !city || !dateTime) {
            toast.error('All fields must be filled', {position:"top-center", toastId:"signUpLoadingToast" ,autoClose:3000, theme:"dark"});
            return;
        }
    
        const eventDate = new Date(dateTime);
        if (eventDate <= new Date()) {
            toast.error('Event date must be in the future', {position:"top-center", toastId:"signUpLoadingToast" ,autoClose:3000, theme:"dark"});
            return;
        }

        try {
            if(!user?.uid){
                toast.error('User Logged Out! Please log in again', {position:"top-center", toastId:"signUpLoadingToast" ,autoClose:3000, theme:"dark"});
                return;
            }
            
            // const eventData = {
            //     uid: user.uid,
            //     displayName: ,
            //     email: newUser.user.email,
            //     createdAt: Date.now(),
            //     updatedAt: Date.now(),
            //     groupId: null
            // }
            // console.log("4")
            
            // await setDoc(doc(firestore,"users",newUser.user.uid), userData);
            // console.log("5")
            // handleClick();
            // console.log("8")
            // toast.dismiss("signUpLoadingToast");
            // toast.success("User "+inputs.username+" registered successfully",{position:"top-center", toastId:"signUpSuccessToast" ,autoClose:6000, theme:"dark"})
        } catch (error:any) {
            toast.dismiss("signUpLoadingToast");
            toast.error(error.message, {position:"top-center", autoClose:3000, theme:"dark"});
            console.log("6")
            console.log(error)
        }


    
        console.log('Form submitted successfully');
        console.log(formData);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    }

    

    return (
        <div className="text-white h-[92vh] overflow-y-auto font-bold scrollbar-thin scrollbar-thumb-rounded-lg scrollbar-thumb-scroll-thumb scrollbar-track-scroll-track">
            <div className="w-[80%] ml-[10%] mt-[10px] flex flex-col mb-[30px] bg-gradient-to-b from-gray-900 to-gray-800 rounded-lg p-6 shadow-md">
                <div className="flex items-center text-2xl font-sans font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-green-600 to-green-300 w-full mb-6">
                    Create a new Event
                </div>
                <div className="w-full flex flex-col gap-4">
                    <form onSubmit={handleSubmit} className='w-full flex flex-col space-y-4'>
                        <div>
                            <label htmlFor="eventName" className="block text-lg mb-2">Event Name</label>
                            <input
                                type="text"
                                id="eventName"
                                name="eventName"
                                placeholder="Enter event name"
                                value={formData.eventName}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label htmlFor="eventDescription" className="block text-lg mb-2">Event Description</label>
                            <textarea
                                id="eventDescription"
                                name="eventDescription"
                                placeholder="Enter event description"
                                value={formData.eventDescription}
                                onChange={handleChange}
                                rows={4}
                                className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label htmlFor="eventAddress" className="block text-lg mb-2">Event Address</label>
                            <input
                                type="text"
                                id="eventAddress"
                                name="eventAddress"
                                placeholder="Enter event address"
                                value={formData.eventAddress}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label htmlFor="city" className="block text-lg mb-2">City</label>
                            <input
                                type="text"
                                id="city"
                                name="city"
                                placeholder="Enter city"
                                value={formData.city}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div className='w-full flex flex-row'>
                            <div className="text-lg mb-2 flex items-center mt-[5px]">Date and Time</div>
                            <input
                                type="datetime-local"
                                id="dateTime"
                                name="dateTime"
                                value={formData.dateTime}
                                onChange={handleChange}
                                className="ml-[20px] px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div className="flex justify-center mt-4">
                            <button
                                type="submit"
                                className="px-6 py-2 bg-blue-500 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all"
                            >
                                Submit
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Communities;
