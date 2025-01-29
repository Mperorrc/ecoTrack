"use client"

import computeCarbonFootprint from '@/components/ComputeCarbonFootprint/computeCarbonFootprint';
import GoogleMaps from '@/components/Maps/googleMaps';
import { auth, firestore } from '@/firebase/firebase';
import { addDoc, collection, deleteDoc, doc, getDocs, orderBy, query, updateDoc, where } from 'firebase/firestore';
import React, { useEffect, useMemo, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { toast } from 'react-toastify';


type pageProps = {
    
};

type FootprintDetails = {
    month: string;
    year: number;
    electricityUnits: number;
    renwableElectricityPercentage: number;
    electricitysplit: number;
    lpg: number;
    naturalGas: number;
    cookingOil: number;
    fuelSplit: number;
    carDistance: number;
    carFuelType: "Petrol" | "Diesel" | "CNG" | "LPG" | "Electricity";
    carPoolPercentage: number;
    carpoolSplit: number;
    bikeDistance: number;
    bikeFuelType: "Petrol" | "Diesel" | "CNG" | "LPG" | "Electricity";
    bikePoolPercentage: number;
    bikepoolSplit: number;
    busDistance: number;
    trainDistance: number;
    autoDistance: number;
    autoSplit: number;
    airTravelDistance: number;
    airMode: "Economy" | "Premium Economy" | "Business" | "First";
};

const page:React.FC<pageProps> = () => {
    
    const [newFootprintDetails, setNewFootprintDetails] = useState<FootprintDetails>({
        month: "January",
        year: 2000,
        electricityUnits: 0,
        renwableElectricityPercentage: 0,
        electricitysplit:1,
        lpg: 0,
        naturalGas:0,
        cookingOil:0,
        fuelSplit:1,
        carDistance:0,
        carFuelType:"Petrol",
        carPoolPercentage:0,
        carpoolSplit:1,  
        bikeDistance:0,
        bikeFuelType:"Petrol",
        bikePoolPercentage:0,
        bikepoolSplit:1,
        busDistance:0,
        trainDistance:0,
        autoDistance:0,
        autoSplit:1,  
        airTravelDistance:0,
        airMode:"Economy",
    });

    const [loadDataprocessing,setLoadDataProcessing] = useState(false);
    const [calculateDataprocessing,setCalculateDataProcessing] = useState(false);
    const [saveDataprocessing,setSaveDataProcessing] = useState(false);
   
    const [location,setLocation] = useState<{
        start:string,
        end:string,
        start_lat:number,
        start_lng:number,
        end_lat:number,
        end_lng:number
    }>({
        start:'',
        end:'',
        start_lat:0,
        start_lng:0,
        end_lat:0,
        end_lng:0
    });
    const [locationToUpdate,setLocationToUpdate] = useState<string>('');
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    const handleLocationSelect = (address: string, lat: number, lng: number) => {
        if (locationToUpdate === "startLoc") {
          setLocation((prev) => ({ ...prev, start: address, start_lat:lat, start_lng:lng }));
        } else if (locationToUpdate === "endLoc") {
          setLocation((prev) => ({ ...prev, end: address, end_lat:lat, end_lng:lng }));
        }
        closeModal();
    };

    const [selectedMode, setSelectedMode] = useState<string>("Car");

    // State for Frequency checkboxes
    const [selectedDays, setSelectedDays] = useState<string[]>([]);

    // Handler for Mode dropdown
    const handleModeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedMode(event.target.value);
    };

    // Handler for Frequency checkboxes
    const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = event.target;
        if (checked) {
        // Add the day to selectedDays
        setSelectedDays((prev) => [...prev, name]);
        } else {
        // Remove the day from selectedDays
        setSelectedDays((prev) => prev.filter((day) => day !== name));
        }
    };

    const [rideStartTime, setRideStartTime] = useState<string>("");

    // Handler for when the input value changes
    const handleTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRideStartTime(event.target.value);
    };


    const [user,loading] = useAuthState(auth);
    const [userRides,setUserRides] = useState<{
        id: string,
        start_address: string,
        end_address:string,
        mode: string,
        rideDays:string[],
        start_time: string,
        status: string
    }[]>([]);

    const fetchRides = async()=>{
        if(!user?.uid){
            return;
        }
        try {
            const querySnapshot = await getDocs(
                query(
                    collection(firestore, "SCHEDULED_RIDE_DATA"),
                    where("user_uid", "==", user.uid),
                    orderBy("createdAt", "desc")
                )
            );
            console.log("Entered");

            if (querySnapshot?.docs?.length) {

                const rides = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    start_address: doc.data().start_address,
                    end_address: doc.data().end_address,
                    mode: doc.data().mode,
                    rideDays:doc.data().rideDays,
                    start_time: doc.data().start_time,
                    status: doc.data().status,
                })).filter(ride => ride.status !== "Single" && ride.status !== "deleted");
                console.log(rides);
                setUserRides(rides);
            }
        } catch (error:any) {
            console.log(error)
        }
        
    }

    useEffect(()=>{
        fetchRides();
    },[user?.uid])
    
    const handleCalculate = async function(){
        if(loadDataprocessing || saveDataprocessing || calculateDataprocessing) return;
        setCalculateDataProcessing(true);
        const {totalValue} = computeCarbonFootprint(
            newFootprintDetails
        );
        
        toast.dismiss();
        toast.success(`Carbon footprint Output: ${totalValue}kgCO2`, { position: "top-center", toastId: "signUpSuccessToast", autoClose: 4000, theme: "dark" });
        setCalculateDataProcessing(false);
    }

    const handleLoadData = async function(){
        if(loadDataprocessing || saveDataprocessing || calculateDataprocessing) return;
        toast.dismiss();
        if(!user?.uid){
            toast.error("User Logged Out! Please log in again", {position:"top-center", toastId:"signUpLoadingToast" ,autoClose:2000, theme:"dark"});
            return;
        }
        setLoadDataProcessing(true);
        try {
            console.log(newFootprintDetails);
            const querySnapshot = await getDocs(
                query(
                    collection(firestore, "CARBON_FOOTPRINT_USER_DATA"),
                    where("user_uid", "==", user.uid),
                    where("footprintDetails.month", "==", newFootprintDetails.month),
                    where("footprintDetails.year", "==", newFootprintDetails.year)
                )
            );

            if (querySnapshot?.docs?.length) {
                const fetchedData = querySnapshot.docs[0].data(); 
                const fetchedFootprintDetails = fetchedData.footprintDetails;
                setNewFootprintDetails(fetchedFootprintDetails);

                toast.success(`Fetched carbon footprint details of ${newFootprintDetails.month} ${newFootprintDetails.year}`, { position: "top-center", toastId: "signUpSuccessToast", autoClose: 2000, theme: "dark" });
            }
            else{
                toast.error(`No data found for the month ${newFootprintDetails.month} ${newFootprintDetails.year}`, { position: "top-center", toastId: "signUpSuccessToast", autoClose: 2000, theme: "dark" })
            }
        } catch (error:any) {
            toast.error("Couldn't save the carbon footprint Data", {position:"top-center", autoClose:2000, theme:"dark"});
            console.log(error)
        }
        setLoadDataProcessing(false);
    }

    const handleSave = async function(){
        if(loadDataprocessing || saveDataprocessing || calculateDataprocessing) return;
        toast.dismiss();
        if(!user?.uid){
            toast.error("User Logged Out! Please log in again", {position:"top-center", toastId:"signUpLoadingToast" ,autoClose:2000, theme:"dark"});
            return;
        }
        setSaveDataProcessing(true);
        const {totalValue, electricityFootprint,fuelFootprint,vehicularFootprint,publicTransportFootprint,airTravelFootprint} = computeCarbonFootprint(
            newFootprintDetails
        );
                
        try {
            const querySnapshot = await getDocs(
                query(
                    collection(firestore, "CARBON_FOOTPRINT_USER_DATA"),
                    where("user_uid", "==", user.uid),
                    where("footprintDetails.month", "==", newFootprintDetails.month),
                    where("footprintDetails.year", "==", newFootprintDetails.year)
                )
            );
            console.log(querySnapshot?.docs?.length)
            if (querySnapshot?.docs?.length) {
                const existingDoc = querySnapshot.docs[0];
                const docRef = doc(firestore, "CARBON_FOOTPRINT_USER_DATA", existingDoc.id);
    
                await updateDoc(docRef, {
                    totalValue:totalValue, 
                    electricityFootprint:electricityFootprint,
                    fuelFootprint:fuelFootprint,
                    vehicularFootprint:vehicularFootprint,
                    publicTransportFootprint:publicTransportFootprint,
                    airTravelFootprint:airTravelFootprint,
                    updatedAt: Date.now(),
                });
            }
            else{
                const carbonFootprintData = {
                    user_uid: user.uid,
                    footprintDetails: newFootprintDetails,
                    totalValue:totalValue, 
                    electricityFootprint:electricityFootprint,
                    fuelFootprint:fuelFootprint,
                    vehicularFootprint:vehicularFootprint,
                    publicTransportFootprint:publicTransportFootprint,
                    airTravelFootprint:airTravelFootprint,
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                }
                
                await addDoc(collection(firestore, "CARBON_FOOTPRINT_USER_DATA"), carbonFootprintData);
            }
            toast.success(`Carbon footprint Output in ${newFootprintDetails.month} ${newFootprintDetails.year}: ${totalValue}kgCO2`, { position: "top-center", toastId: "signUpSuccessToast", autoClose: 2000, theme: "dark" });
        } catch (error:any) {
            toast.error("Couldn't save the carbon footprint Value", {position:"top-center", autoClose:2000, theme:"dark"});
            console.log(error)
        }
        setSaveDataProcessing(false);

    }

    const handleAddRide = async () =>{
        if(!location.start || !location.end || !rideStartTime || !selectedDays?.length){
            toast.error("All the fields are necessary",{
                position:'top-center',
                autoClose:2000,
                theme:'dark'
            });
            return;
        }

        if(!user?.uid){
            toast.error("User logged out. Please log in again",{
                position:'top-center',
                autoClose:2000,
                theme:'dark'
            });
            return;
        }

        try {
            const rideData = {
                user_uid: user?.uid,
                start_address: location.start,
                end_address: location.end,
                start_lat: location.start_lat,
                end_lat: location.end_lat,
                start_lng: location.start_lng,
                end_lng: location.end_lng,
                mode: selectedMode,
                start_time: rideStartTime,
                rideDays:selectedDays,
                status:'Active',
                createdAt: Date.now(),
                updatedAt: Date.now(),
            }
            console.log(rideData);

                
            await addDoc(collection(firestore, "SCHEDULED_RIDE_DATA"), rideData);

            const docRef = await addDoc(collection(firestore, "SCHEDULED_RIDE_DATA"), rideData);
            const docId = docRef.id;

            const ride_logs = {
                user_uid: user?.uid,
                ride_id: docId,
                status_log:'Created',
                createdAt: Date.now(),
            }
            await addDoc(collection(firestore, "RIDE_DATA_LOGS"), ride_logs);
            toast.success(`Ride details added`, { position: "top-center", toastId: "signUpSuccessToast", autoClose: 2000, theme: "dark" });

            setLocation({
                start:'',
                end:'',
                start_lat:0,
                start_lng:0,
                end_lat:0,
                end_lng:0
            });
            setSelectedMode("Car");
            setSelectedDays([]);
            setRideStartTime("");
            fetchRides();
        }
        catch (error:any) {
            toast.error("Couldn't save the ride data", {position:"top-center", autoClose:2000, theme:"dark"});
            console.log(error)
        }
    }

    const handleRideStatusChange = async (rideId: string, status:string) => {
        try{
            const ride = userRides.find((e) => e.id === rideId);
            if(!ride) return;
            if(!user?.uid){
                toast.error("User logged out. Please log in again",{
                    position:'top-center',
                    autoClose:2000,
                    theme:'dark'
                });
                return;
            }

            const eventDocRef = doc(firestore, "SCHEDULED_RIDE_DATA", rideId);
            await updateDoc(eventDocRef, {
                status: status,
            });

            const ride_logs = {
                user_uid: user?.uid,
                ride_id: rideId,
                status_log:status,
                createdAt: Date.now(),
            }
            await addDoc(collection(firestore, "RIDE_DATA_LOGS"), ride_logs);

            setUserRides((prevRides) =>
                prevRides.map((user_ride) =>
                    user_ride.id === rideId
                    ? {
                        ...user_ride,
                        status: status,
                    }
                    : user_ride
                )
            );  
            toast.success("Ride Status updated",{
                position:'top-center',
                autoClose:2000,
                theme:'dark'
            });
            return;
        }
        catch(error){
            toast.error("Couldn't update status",{
                position:'top-center',
                autoClose:2000,
                theme:'dark'
            });
            return;
        }
    }

    const handleDeleteRide = async (rideId: string) => {
        try{
            
            const ride = userRides.find((e) => e.id === rideId);
            if (!ride) return;
            
            
            if(!user?.uid){
                toast.error("User logged out. Please log in again",{
                    position: "top-center",
                    autoClose: 2000,
                    theme: "dark",
                });
                return;
            }
            
                    
            const eventDocRef = doc(firestore, "SCHEDULED_RIDE_DATA", rideId);
            await updateDoc(eventDocRef, {
                status: 'deleted',
            });
            
            const ride_logs = {
                user_uid: user?.uid,
                ride_id: rideId,
                status_log:'deleted',
                createdAt: Date.now(),
            }
            await addDoc(collection(firestore, "RIDE_DATA_LOGS"), ride_logs);
            
            
            setUserRides((prevRides) =>
                prevRides.filter((user_ride) => user_ride.id !== rideId)
            );
        
            toast.success("Ride Deleted",{
                position: "top-center",
                autoClose: 2000,
                theme: "dark",
            });
        }
        catch(error){
            console.error("Error deleting ride:", error);
        
            toast.error("Couldn't delete ride",{
                position: "top-center",
                autoClose: 2000,
                theme: "dark",
            });
        }
    };

    const handleAddSingleRide = async() =>{
        if(!location.start || !location.end || !rideStartTime || !selectedDays?.length){
            toast.error("All the fields are necessary",{
                position:'top-center',
                autoClose:2000,
                theme:'dark'
            });
            return;
        }

        if(selectedDays.length>1){
            toast.error("Only one day can be chosen while adding a  single ride",{
                position:'top-center',
                autoClose:2000,
                theme:'dark'
            });
            return;
        }

        if(!user?.uid){
            toast.error("User logged out. Please log in again",{
                position:'top-center',
                autoClose:2000,
                theme:'dark'
            });
            return;
        }

        try {
            const rideData = {
                user_uid: user?.uid,
                start_address: location.start,
                end_address: location.end,
                start_lat: location.start_lat,
                end_lat: location.end_lat,
                start_lng: location.start_lng,
                end_lng: location.end_lng,
                mode: selectedMode,
                start_time: rideStartTime,
                rideDays:selectedDays,
                status:'Single',
                createdAt: Date.now(),
                updatedAt: Date.now(),
            }
            console.log(rideData);

                
            const docRef = await addDoc(collection(firestore, "SCHEDULED_RIDE_DATA"), rideData);
            const docId = docRef.id;

            const ride_logs = {
                user_uid: user?.uid,
                ride_id: docId,
                status_log:'Created',
                createdAt: Date.now(),
            }
            await addDoc(collection(firestore, "RIDE_DATA_LOGS"), ride_logs);

            toast.success(`Ride details added`, { position: "top-center", toastId: "signUpSuccessToast", autoClose: 2000, theme: "dark" });

            setLocation({
                start:'',
                end:'',
                start_lat:0,
                start_lng:0,
                end_lat:0,
                end_lng:0
            });
            setSelectedMode("Car");
            setSelectedDays([]);
            setRideStartTime("");
            // fetchRides();
        }
        catch (error:any) {
            toast.error("Couldn't save the ride data", {position:"top-center", autoClose:2000, theme:"dark"});
            console.log(error)
        }
    }
      

    return(
        <div className="text-white h-[92vh] w-full overflow-y-auto  font-bold scrollbar-thin scrollbar-thumb-rounded-lg scrollbar-thumb-scroll-thumb scrollbar-track-scroll-track">
            <div className='w-[95%] m-[2.5%] mt-[60px] flex items-center font-mono font-bold flex-row text-xl'>
                <div>Update your footprint for the month</div>
                <div className='relative ml-[20px]'>
                    <select
                        className='p-[5px] border border-gray-400 rounded bg-gradient-to-r from-gray-700 via-gray-800 to-black text-white text-center w-[150px]'
                        value={newFootprintDetails.month}
                        onChange={(e) => {
                            setNewFootprintDetails(prev=>({...prev, month: e.target.value}))
                        }}
                    >
                        <option value="January" className='text-black'>January</option>
                        <option value="February" className='text-black'>February</option>
                        <option value="March" className='text-black'>March</option>
                        <option value="April" className='text-black'>April</option>
                        <option value="May" className='text-black'>May</option>
                        <option value="June" className='text-black'>June</option>
                        <option value="July" className='text-black'>July</option>
                        <option value="August" className='text-black'>August</option>
                        <option value="September" className='text-black'>September</option>
                        <option value="October" className='text-black'>October</option>
                        <option value="November" className='text-black'>November</option>
                        <option value="December" className='text-black'>December</option>
                    </select>
                </div>
                <div className='ml-[20px]'>
                    <input
                        type='number'
                        maxLength={4}
                        value={newFootprintDetails.year}
                        onChange = {(e) =>{
                            const target = e.target as HTMLInputElement;
                            if (Number(target.value) > 2100) target.value = "2100";
                            if (Number(target.value) < 0) target.value = "0";
                            e.target.value = `${Number(e.target.value)}`;
                            setNewFootprintDetails(prev=>({...prev, year: Number(target.value)}))
                        }}
                        pattern='[0-9]*'
                        placeholder='year'
                        className='p-[5px] border border-gray-400 rounded bg-gradient-to-r from-gray-700 via-gray-800 to-black text-white text-center w-[100px]'
                    />
                </div>
                <div className="hover:cursor-pointer ml-[20px] w-[100px] flex items-center justify-center sm:text-sm md:text-base bg-gradient-to-r from-blue-900 to-purple-950  text-white rounded-xl py-2"
                    onClick={handleCalculate}   
                >
                    {!calculateDataprocessing? "Calculate":"Calculating"}
                </div>
                <div className="hover:cursor-pointer ml-[20px] w-[100px] flex items-center justify-center sm:text-sm md:text-base bg-gradient-to-r from-blue-900 to-purple-950  text-white rounded-xl py-2"
                    onClick={handleSave}
                >
                    {!saveDataprocessing? "Save":"Saving..."}
                </div>
                <div className="hover:cursor-pointer ml-[20px] w-[100px] flex items-center justify-center sm:text-sm md:text-base bg-gradient-to-r from-blue-900 to-purple-950  text-white rounded-xl py-2"
                    onClick={handleLoadData}  
                >
                    {!loadDataprocessing? "Load Data":"Loading..."}
                </div>
            </div>
            <div className='grid-container w-full'>
                <div className='grid-item  bg-gradient-to-b from-gray-900 to-gray-600 '>

                    <div className='flex flex-col'>
                        <div className='m-[20px] flex items-center mb-[10px] text-lg'>
                            Electricity Consumption
                        </div>
                        <div className='ml-[20px] flex flex-row'>
                            <div className='font-sans flex items-center'>
                                Electricity Used :
                            </div>
                            <div className='flex items-center'>
                                <input 
                                    type='number' 
                                    value={newFootprintDetails.electricityUnits}
                                    onChange = {(e) =>{
                                        const target = e.target as HTMLInputElement;
                                        if (Number(target.value) > 1000000) target.value = "1000000";
                                        if (Number(target.value) < 0) target.value = "0";
                                        e.target.value = `${Number(e.target.value)}`;
                                        setNewFootprintDetails(prev=>({...prev, electricityUnits: Number(target.value)}))
                                    }}
                                    pattern='[0-9]*' 
                                    className='m-[10px] p-[5px] border border-gray-400 rounded bg-black text-white text-center w-[80px]'  
                                />
                                <div className='font-sans flex items-center'>
                                    in KWh
                                </div>
                            </div>
                        </div>
                        <div className='ml-[20px] flex flex-row'>
                            <div className='font-sans flex items-center'>
                                Renewable Source :
                            </div>
                            <div className='flex items-center'>
                                <input 
                                    type="number" 
                                    value={newFootprintDetails.renwableElectricityPercentage}
                                    onChange = {(e) =>{
                                        const target = e.target as HTMLInputElement;
                                        if (Number(target.value) > 100) target.value = "100";
                                        if (Number(target.value) < 0) target.value = "0";
                                        e.target.value = `${Number(e.target.value)}`;
                                        setNewFootprintDetails(prev=>({...prev, renwableElectricityPercentage: Number(target.value)}))
                                    }}
                                    pattern="[0-9]*" 
                                    className="m-[10px] p-[5px] border border-gray-400 rounded bg-black text-white text-center w-[80px]"  
                                />
                                <div className='font-sans flex items-center'>
                                    %
                                </div>
                            </div>
                        </div>
                        <div className='ml-[20px] flex flex-row'>
                            <div className='font-sans flex items-center'>
                                Split between :
                            </div>
                            <div className='flex items-center'>
                                <input 
                                    type="number" 
                                    value={newFootprintDetails.electricitysplit}
                                    onChange = {(e) =>{
                                        const target = e.target as HTMLInputElement;
                                        if (Number(target.value) > 100) target.value = "100";
                                        if (Number(target.value) < 1) target.value = "1";
                                        e.target.value = `${Number(e.target.value)}`;
                                        setNewFootprintDetails(prev=>({...prev, electricitysplit: Number(target.value)}))
                                    }}
                                    pattern="[0-9]*" 
                                    className="m-[10px] p-[5px] border border-gray-400 rounded bg-black text-white text-center w-[80px]"  
                                />
                                <div className='font-sans flex items-center'>
                                    people
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='grid-item  bg-gradient-to-b from-gray-900 to-gray-600'>

                    <div className='flex flex-col'>
                        <div className='m-[20px] flex items-center mb-[10px] text-lg'>
                            Fuel Consumption - Household
                        </div>
                        <div className='ml-[20px] flex flex-row'>
                            <div className='font-sans flex items-center'>
                                Natural Gas :
                            </div>
                            <div className='flex items-center'>
                                <input 
                                    type='number' 
                                    value={newFootprintDetails.naturalGas}
                                    onChange = {(e) =>{
                                        const target = e.target as HTMLInputElement;
                                        if (Number(target.value) > 1000000) target.value = "1000000";
                                        if (Number(target.value) < 0) target.value = "0";
                                        e.target.value = `${Number(e.target.value)}`;
                                        setNewFootprintDetails(prev=>({...prev, naturalGas: Number(target.value)}))
                                    }}
                                    pattern='[0-9]*' 
                                    className='m-[10px] p-[5px] border border-gray-400 rounded bg-black text-white text-center w-[80px]'  
                                />
                                <div className='font-sans flex items-center'>
                                    in KWh
                                </div>
                            </div>
                        </div>
                        <div className='ml-[20px] flex flex-row'>
                            <div className='font-sans flex items-center'>
                                LPG :
                            </div>
                            <div className='flex items-center'>
                                <input 
                                    type="number" 
                                    value={newFootprintDetails.lpg}
                                    onChange = {(e) =>{
                                        const target = e.target as HTMLInputElement;
                                        if (Number(target.value) > 100000) target.value = "100000";
                                        if (Number(target.value) < 0) target.value = "0";
                                        e.target.value = `${Number(e.target.value)}`;
                                        setNewFootprintDetails(prev=>({...prev, lpg: Number(target.value)}))
                                    }}
                                    pattern="[0-9]*" 
                                    className="m-[10px] p-[5px] border border-gray-400 rounded bg-black text-white text-center w-[80px]"  
                                />
                                <div className='font-sans flex items-center'>
                                    Litres
                                </div>
                            </div>
                        </div>
                        <div className='ml-[20px] flex flex-row'>
                            <div className='font-sans flex items-center'>
                                Cooking Oil :
                            </div>
                            <div className='flex items-center'>
                                <input 
                                    type="number" 
                                    value={newFootprintDetails.cookingOil}
                                    onChange = {(e) =>{
                                        const target = e.target as HTMLInputElement;
                                        if (Number(target.value) > 100000) target.value = "100000";
                                        if (Number(target.value) < 0) target.value = "0";
                                        e.target.value = `${Number(e.target.value)}`;
                                        setNewFootprintDetails(prev=>({...prev, cookingOil: Number(target.value)}))
                                    }}
                                    pattern="[0-9]*" 
                                    className="m-[10px] p-[5px] border border-gray-400 rounded bg-black text-white text-center w-[80px]"  
                                />
                                <div className='font-sans flex items-center'>
                                    Litres
                                </div>
                            </div>
                        </div>
                        <div className='ml-[20px] flex flex-row'>
                            <div className='font-sans flex items-center'>
                                Split between :
                            </div>
                            <div className='flex items-center'>
                                <input 
                                    type="number" 
                                    value={newFootprintDetails.fuelSplit}
                                    onChange = {(e) =>{
                                        const target = e.target as HTMLInputElement;
                                        if (Number(target.value) > 100) target.value = "100";
                                        if (Number(target.value) < 1) target.value = "1";
                                        e.target.value = `${Number(e.target.value)}`;
                                        setNewFootprintDetails(prev=>({...prev, fuelSplit: Number(target.value)}))
                                    }}
                                    pattern="[0-9]*" 
                                    className="m-[10px] p-[5px] border border-gray-400 rounded bg-black text-white text-center w-[80px]"  
                                />
                                <div className='font-sans flex items-center'>
                                    people
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='grid-item  bg-gradient-to-b from-gray-900 to-gray-600'>

                    <div className='flex flex-col'>
                        <div className='m-[20px] flex items-center mb-[10px] text-lg'>
                            Miscellaneous travels - Car
                        </div>
                        <div className='ml-[20px] flex flex-row'>
                            <div className='font-sans flex items-center'>
                                Distance travelled :
                            </div>
                            <div className='flex items-center'>
                                <input 
                                    type='number' 
                                    value={newFootprintDetails.carDistance}
                                    onChange = {(e) =>{
                                        const target = e.target as HTMLInputElement;
                                        if (Number(target.value) > 1000000) target.value = "1000000";
                                        if (Number(target.value) < 0) target.value = "0";
                                        e.target.value = `${Number(e.target.value)}`;
                                        setNewFootprintDetails(prev=>({...prev, carDistance: Number(target.value)}))
                                    }}
                                    pattern='[0-9]*' 
                                    className='m-[10px] p-[5px] border border-gray-400 rounded bg-black text-white text-center w-[80px]'  
                                />
                                <div className='font-sans flex items-center'>
                                    Km
                                </div>
                            </div>
                        </div>
                        <div className='ml-[20px] flex flex-row'>
                            <div className='font-sans flex items-center'>
                                Fuel type :
                            </div>
                            <div className='flex items-center'>
                                <select
                                    className="m-[10px] p-[5px] border border-gray-400 rounded bg-black text-white"
                                    value={newFootprintDetails.carFuelType}
                                    onChange={(e) => {
                                        setNewFootprintDetails(prev=>({...prev, carFuelType: e.target.value as "Petrol" | "Diesel" | "CNG" | "LPG" | "Electricity"}))
                                    }}
                                >
                                    <option value="Petrol">Petrol</option>
                                    <option value="Diesel">Diesel</option>
                                    <option value="CNG">CNG</option>
                                    <option value="LPG">LPG</option>
                                    <option value="Electricity">Electricity</option>
                                </select>
                            </div>
                        </div>
                        <div className='ml-[20px] flex flex-row'>
                            <div className='font-sans flex items-center'>
                                Car Pool percentage :
                            </div>
                            <div className='flex items-center'>
                                <input 
                                    type="number" 
                                    value={newFootprintDetails.carPoolPercentage}
                                    onChange = {(e) =>{
                                        const target = e.target as HTMLInputElement;
                                        if (Number(target.value) > 100) target.value = "100";
                                        if (Number(target.value) < 0) target.value = "0";
                                        e.target.value = `${Number(e.target.value)}`;
                                        setNewFootprintDetails(prev=>({...prev, carPoolPercentage: Number(target.value)}))
                                    }}
                                    pattern="[0-9]*" 
                                    className="m-[10px] p-[5px] border border-gray-400 rounded bg-black text-white text-center w-[80px]"  
                                />
                                <div className='font-sans flex items-center'>
                                    %
                                </div>
                            </div>
                        </div>
                        <div className='ml-[20px] flex flex-row'>
                            <div className='font-sans flex items-center'>
                                Split between :
                            </div>
                            <div className='flex items-center'>
                                <input 
                                    type="number"
                                    value={newFootprintDetails.carpoolSplit}
                                    onChange = {(e) =>{
                                        const target = e.target as HTMLInputElement;
                                        if (Number(target.value) > 100) target.value = "100";
                                        if (Number(target.value) < 1) target.value = "1";
                                        e.target.value = `${Number(e.target.value)}`;
                                        setNewFootprintDetails(prev=>({...prev, carpoolSplit: Number(target.value)}))
                                    }}
                                    pattern="[0-9]*" 
                                    className="m-[10px] p-[5px] border border-gray-400 rounded bg-black text-white text-center w-[80px]"  
                                />
                                <div className='font-sans flex items-center'>
                                    people
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='grid-item  bg-gradient-to-b from-gray-900 to-gray-600'>

                    <div className='flex flex-col'>
                        <div className='m-[20px] flex items-center mb-[10px] text-lg'>
                            Miscellaneous travels - Bike
                        </div>
                        <div className='ml-[20px] flex flex-row'>
                            <div className='font-sans flex items-center'>
                                Distance travelled :
                            </div>
                            <div className='flex items-center'>
                                <input 
                                    type='number' 
                                    value={newFootprintDetails.bikeDistance}
                                    onChange = {(e) =>{
                                        const target = e.target as HTMLInputElement;
                                        if (Number(target.value) > 1000000) target.value = "1000000";
                                        if (Number(target.value) < 0) target.value = "0";
                                        e.target.value = `${Number(e.target.value)}`;
                                        setNewFootprintDetails(prev=>({...prev, bikeDistance: Number(target.value)}))
                                    }}
                                    pattern='[0-9]*' 
                                    className='m-[10px] p-[5px] border border-gray-400 rounded bg-black text-white text-center w-[80px]'  
                                />
                                <div className='font-sans flex items-center'>
                                    Km
                                </div>
                            </div>
                        </div>
                        <div className='ml-[20px] flex flex-row'>
                            <div className='font-sans flex items-center'>
                                Fuel type :
                            </div>
                            <div className='flex items-center'>
                                <select
                                    className="m-[10px] p-[5px] border border-gray-400 rounded bg-black text-white"
                                    value={newFootprintDetails.bikeFuelType}
                                    onChange={(e) => {
                                        setNewFootprintDetails(prev=>({...prev, bikeFuelType: e.target.value as "Petrol" | "Diesel" | "CNG" | "LPG" | "Electricity" }))
                                    }}
                                >
                                    <option value="Petrol">Petrol</option>
                                    <option value="Diesel">Diesel</option>
                                    <option value="CNG">CNG</option>
                                    <option value="LPG">LPG</option>
                                    <option value="Electricity">Electricity</option>
                                </select>
                            </div>
                        </div>
                        <div className='ml-[20px] flex flex-row'>
                            <div className='font-sans flex items-center'>
                                Bike Pool percentage :
                            </div>
                            <div className='flex items-center'>
                                <input 
                                    type="number" 
                                    value={newFootprintDetails.bikePoolPercentage}
                                    onChange = {(e) =>{
                                        const target = e.target as HTMLInputElement;
                                        if (Number(target.value) > 100) target.value = "100";
                                        if (Number(target.value) < 0) target.value = "0";
                                        e.target.value = `${Number(e.target.value)}`;
                                        setNewFootprintDetails(prev=>({...prev, bikePoolPercentage: Number(target.value)}))
                                    }}
                                    pattern="[0-9]*" 
                                    className="m-[10px] p-[5px] border border-gray-400 rounded bg-black text-white text-center w-[80px]"  
                                />
                                <div className='font-sans flex items-center'>
                                    %
                                </div>
                            </div>
                        </div>
                        <div className='ml-[20px] flex flex-row'>
                            <div className='font-sans flex items-center'>
                                Split between :
                            </div>
                            <div className='flex items-center'>
                                <input 
                                    type="number" 
                                    value={newFootprintDetails.bikepoolSplit}
                                    onChange = {(e) =>{
                                        const target = e.target as HTMLInputElement;
                                        if (Number(target.value) > 100) target.value = "100";
                                        if (Number(target.value) < 1) target.value = "1";
                                        e.target.value = `${Number(e.target.value)}`;
                                        setNewFootprintDetails(prev=>({...prev, bikepoolSplit: Number(target.value)}))
                                    }}
                                    pattern="[0-9]*" 
                                    className="m-[10px] p-[5px] border border-gray-400 rounded bg-black text-white text-center w-[80px]"  
                                />
                                <div className='font-sans flex items-center'>
                                    people
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='grid-item  bg-gradient-to-b from-gray-900 to-gray-600'>

                    <div className='flex flex-col'>
                        <div className='m-[20px] flex items-center mb-[10px] text-lg'>
                            Public Transport
                        </div>
                        <div className='ml-[20px] flex flex-row'>
                            <div className='font-sans flex items-center'>
                                Bus :
                            </div>
                            <div className='flex items-center'>
                                <input 
                                    type='number' 
                                    value={newFootprintDetails.busDistance}
                                    onChange = {(e) =>{
                                        const target = e.target as HTMLInputElement;
                                        if (Number(target.value) > 1000000) target.value = "1000000";
                                        if (Number(target.value) < 0) target.value = "0";
                                        e.target.value = `${Number(e.target.value)}`;
                                        setNewFootprintDetails(prev=>({...prev, busDistance: Number(target.value)}))
                                    }}
                                    pattern='[0-9]*' 
                                    className='m-[10px] p-[5px] border border-gray-400 rounded bg-black text-white text-center w-[80px]'  
                                />
                                <div className='font-sans flex items-center'>
                                    Km
                                </div>
                            </div>
                        </div>
                        <div className='ml-[20px] flex flex-row'>
                            <div className='font-sans flex items-center'>
                                Train :
                            </div>
                            <div className='flex items-center'>
                                <input 
                                    type="number"
                                    value={newFootprintDetails.trainDistance}
                                    onChange = {(e) =>{
                                        const target = e.target as HTMLInputElement;
                                        if (Number(target.value) > 100000) target.value = "100000";
                                        if (Number(target.value) < 0) target.value = "0";
                                        e.target.value = `${Number(e.target.value)}`;
                                        setNewFootprintDetails(prev=>({...prev, trainDistance: Number(target.value)}))
                                    }}
                                    pattern="[0-9]*" 
                                    className="m-[10px] p-[5px] border border-gray-400 rounded bg-black text-white text-center w-[80px]"  
                                />
                                <div className='font-sans flex items-center'>
                                    Km
                                </div>
                            </div>
                        </div>
                        <div className='ml-[20px] flex flex-row'>
                            <div className='font-sans flex items-center'>
                                Auto :
                            </div>
                            <div className='flex items-center'>
                                <input 
                                    type="number" 
                                    value={newFootprintDetails.autoDistance}
                                    onChange = {(e) =>{
                                        const target = e.target as HTMLInputElement;
                                        if (Number(target.value) > 100000) target.value = "100000";
                                        if (Number(target.value) < 0) target.value = "0";
                                        e.target.value = `${Number(e.target.value)}`;
                                        setNewFootprintDetails(prev=>({...prev, autoDistance: Number(target.value)}))
                                    }}
                                    pattern="[0-9]*" 
                                    className="m-[10px] p-[5px] border border-gray-400 rounded bg-black text-white text-center w-[80px]"  
                                />
                                <div className='font-sans flex items-center'>
                                    Km
                                </div>
                            </div>
                        </div>
                        <div className='ml-[20px] flex flex-row'>
                            <div className='font-sans flex items-center'>
                                Auto Split :
                            </div>
                            <div className='flex items-center'>
                                <input 
                                    type="number"
                                    value={newFootprintDetails.autoSplit}
                                    onChange = {(e) =>{
                                        const target = e.target as HTMLInputElement;
                                        if (Number(target.value) > 100000) target.value = "100000";
                                        if (Number(target.value) < 1) target.value = "1";
                                        e.target.value = `${Number(e.target.value)}`;
                                        setNewFootprintDetails(prev=>({...prev, autoSplit: Number(target.value)}));

                                    }}
                                    pattern="[0-9]*" 
                                    className="m-[10px] p-[5px] border border-gray-400 rounded bg-black text-white text-center w-[80px]"  
                                />
                                <div className='font-sans flex items-center'>
                                    people
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='grid-item  bg-gradient-to-b from-gray-900 to-gray-600'>
                    <div className='flex flex-col'>
                        <div className='m-[20px] flex items-center mb-[10px] text-lg'>
                            Miscellaneous Air Travel
                        </div>
                        <div className='ml-[20px] flex flex-row'>
                            <div className='font-sans flex items-center'>
                                Distance :
                            </div>
                            <div className='flex items-center'>
                                <input 
                                    type='number' 
                                    value={newFootprintDetails.airTravelDistance}
                                    onChange = {(e) =>{
                                        const target = e.target as HTMLInputElement;
                                        if (Number(target.value) > 1000000) target.value = "1000000";
                                        if (Number(target.value) < 0) target.value = "0";
                                        e.target.value = `${Number(e.target.value)}`;
                                        setNewFootprintDetails(prev=>({...prev, airTravelDistance: Number(target.value)}))
                                    }}
                                    pattern='[0-9]*' 
                                    className='m-[10px] p-[5px] border border-gray-400 rounded bg-black text-white text-center w-[80px]'  
                                />
                                <div className='font-sans flex items-center'>
                                    Km
                                </div>
                            </div>
                        </div>
                        <div className='ml-[20px] flex flex-row'>
                            <div className='font-sans flex items-center'>
                                Class:
                            </div>
                            <div className='flex items-center'>
                                <select
                                    className="m-[10px] p-[5px] border border-gray-400 rounded bg-black text-white"
                                    value={newFootprintDetails.airMode}
                                    onChange={(e) => {
                                        setNewFootprintDetails(prev=>({...prev, airMode: e.target.value as "Economy" | "Premium Economy" | "Business" | "First"}))
                                    }}
                                >
                                    <option value="Economy">Economy</option>
                                    <option value="Premium Economy">Premium Economy</option>
                                    <option value="Business">Business</option>
                                    <option value="First">First</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="w-[95%] m-auto mt-[60px] flex flex-col items-center font-mono font-bold text-xl space-y-6 p-6 rounded-2xl shadow-lg text-white">
                <div className="text-2xl text-green-700 underline mb-4 ">Schedule Rides</div>

                <div className="flex flex-row items-start w-full">
                    <label className="text-lg mb-2 mx-2 p-2 text-gray-100">To Location</label>
                    <div
                        className="w-[60%] p-2 rounded-lg border text-gray-500 border-gray-300 focus:outline-none bg-white focus:ring-2 focus:ring-green-500 overflow-x-auto"
                    >
                        {location.start?.length ? location.start : "Add your starting point"}
                    </div>
                    <button className="mx-4 p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500" 
                        onClick={()=>{
                            setLocationToUpdate("startLoc");
                            openModal();
                        }}
                    >
                        Select Location
                    </button>
                </div>

                <div className="flex flex-row items-start w-full">
                    <label className="text-lg mb-2 mx-2 p-2 text-gray-100">From Location</label>
                    <div
                        className="w-[60%] p-2 rounded-lg border text-gray-500 border-gray-300 focus:outline-none bg-white focus:ring-2 focus:ring-green-500 overflow-x-auto"
                    >
                        {location.end?.length ? location.end : "Add your ending point"}
                    </div>
                    <button className="mx-4 p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500" 
                        onClick={()=>{
                            setLocationToUpdate("endLoc");
                            openModal();
                        }}
                    >
                        Select Location
                    </button>
                </div>
                {isModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <div className="bg-white w-[80%] h-[80%] rounded-lg p-4 shadow-lg relative">
                            {/* Google Maps Component */}
                            <GoogleMaps
                            style="w-full"
                            initialAddress={locationToUpdate === "startLoc" ? location.start : location.end}
                            onLocationSelect={handleLocationSelect}
                            initialLatitude={19.0760}
                            initialLongitude={72.8777} 
                            />
                            {/* Close Button */}
                        </div>
                        <button
                            onClick={closeModal}
                            className="absolute top-4 right-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                            Cancel
                        </button>
                    </div>
                )}


                <div className="flex flex-row items-start w-full">
                    <label className="text-lg mb-2 mx-2 p-2 text-gray-100 flex items-center">Start Time</label>
                    <input
                    type="time"
                    value={rideStartTime}
                    onChange={handleTimeChange}
                    className="mx-4 p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
                    />
                </div>

                <div className="flex flex-row items-start w-full">
                    <label className="text-lg mb-2 mx-2 p-2 text-gray-100 flex items-center">Mode</label>
                    <select
                        className="mb-2 p-2 border border-gray-400 rounded bg-black text-white"
                        value={selectedMode}
                        onChange={handleModeChange} 
                    >
                        <option value="Car">Car</option>
                        <option value="Bike">Bike</option>
                        <option value="Bus">Bus</option>
                    </select>
                </div>


                <div className="flex flex-col justify-start w-full">
                    <label className="text-lg mb-2 mx-2 px-2 text-gray-100">Set Frequency</label>
                    <div className="flex flex-row mx-2 mt-4 px-2 flex-wrap gap-4">
                    {["M", "T", "W", "Th", "F", "Sa", "S"].map((day) => (
                        <div key={day} className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id={day}
                            name={day}
                            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                            checked={selectedDays.includes(day)} // Controlled checkbox
                            onChange={handleCheckboxChange} // Update state on change
                        />
                        <label htmlFor={day} className="text-gray-100">
                            {day}
                        </label>
                        </div>
                    ))}
                    <button className=" px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                        onClick={handleAddRide}
                    >
                        Add Ride
                    </button>
                    
                    </div>
                    <div className='w-full mt-[20px] flex flex-row'>
                        <div className='mx-2 mt-3 px-2 text-gray-100'>
                            Or Instead :
                        </div>
                        <button className=" px-6 mx-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                            onClick={handleAddSingleRide}
                        >
                            Add Single Ride
                        </button>
                    </div>
                </div>


                
            </div>
            <div className="w-[95%] m-auto mt-[60px] flex flex-col items-center font-mono font-bold text-xl space-y-6 p-6 rounded-2xl shadow-lg text-white">
                <div className="text-2xl text-green-700 underline mb-4 w-full flex items-center justify-center ">Your Rides</div>
                {userRides.map((ride) => (
                    <div
                        key={ride.id}
                        className="bg-gray-800 p-6 rounded-lg shadow-md mb-6 text-white flex flex-col w-full"
                    >
                        {/* Ride Details Header */}
                        <div className="w-full flex flex-row items-center">
                        {/* <div className="w-[65%] text-3xl flex items-center font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-700">
                            Ride from {ride.start_address} to {ride.end_address}
                        </div> */}
                            <div className="flex flex-col text-xs items-center">
                                <div className="w-full text-yellow-600 flex items-center">
                                Start Time: {ride.start_time}
                                </div>
                            </div>
                        </div>

                        <div className="w-full flex flex-row">
                            <div className="w-[65%] font-bold text-sm text-blue-300 py-2 flex items-center">
                                Mode of Transportation: {ride.mode}
                            </div>
                            <div className="text-green-400 border bg-gradient-to-br from-blue-900 to-black p-2">
                                Status:
                                <select
                                value={ride.status} 
                                onChange={(e) => handleRideStatusChange(ride.id, e.target.value)}
                                className="px-1 bg-transparent"
                                >
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                </select>
                            </div>
                        </div>
                        <div className="w-full py-4">
                            <p className="text-sm text-gray-400">
                                <strong>Ride Days:</strong> {ride.rideDays.join(", ")}
                            </p>
                            </div>

                            <div className="w-full py-4">
                            <p className="text-sm text-gray-400">
                                <strong>Start Address:</strong> {ride.start_address}
                            </p>
                            <p className="text-sm text-gray-400">
                                <strong>End Address:</strong> {ride.end_address}
                            </p>
                            </div>

                            <div className="flex items-center flex-row justify-end mt-4 w-full">
                            <button
                                type="button"
                                className={`bg-red-600 hover:bg-red-700 text-white mx-4 px-4 py-2 rounded flex items-center`}
                                onClick={(e) => handleDeleteRide(ride.id)}
                            >
                                Delete Ride
                            </button>
                        </div>
                    </div>
                ))}
            </div>

        </div>
    )
}
export default page;