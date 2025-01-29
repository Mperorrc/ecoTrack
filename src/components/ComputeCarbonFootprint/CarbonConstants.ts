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
            "Petrol": 0.144,
            "Diesel": 0.124, 
            "CNG": 0.089, 
            "LPG": 0.101, 
            "Electricity": 0.1, 
        },
        bike: {
            "Petrol": 0.081 ,
            "Diesel": 0.067, 
            "CNG": 0.044, 
            "LPG": 0.050, 
            "Electricity": 0.11, 
        },
        bus: 0.016,         
        train: 0.45,       
        auto: 0.113,        
    },
    airTravel: {
        "Economy": 0.16,    
        "Premium Economy":0.23,
        "Business":0.37,
        "First":0.75
    },
    traffic:{
        "rushHours":1.15,
        "weekend":0.9
    },

};