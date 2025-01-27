import { CARBON_FOOTPRINT_FACTORS } from "./CarbonConstants";

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

function computeCarbonFootprint(
    footprintDetails: FootprintDetails
){
    
    const electricityFootprint = (
        (footprintDetails.electricityUnits *(1 - (footprintDetails.renwableElectricityPercentage/100)) * CARBON_FOOTPRINT_FACTORS.electricity.nonRenewable) +
        (footprintDetails.electricityUnits * (footprintDetails.renwableElectricityPercentage/100) * CARBON_FOOTPRINT_FACTORS.electricity.renewable)
    )/footprintDetails.electricitysplit;

    const fuelFootprint = (
        (footprintDetails.lpg * CARBON_FOOTPRINT_FACTORS.fuels.lpg) +
        (footprintDetails.naturalGas * CARBON_FOOTPRINT_FACTORS.fuels.naturalGas) +
        (footprintDetails.cookingOil * CARBON_FOOTPRINT_FACTORS.fuels.cookingOil)
    )/footprintDetails.fuelSplit;

    const carFootprint = footprintDetails.carDistance * CARBON_FOOTPRINT_FACTORS.vehicles.car[footprintDetails.carFuelType] * (1-(footprintDetails.carPoolPercentage/100) + ((footprintDetails.carPoolPercentage/100)/footprintDetails.carpoolSplit));
    const bikeFootprint = footprintDetails.bikeDistance * CARBON_FOOTPRINT_FACTORS.vehicles.bike[footprintDetails.bikeFuelType] * (1 - (footprintDetails.bikePoolPercentage/100) + ((footprintDetails.bikePoolPercentage/100)/footprintDetails.bikepoolSplit));
    const busFootprint = footprintDetails.busDistance * CARBON_FOOTPRINT_FACTORS.vehicles.bus;
    const trainFootprint = footprintDetails.trainDistance * CARBON_FOOTPRINT_FACTORS.vehicles.train;
    const autoFootprint = footprintDetails.autoDistance * CARBON_FOOTPRINT_FACTORS.vehicles.auto/(footprintDetails.autoSplit);
    const airTravel = footprintDetails.airTravelDistance*CARBON_FOOTPRINT_FACTORS.airTravel[footprintDetails.airMode];

    console.log(electricityFootprint);
    console.log(fuelFootprint);
    console.log(carFootprint);
    console.log(bikeFootprint);
    console.log(busFootprint);
    console.log(trainFootprint);
    console.log(autoFootprint);
    console.log(airTravel);

    const footprintValueDetails = {
        totalValue:parseFloat((electricityFootprint + fuelFootprint + carFootprint + bikeFootprint + busFootprint + trainFootprint + autoFootprint + airTravel).toFixed(2)),
        electricityFootprint:parseFloat((electricityFootprint).toFixed(2)),
        fuelFootprint:parseFloat(fuelFootprint.toFixed(2)),
        vehicularFootprint: parseFloat((carFootprint + bikeFootprint).toFixed(2)),
        publicTransportFootprint:  parseFloat((busFootprint + trainFootprint + autoFootprint).toFixed(2)),
        airTravelFootprint: parseFloat(airTravel.toFixed(2))
    }

    return footprintValueDetails;
}

export default computeCarbonFootprint;