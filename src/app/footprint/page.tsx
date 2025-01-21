"use client"
import { auth, firestore } from '@/firebase/firebase';
import { addDoc, collection, doc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { toast } from 'react-toastify';

type pageProps = {
    
};

const page:React.FC<pageProps> = () => {
    
    const [newFootprintDetails, setNewFootprintDetails] = useState({
        month: "January",
        year: 2000,
        electricityUnits: 0,
        renwableElectricityPercentage: 0,
        renewableFuelPercentage: 0,
        electricitysplit:1,
        lpg: 0,
        naturalGas:0,
        cookingOil:0,
        fuelSplit:1,
        carDistance:0,
        carFuelType:"Petrol",
        carPoolPercentage:0,
        carpoolSplit:0,  
        bikeDistance:0,
        bikeFuelType:"Petrol",
        bikePoolPercentage:0,
        bikepoolSplit:0,
        busDistance:0,
        trainDistance:0,
        autoDistance:0,
        autoSplit:0,  
        airTravelDistance:0,
        airMode:"Economy",
    });

    const [user,loading] = useAuthState(auth);

    const handleSave = async function(){

        if(newFootprintDetails.year<2000){
            toast.error("Footprint Data can only be stored post Jan 2000", {position:"top-center", toastId:"signUpLoadingToast" ,autoClose:2000, theme:"dark"});
            return;
        }

        if(!user?.uid){
            toast.error("User Logged Out! Please log in again", {position:"top-center", toastId:"signUpLoadingToast" ,autoClose:2000, theme:"dark"});
            return;
        }
        try {
            console.log(newFootprintDetails);
            const querySnapshot = await getDocs(
                query(
                    collection(firestore, "FOOTPRINT_DATA"),
                    where("user_uid", "==", user.uid),
                    where("footprintDetails.month", "==", newFootprintDetails.month),
                    where("footprintDetails.year", "==", newFootprintDetails.year)
                )
            );
            console.log(querySnapshot?.docs?.length)
            if (querySnapshot?.docs?.length) {
                console.log("old");
                const existingDoc = querySnapshot.docs[0];
                const docRef = doc(firestore, "FOOTPRINT_DATA", existingDoc.id);
    
                await updateDoc(docRef, {
                    "footprintDetails": newFootprintDetails,
                    "updatedAt": Date.now(),
                });
            }
            else{
                console.log("new");
                const monthlyCarbonFootprintData = {
                    user_uid: user.uid,
                    footprintDetails: newFootprintDetails,
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                }
                
                await addDoc(collection(firestore, "FOOTPRINT_DATA"), monthlyCarbonFootprintData);
            }
            toast.success(`Carbon footprint details of ${newFootprintDetails.month} ${newFootprintDetails.year} were updated`, { position: "top-center", toastId: "signUpSuccessToast", autoClose: 2000, theme: "dark" });
        } catch (error:any) {
            toast.error("Couldn't save the carbon footprint Data", {position:"top-center", autoClose:2000, theme:"dark"});
            console.log(error)
        }
    }

    const handleLoadData = async function(){
        if(!user?.uid){
            toast.error("User Logged Out! Please log in again", {position:"top-center", toastId:"signUpLoadingToast" ,autoClose:2000, theme:"dark"});
            return;
        }
        try {
            console.log(newFootprintDetails);
            const querySnapshot = await getDocs(
                query(
                    collection(firestore, "FOOTPRINT_DATA"),
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
    }

    useEffect(() => {
        console.log("Updated newFootprintDetails:", newFootprintDetails);
    }, [newFootprintDetails]);

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
                    onClick={handleSave}   
                >
                    Save
                </div>
                <div className="hover:cursor-pointer ml-[20px] w-[100px] flex items-center justify-center sm:text-sm md:text-base bg-gradient-to-r from-blue-900 to-purple-950  text-white rounded-xl py-2">
                    Submit
                </div>
                <div className="hover:cursor-pointer ml-[20px] w-[100px] flex items-center justify-center sm:text-sm md:text-base bg-gradient-to-r from-blue-900 to-purple-950  text-white rounded-xl py-2"
                    onClick={handleLoadData}  
                >
                    Load data
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
                                        if (Number(target.value) < 0) target.value = "0";
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
                                        if (Number(target.value) < 0) target.value = "0";
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
                                        setNewFootprintDetails(prev=>({...prev, carFuelType: e.target.value}))
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
                                        if (Number(target.value) < 0) target.value = "0";
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
                                        setNewFootprintDetails(prev=>({...prev, bikeFuelType: e.target.value}))
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
                                        if (Number(target.value) < 0) target.value = "0";
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
                                        if (Number(target.value) > 100) target.value = "100";
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
                                        if (Number(target.value) > 100) target.value = "100";
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
                                Split between :
                            </div>
                            <div className='flex items-center'>
                                <input 
                                    type="number"
                                    value={newFootprintDetails.autoSplit}
                                    onChange = {(e) =>{
                                        const target = e.target as HTMLInputElement;
                                        if (Number(target.value) > 100) target.value = "100";
                                        if (Number(target.value) < 0) target.value = "0";
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
                                        setNewFootprintDetails(prev=>({...prev, airMode: e.target.value}))
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
            
        </div>
    )
}
export default page;