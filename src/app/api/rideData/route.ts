import { firestore } from "@/firebase/firebase";
import axios from "axios";
import { NextRequest, NextResponse } from 'next/server';
import { collection, doc, getDoc, getDocs, orderBy, query, Timestamp, updateDoc, where } from "firebase/firestore";
import { CARBON_FOOTPRINT_FACTORS } from "@/components/ComputeCarbonFootprint/CarbonConstants";

export default async function handleSingleRide(){
    const tenDaysAgo = Date.now() - 10 * 24 * 60 * 60 * 1000; // 10 days ago in milliseconds
    console.log(tenDaysAgo);

    const rideLogsQuery = query(
        collection(firestore, "RIDE_DATA_LOGS"),
        where("createdAt", ">=", tenDaysAgo),
        orderBy("createdAt","asc")
    );
    console.log("h1")
    const querySnapshot = await getDocs(rideLogsQuery);
    console.log("h2")
    console.log("h2")
    
    if (!querySnapshot.empty) {
        let rideLogs :any[] = []
        querySnapshot.docs.forEach(doc => {
            rideLogs.push(doc.data());  // Push the data of each document into the rideLogs array
        });
        console.log("h3")
        console.log(rideLogs)
        
        const scheduledRidesData = [];
        console.log("h4")
        
        for (const rideLog of rideLogs) {
            

            console.log("h5")
            const rideId = rideLog.ride_id;  // Extract rideId from the ride log
            console.log("h6")
            console.log(rideId)
            
            // Query the SCHEDULED_RIDE_DATA collection using the rideId
            const scheduledRideRef = doc(firestore, "SCHEDULED_RIDE_DATA", rideId);  // Reference to the scheduled ride document
            console.log("h7")
            const scheduledRideSnap = await getDoc(scheduledRideRef);
            console.log("h8")
            
            if (scheduledRideSnap.exists()) {
                console.log("h9")
                const scheduledRide = scheduledRideSnap.data();
                console.log("h10")
                if(scheduledRide.status=='Single'){
                    scheduledRidesData.push({
                        rideLog,
                        scheduledRide
                    });
                }
            } else {
                console.log(`No scheduled ride found for rideId: ${rideId}`);
            }
        }

        scheduledRidesData.forEach(async (ride)=>{
            const { start_lng, start_lat, end_lng, end_lat } = ride.scheduledRide;
            const mode = ride.scheduledRide.mode=='Bike'?'bicycling':'driving'
            console.log(start_lng, start_lat, end_lng, end_lat )
            const response = await axios.get(
                `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${start_lng},${start_lat}&destinations=${end_lat},${end_lng}&mode='${mode}'&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
            );
        
            let totalEmissions = 0
            if (response.data.status === 'OK') {
                const distanceInMeters = response.data.rows[0].elements[0].distance.value; // Distance in meters
                const distanceInKm = distanceInMeters / 1000; // Convert meters to kilometers
            
                // Calculate carbon emissions
                let emissions = distanceInKm; // in kg CO2
                if(mode=='bicycling'){
                    emissions *= CARBON_FOOTPRINT_FACTORS.vehicles.bike.Petrol;
                }
                else emissions *= CARBON_FOOTPRINT_FACTORS.vehicles.car.Petrol;

                for( let rideDay of ride.scheduledRide.rideDays){
                    if(ride.scheduledRide.start_time >= '08:00' && ride.scheduledRide.start_time <='12:00' && (rideDay !="Sa" || rideDay!='S')){
                        totalEmissions += (emissions*=CARBON_FOOTPRINT_FACTORS.traffic.rushHours)
                    }
                    else if((rideDay =="Sa" || rideDay=='S')){
                        totalEmissions += (emissions*=CARBON_FOOTPRINT_FACTORS.traffic.weekend)
                    }
                    else totalEmissions+=emissions
                }
            } else {
                throw new Error('Error calculating distance from Google Maps API');
            }
            console.log(totalEmissions);
        });

        return scheduledRidesData;

    } else {
        console.log("No ride logs found in the last 10 days.");
    }
    return [];

};

export async function GET(req: NextRequest) {
    const result = await handleSingleRide(); // Call the ABC function
  
    // Return the result as JSON
    return NextResponse.json({ message: result });
  }