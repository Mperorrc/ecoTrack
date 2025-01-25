'use client';
import { auth, firestore } from '@/firebase/firebase';
import { addDoc, collection, doc, getDocs, limit, orderBy, query, updateDoc, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { FaArrowDown, FaArrowUp } from 'react-icons/fa';
import { toast } from 'react-toastify';

type CommunitiesProps = {};

const Communities: React.FC<CommunitiesProps> = () => {
    const [formData, setFormData] = useState({
        eventName: '',
        eventDescription: '',
        eventAddress: '',
        city: '',
        startDateTime: '',
        endDateTime: '',
    });
    const [filters, setFilters] = useState({ startDate: '', endDate: '', status: '' });
    // const [filteredEvents, setFilteredEvents] = useState(events);

    const [showModal, setShowModal] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState<{
        status:string,
        eventId:string,
    }>({
        status:"",
        eventId:""
    });

    const openModal = () => {
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
    };

    const [user,loading] = useAuthState(auth);
    const [topContributors,setTopContributors] = useState<{
        id:string,
        displayName:string,
        karma:number
    }[]>([]);
    const [events,setEvents] = useState<any[]>([]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
    
        const { eventName, eventDescription, eventAddress, city, startDateTime, endDateTime } = formData;

        if (!eventName || !eventDescription || !eventAddress || !city || !startDateTime || !endDateTime) {
            toast.error('All fields must be filled', {
                position: "top-center",
                toastId: "signUpLoadingToast",
                autoClose: 3000,
                theme: "dark"
            });
            return;
        }

        const startEventDate = new Date(startDateTime);
        const endEventDate = new Date(endDateTime);

        if (isNaN(startEventDate.getTime()) || isNaN(endEventDate.getTime())) {
            toast.error('Invalid date format. Please enter a valid date and time.', {
                position: "top-center",
                toastId: "signUpLoadingToast",
                autoClose: 3000,
                theme: "dark"
            });
            return;
        }

        // Check if the event start time is in the future
        if (startEventDate <= new Date()) {
            toast.error('Event start date must be in the future', {
                position: "top-center",
                toastId: "signUpLoadingToast",
                autoClose: 3000,
                theme: "dark"
            });
            return;
        }

        if (endEventDate <= startEventDate) {
            toast.error('End date must be after the start date', {
                position: "top-center",
                toastId: "signUpLoadingToast",
                autoClose: 3000,
                theme: "dark"
            });
            return;
        }

        const timeDifference = endEventDate.getTime() - startEventDate.getTime();

        const minDifference = 10 * 60 * 1000;
        const maxDifference = 10 * 24 * 60 * 60 * 1000;

        if (timeDifference < minDifference) {
            toast.error('The event duration must be at least 10 minutes', {
                position: "top-center",
                toastId: "signUpLoadingToast",
                autoClose: 3000,
                theme: "dark"
            });
            return;
        }

        if (timeDifference > maxDifference) {
            toast.error('The event duration cannot exceed 10 days', {
                position: "top-center",
                toastId: "signUpLoadingToast",
                autoClose: 3000,
                theme: "dark"
            });
            return;
        }


        try {
            if(!user?.uid){
                toast.error('User Logged Out! Please log in again', {position:"top-center", toastId:"signUpLoadingToast" ,autoClose:3000, theme:"dark"});
                return;
            }
            console.log(user.uid);
            const querySnapshot = await getDocs(
                query(
                    collection(firestore, "users"),
                    where("user_uid", "==", user.uid)
                )
            );
            
            if (!querySnapshot?.docs?.length) {
                toast.error('We ran into an error. Please try again later', {
                    position: "top-center",
                    toastId: "signUpLoadingToast",
                    autoClose: 3000,
                    theme: "dark"
                });
                return;
            }
            
            const userData = querySnapshot.docs[0].data();
            
            const displayName = userData.displayName;
            
            if (!displayName) {
                toast.error('Display name not found. Please update your profile.', {
                    position: "top-center",
                    toastId: "signUpLoadingToast",
                    autoClose: 3000,
                    theme: "dark"
                });
                return;
            }
            
            const eventData = {
                organizer_displayName: displayName,
                eventName: eventName,
                eventAddress: eventAddress,
                eventDescription: eventDescription,
                city: city,
                startTime: startDateTime,
                endTime: endDateTime,
                user_uid: user.uid,
                participants:1,
                upvotes:0,
                downvotes:0,
                votes:[],
                insertedAt: Date.now(),
            }

            await addDoc(collection(firestore, "EVENT_DATA"), eventData);
            
            toast.success("Event scheduled successfully",{position:"top-center", toastId:"signUpSuccessToast" ,autoClose:3000, theme:"dark"})
        } catch (error:any) {
            toast.error("Event couldn't be scheduled. Please try again later!", {position:"top-center", autoClose:3000, theme:"dark"});
            console.log("6")
            console.log(error)
        }
    };

    // const handleFilterChange = (key, value) => {
    //     setFilters((prev) => ({ ...prev, [key]: value }));
    // };

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>)=>{
        const { name, value } = e.target;
        setFilters({
            ...filters,
            [name]: value,
        });
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const applyFilters = () => {
        // let filtered = events;
    
        // if (filters.startDate) {
        //     filtered = filtered.filter(event => new Date(event.startTime) >= new Date(filters.startDate));
        // }
        // if (filters.endDate) {
        //     filtered = filtered.filter(event => new Date(event.endTime) <= new Date(filters.endDate));
        // }
        // if (filters.status) {
        //     filtered = filtered.filter(event => event.status === filters.status);
        // }
    
        // setFilteredEvents(filtered);
    };

    const fetchTopContributors = async () => {
        try {
            const usersRef = collection(firestore, "users");
            const q = query(usersRef, orderBy("karma", "desc"), limit(5));
            const querySnapshot = await getDocs(q);
    
            const contributors = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                displayName: doc.data().displayName,
                karma: doc.data().karma,
            }));
    
            setTopContributors(contributors);
        } catch (error) {
            console.error("Error fetching top contributors:", error);
        }
    };

    const fetchEvents = async () => {
        try {
            const eventsRef = collection(firestore, "EVENT_DATA");
            const q = query(eventsRef, where("endTime",">",new Date().toISOString()),where("status","!=","Cancelled")  ,limit(30));
            const querySnapshot = await getDocs(q);

            const events = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                eventName: doc.data().eventName,
                eventAddress: doc.data().eventAddress,
                eventDescription: doc.data().eventDescription,
                city:doc.data().city,
                organizer_displayName: doc.data().organizer_displayName,
                startTime:doc.data().startTime,
                endTime: doc.data().endTime,
                participants:doc.data().participants,
                upvotes:doc.data().upvotes,
                downvotes:doc.data().downvotes,
                votes: doc.data().votes,
                status:doc.data().status,
                user_uid: doc.data().user_uid,
                enrolled_users: doc.data().enrolled_users,
            }));
            
            const sortedEvents = events.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
            console.log(sortedEvents);

            setEvents(sortedEvents);
        } catch (error) {
            console.error('Error fetching events:', error);
        }
    };

    const handleVote = async (votes: Array<{ user_uid: string, vote: number }>, eventId: string, user_uid: string|undefined, voteAction: "upvote" | "downvote", currentUpvotes: number, currentDownvotes: number) => {
        if(!user_uid) return;
        const updatedVotes = [...votes]; 
        const userVoteIndex = updatedVotes.findIndex((vote) => vote.user_uid === user_uid);

        let newUpvotes = currentUpvotes;
        let newDownvotes = currentDownvotes;
        if (userVoteIndex === -1) {
            // Case 1: User hasn't voted yet.
            if (voteAction === "upvote") {
                updatedVotes.push({ user_uid, vote: 1 });
                newUpvotes += 1;
            } 
            else if (voteAction === "downvote") {
                updatedVotes.push({ user_uid, vote: 0 });
                newDownvotes += 1;
            }
        } else {
            // Case 2: User has already voted.
            const currentVote = updatedVotes[userVoteIndex].vote;

            if (voteAction === "upvote") {
                if (currentVote === 1) {
                    // User already upvoted, so remove the upvote.
                    updatedVotes.splice(userVoteIndex, 1);
                    newUpvotes -= 1;
                } 
                else if (currentVote === 0) {
                    // User downvoted before, so switch to upvote.
                    updatedVotes[userVoteIndex].vote = 1;
                    newUpvotes += 1;
                    newDownvotes -= 1;
                }
            } 
            else if (voteAction === "downvote") {
                if (currentVote === 0) {
                    // User already downvoted, so remove the downvote.
                    updatedVotes.splice(userVoteIndex, 1);
                    newDownvotes -= 1;
                } 
                else if (currentVote === 1) {
                    // User upvoted before, so switch to downvote.
                    updatedVotes[userVoteIndex].vote = 0;
                    newDownvotes += 1;
                    newUpvotes -= 1;
                }
            }
        }

        try {
            const eventDocRef = doc(firestore, "EVENT_DATA", eventId);
            await updateDoc(eventDocRef, {
                votes: updatedVotes, 
                upvotes: newUpvotes, 
                downvotes: newDownvotes,
            });  
            setEvents((prevEvents) =>
                prevEvents.map((event) =>
                  event.id === eventId
                    ? {
                        ...event,
                        votes: updatedVotes,
                        upvotes: newUpvotes,
                        downvotes: newDownvotes,
                      }
                    : event
                )
            );
            
            console.log("Successfully updated votes and counts in Firestore!");
        } catch (error) {
            console.error("Error updating votes and counts in Firestore:", error);
        }

        return updatedVotes;  // Return the updated votes array to update the local state
    };

    const handleEnroll = async function (enrolled_users: Array<string>, eventId: string, user_uid: string, participants_cnt:number) {
        // If user_uid is null or undefined, return early
        if (!user?.uid) return;
      
        // Check if user_uid is the same as the user.uid and return early if true
        if (user_uid === user?.uid) return;
      
        // Check if user_uid exists in the enrolled_users array
        const userIndex = enrolled_users.indexOf(user.uid);

        console.log(participants_cnt);
        if (userIndex === -1) {
            enrolled_users.push(user.uid);
            participants_cnt+=1;
        } 
        else {
            enrolled_users.splice(userIndex, 1);
            participants_cnt-=1;
        }
        console.log(participants_cnt);
        try {
            const eventDocRef = doc(firestore, "EVENT_DATA", eventId);
            await updateDoc(eventDocRef, {
                enrolled_users: enrolled_users,
                participants: participants_cnt,
            });
            setEvents((prevEvents) =>
                prevEvents.map((event) =>
                event.id === eventId
                    ? {
                        ...event,
                        enrolled_users: enrolled_users,
                        participants: participants_cnt,
                    }
                    : event
                )
            );  
      
            console.log("Successfully updated enrolled users in Firestore!");
        } catch (error) {
            console.error("Error updating enrolled users in Firestore:", error);
        }
      
        return enrolled_users; // Return the updated enrolled_users array
    };

    const handleStatusChange = function(eventId: string, status:string){
        setSelectedStatus({
            status:status,
            eventId:eventId
        });
        openModal();
    }

    const confirmStatusChange = async() => {
        const event = events.find((e) => e.id === selectedStatus.eventId);
    
        if (!event) {
            setShowModal(false);
            console.error("Event not found.");
            return;
        }
    
        if (event.user_uid !== user?.uid) {
            setShowModal(false);
            console.error("You are not authorized to change the status of this event.");
            return;
        }
    
        if (selectedStatus.status === event.status) {
            setShowModal(false);
            console.log("The status is already set to the selected value.");
            return;
        }
    
        if (selectedStatus.status == "Completed" || selectedStatus.status == "Running") {
            const currentDate = new Date();
            const eventStartDate = new Date(event.startTime);
            console.log(eventStartDate)
            if (eventStartDate > currentDate) {
                setShowModal(false);
                toast.error(`Event can't be set to ${selectedStatus.status} beffore the event start time`,{position:"top-center", autoClose:3000, theme:"dark"})
                console.error("Cannot mark the event as 'Completed' because its start date is in the future.");
                return;
            }
        }

        try {
            const eventDocRef = doc(firestore, "EVENT_DATA", selectedStatus.eventId);
            await updateDoc(eventDocRef, {
                status: selectedStatus.status,
            });
            setEvents((prevEvents) =>
                prevEvents.map((event) =>
                event.id === selectedStatus.eventId
                    ? {
                        ...event,
                        status: selectedStatus.status,
                    }
                    : event
                )
            );  
      
            console.log("Successfully updated enrolled users in Firestore!");
            setShowModal(false);
        } catch (error) {
            setShowModal(false);
            console.error("Error updating enrolled users in Firestore:", error);
        }
    };
    

    useEffect(() => {
      fetchTopContributors();
      fetchEvents();
    }, [user?.uid]);
    

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
                            <div className="text-lg mb-2 flex items-center mt-[5px]">Start Time</div>
                            <input
                                type="datetime-local"
                                id="dateTime"
                                name="startDateTime"
                                value={formData.startDateTime}
                                onChange={handleChange}
                                className="ml-[20px] px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <div className="text-lg px-4 mb-2 ml-4 flex items-center mt-[5px]">End Time</div>
                            <input
                                type="datetime-local"
                                id="dateTime"
                                name="endDateTime"
                                value={formData.endDateTime}
                                onChange={handleChange}
                                className="ml-[20px] px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div className="flex items-center mt-4">
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
            <div className='w-full flex flex-row mb-[40px]'>
                <div className="w-[67.5%] ml-[2.5%]  flex flex-col">
                    <div className='flex p-6 items-center justify-center text-2xl font-sans font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-green-600 to-green-300 w-full mb-6'>
                        List of Events
                    </div>
                    <div className="bg-gray-700 p-4 rounded-lg shadow-md mb-4 text-white w-[95%] ml-[2.5%]">
                        <h2 className="text-lg font-bold mb-4 w-full">Filters</h2>
                        <form className="flex flex-wrap gap-4 items-center">
                            <div className="flex flex-col">
                                <label htmlFor="startDate" className="text-sm text-gray-300">Start Date</label>
                                <input
                                    type="datetime-local"
                                    id="filterStartDate"
                                    name='filterStartDate'
                                    value={filters.startDate}
                                    className="bg-gray-800 text-white p-2 rounded"
                                    onChange={handleFilterChange}
                                />
                            </div>
                            
                            <div className="flex flex-col">
                                <label htmlFor="endDate" className="text-sm text-gray-300">End Date</label>
                                <input
                                    type="datetime-local"
                                    name="filterEndDate"
                                    id="filterEndDate"
                                    value={filters.endDate}
                                    className="bg-gray-800 text-white p-2 rounded"
                                    onChange={handleFilterChange}
                                />
                            </div>
                            
                            <div className="flex flex-col">
                                <label htmlFor="status" className="text-sm text-gray-300">Status</label>
                                <select
                                    id="status"
                                    name="filterStatus"
                                    value={filters.status}
                                    className="bg-gray-800 text-white p-2 rounded"
                                    onChange={handleFilterChange}
                                >
                                    <option value="">All</option>
                                    <option value="planned">Planned</option>
                                    <option value="inProgress">In Progress</option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>
                            <div className='w-full flex items-center'>
                                <button
                                    type="button"
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 mx-2 py-2 rounded flex items-center"
                                    onClick={applyFilters}
                                >
                                    Apply
                                </button>
                                <button
                                    type="button"
                                    className="bg-blue-600 hover:bg-blue-700 text-white mx-4 px-4 py-2 rounded flex items-center"
                                    onClick={applyFilters}
                                >
                                    Clear
                                </button>
                            </div>
                        </form>
                    </div>
                    
                    <div className='h-[100vh] w-full flex flex-col overflow-y-auto font-bold scrollbar-thin scrollbar-thumb-rounded-lg scrollbar-thumb-scroll-thumb scrollbar-track-scroll-track rounded-lg p-6 shadow-md'>
                        
                        {events.map((event, index) => (
                            <div
                                key={event.id} 
                                className="bg-gray-800 p-6 rounded-lg shadow-md mb-6 text-white flex flex-col"
                            >
                                <div className='w-full flex flex-row items-center'>
                                    <div className='w-[65%] text-3xl flex items-center font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-red-700'>
                                        {event.eventName}
                                    </div>
                                    <div className='flex flex-col text-xs items-center'>
                                        <div className='w-full text-yellow-600 flex items-center' >
                                             {new Date(event.startTime).toLocaleString()} - {new Date(event.endTime).toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                                <div className='w-full flex flex-row'>
                                    <div className='w-[65%] font-bold text-sm  text-blue-300 py-2 flex items-center'>
                                        Event hosted by: {event.organizer_displayName}
                                    </div>
                                    <div className=' text-green-400 border bg-gradient-to-br from-blue-900 to-black p-2' >
                                        Status:
                                        {event.user_uid === user?.uid ? (
                                            <select
                                                value={event.status}  // Set the default value to event.status
                                                onChange={(e) => handleStatusChange( event.id,e.target.value)}  // handleStatusChange is a function you can define to update the status in your Firestore
                                                className=" px-1 bg-transparent" 
                                                >
                                                <option value="Upcoming">Upcoming</option>
                                                <option value="Running">Running</option>
                                                <option value="Cancelled">Cancelled</option>
                                                <option value="Completed">Completed</option>
                                            </select>
                                        ) : (
                                            <div className="text-green-400">{event.status}</div>
                                        )}
                                        {showModal && (
                                            <div className="modal fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                                            <div className="modal-content bg-gray-600 p-6 rounded-lg shadow-lg">
                                                <h3 className="text-xl text-white font-bold mb-4">Are you sure?</h3>
                                                <p className="mb-4 text-gray-100 text-bold">
                                                You are about to change the status to <strong className='text-yellow-500'>{selectedStatus.status}</strong>.
                                                This action is irreversible.
                                                </p>
                                                <div className="flex justify-end space-x-4">
                                                {/* Cancel button */}
                                                <button
                                                    className=" text-white px-4 py-2 bg-red-600 rounded-md"
                                                    onClick={closeModal}
                                                >
                                                    Cancel
                                                </button>
                                                {/* Yes button */}
                                                <button
                                                    className="bg-green-600 text-white px-4 py-2 rounded-md"
                                                    onClick={confirmStatusChange}
                                                >
                                                    Yes
                                                </button>
                                                </div>
                                            </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="w-full py-4">
                                    <p className="text-sm text-gray-400">
                                        <strong>Address:</strong> {event.eventAddress}
                                    </p>
                                </div>
                                <div className="w-full py-4">
                                    <p className="text-sm text-gray-400">
                                        <strong>City:</strong> {event.city}
                                    </p>
                                </div>
                                <div className="w-full py-4">
                                    <p className="text-sm text-gray-400">
                                        <strong>Description:</strong> {event.eventDescription}
                                    </p>
                                </div>
                                
                                <div className="flex items-center flex-row justify-end mt-4 w-full ">
                                    {
                                        user?.uid !== event.user_uid ? (
                                            <button
                                                type="button"
                                                className={`${
                                                    event.enrolled_users.includes(user?.uid) 
                                                        ? 'bg-green-600 hover:bg-green-700'  // If the user is enrolled, show green
                                                        : 'bg-blue-600 hover:bg-blue-700'    // Otherwise, show blue
                                                } text-white mx-4 px-4 py-2 rounded flex items-center`}
                                                onClick={() => handleEnroll(event.enrolled_users, event.id, event.user_uid,event.participants)}
                                            >
                                                {
                                                    event.enrolled_users.includes(user?.uid) ? 'Enrolled' : 'Enroll'  // Show "Enrolled" if the user is in the enrolled_users array
                                                }
                                            </button>
                                        ):(
                                            <button
                                                type="button"
                                                className={'bg-green-600 hover:bg-green-700 text-white mx-4 px-4 py-2 rounded flex items-center'}
                                            >
                                                Organizer 
                                            </button>
                                        )
                                    }
                                    <div className="text-sm  text-gray-400 px-4">
                                        <strong>Participants:</strong> {event.participants}
                                    </div>
                                    <div className="flex flex-row items-center space-x-2 px-4">
                                        <FaArrowUp className="text-green-500 cursor-pointer" 
                                            onClick={() => handleVote(event.votes, event.id, user?.uid, "upvote", event.upvotes, event.downvotes)}
                                        />
                                        <span className="text-sm">{event.upvotes}</span>
                                    </div>
                                    <div className="flex flex-row items-center space-x-2 px-4">
                                        <FaArrowDown className="text-red-500 cursor-pointer" 
                                            onClick={() => handleVote(event.votes, event.id, user?.uid, "downvote", event.upvotes, event.downvotes)}
                                        />
                                        <span className="text-sm">{event.downvotes}</span>
                                    </div>
                                </div>
                                
                            </div>
                        ))}

                    </div>
                </div>
                <div className="w-[27.25%] ml-[1.25%] mr-[2.5%] flex flex-col h-4/5 text-white overflow-y-auto font-bold scrollbar-thin scrollbar-thumb-rounded-lg scrollbar-thumb-scroll-thumb scrollbar-track-scroll-track bg-gradient-to-b from-gray-900 to-gray-800 rounded-lg p-6 shadow-md">
                    <div className="flex items-center justify-center text-2xl font-sans font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-green-600 to-green-300 w-full mb-6">
                        Top Contributors
                    </div>
                    {topContributors.map((contributor, index) => (
                        <div
                            key={contributor.id}
                            className="bg-gray-700 p-4 rounded-lg shadow-md mb-2"
                        >
                            <p className="text-lg">
                                {index + 1}. {contributor.displayName}
                            </p>
                            <p className="text-sm text-gray-400">
                                Karma: {contributor.karma}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Communities;
