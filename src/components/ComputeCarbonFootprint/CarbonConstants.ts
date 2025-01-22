export const CARBON_FOOTPRINT_FACTORS = {
    electricity: {
        nonRenewable: 0.81,
        renewable: 0.0267,
    },
    fuels: {
        lpg: 1.51,
        naturalGas: 0.185,   
        cookingOil: 2.52, 
    },
    vehicles: {
        car: {
            "Petrol": 2.31,
            "Diesel": 2.68, 
            "CNG": 2.75, 
            "LPG": 1.51, 
            "Electricity": 0.73, 
        },
        bike: {
            "Petrol": 2.31,
            "Diesel": 2.68, 
            "CNG": 2.75, 
            "LPG": 1.51, 
            "Electricity": 0.73, 
        },
        bus: 0.016,         
        train: 0.45,       
        auto: 0.193,        
    },
    airTravel: {
        "Economy": 0.16,    
        "Premium Economy":0.23,
        "Business":0.37,
        "First":0.75
    }
};