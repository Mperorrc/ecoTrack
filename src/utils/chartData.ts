export const dataArray = [
  {
    labels: ["Person 1", "Person 2", "Person 3", "Person 4"],
    datasets: [
      {
        label: "Average Electricity Footprint (kgCO2)",
        data: [220, 180, 200, 210],  // Example values
        backgroundColor: [
          "rgba(255, 0, 0, 0.5)",  // Red for electricity
          "rgba(255, 255, 0, 0.5)",  // Yellow for electricity
          "rgba(0, 255, 0, 0.5)",  // Green for electricity
          "rgba(0, 0, 255, 0.5)",  // Blue for electricity
        ],
        borderColor: [
          "rgba(255, 0, 0, 1)",  // Red border for electricity
          "rgba(255, 255, 0, 1)",  // Yellow border for electricity
          "rgba(0, 255, 0, 1)",  // Green border for electricity
          "rgba(0, 0, 255, 1)",  // Blue border for electricity
        ],
        borderWidth: 1,
      },
    ],
  },
  {
    labels: ["Person 1", "Person 2", "Person 3", "Person 4"],
    datasets: [
      {
        label: "Average Fuel Footprint (kgCO2)",
        data: [80, 60, 75, 90],  // Example values
        backgroundColor: [
          "rgba(255, 165, 0, 0.5)",  // Orange for fuel
          "rgba(255, 255, 0, 0.5)",  // Yellow for fuel
          "rgba(0, 255, 255, 0.5)",  // Cyan for fuel
          "rgba(255, 105, 180, 0.5)",  // HotPink for fuel
        ],
        borderColor: [
          "rgba(255, 165, 0, 1)",  // Orange border for fuel
          "rgba(255, 255, 0, 1)",  // Yellow border for fuel
          "rgba(0, 255, 255, 1)",  // Cyan border for fuel
          "rgba(255, 105, 180, 1)",  // HotPink border for fuel
        ],
        borderWidth: 1,
      },
    ],
  },
  {
    labels: ["Person 1", "Person 2", "Person 3", "Person 4"],
    datasets: [
      {
        label: "Personal Vehicular Footprint (kgCO2)",
        data: [150, 130, 140, 160],  // Example values
        backgroundColor: [
          "rgba(0, 128, 0, 0.5)",  // Green for personal vehicle
          "rgba(34, 139, 34, 0.5)",  // Forest Green for personal vehicle
          "rgba(60, 179, 113, 0.5)",  // Medium Sea Green for personal vehicle
          "rgba(46, 139, 87, 0.5)",  // Sea Green for personal vehicle
        ],
        borderColor: [
          "rgba(0, 128, 0, 1)",  // Green border for personal vehicle
          "rgba(34, 139, 34, 1)",  // Forest Green border for personal vehicle
          "rgba(60, 179, 113, 1)",  // Medium Sea Green border for personal vehicle
          "rgba(46, 139, 87, 1)",  // Sea Green border for personal vehicle
        ],
        borderWidth: 1,
      },
    ],
  },
  {
    labels: ["Person 1", "Person 2", "Person 3", "Person 4"],
    datasets: [
      {
        label: "Public Transport Footprint (kgCO2)",
        data: [50, 40, 45, 55],  // Example values
        backgroundColor: [
          "rgba(0, 0, 255, 0.5)",  // Blue for public transport
          "rgba(0, 128, 255, 0.5)",  // Dodger Blue for public transport
          "rgba(0, 191, 255, 0.5)",  // Deep Sky Blue for public transport
          "rgba(135, 206, 250, 0.5)",  // Light Sky Blue for public transport
        ],
        borderColor: [
          "rgba(0, 0, 255, 1)",  // Blue border for public transport
          "rgba(0, 128, 255, 1)",  // Dodger Blue border for public transport
          "rgba(0, 191, 255, 1)",  // Deep Sky Blue border for public transport
          "rgba(135, 206, 250, 1)",  // Light Sky Blue border for public transport
        ],
        borderWidth: 1,
      },
    ],
  },
  {
    labels: ["Person 1", "Person 2", "Person 3", "Person 4"],
    datasets: [
      {
        label: "Air Travel Footprint (kgCO2)",
        data: [100, 120, 90, 110],  // Example values
        backgroundColor: [
          "rgba(255, 105, 180, 0.5)",  // HotPink for air travel
          "rgba(255, 20, 147, 0.5)",  // DeepPink for air travel
          "rgba(255, 182, 193, 0.5)",  // LightPink for air travel
          "rgba(255, 0, 255, 0.5)",  // Magenta for air travel
        ],
        borderColor: [
          "rgba(255, 105, 180, 1)",  // HotPink border for air travel
          "rgba(255, 20, 147, 1)",  // DeepPink border for air travel
          "rgba(255, 182, 193, 1)",  // LightPink border for air travel
          "rgba(255, 0, 255, 1)",  // Magenta border for air travel
        ],
        borderWidth: 1,
      },
    ],
  },
  {
    labels: ["Person 1", "Person 2", "Person 3", "Person 4"],
    datasets: [
      {
        label: "Total Footprint (kgCO2)",
        data: [600, 510, 550, 630],  // Example values for total footprint
        backgroundColor: [
          "rgba(0, 0, 0, 0.5)",  // Black for total footprint
          "rgba(128, 128, 128, 0.5)",  // Gray for total footprint
          "rgba(169, 169, 169, 0.5)",  // Dark Gray for total footprint
          "rgba(105, 105, 105, 0.5)",  // Dim Gray for total footprint
        ],
        borderColor: [
          "rgba(0, 0, 0, 1)",  // Black border for total footprint
          "rgba(128, 128, 128, 1)",  // Gray border for total footprint
          "rgba(169, 169, 169, 1)",  // Dark Gray border for total footprint
          "rgba(105, 105, 105, 1)",  // Dim Gray border for total footprint
        ],
        borderWidth: 1,
      },
    ],
  },
];


export const monthlyData = {
  labels: ["Jan", "Feb", "March", "April", "May"],
  datasets: [
    {
      label: "Monthly Carbon Footprint (in tCO2)",
      data: [5, 1.5, 2, 4, 3],
      backgroundColor: [
        "green",
        "blue",
        "indigo",
        "maroon",
        "yellow",
      ],
      borderColor: [
        "rgba(128, 0, 128, 1)",
        "rgba(138, 43, 226, 1)",
        "rgba(147, 112, 219, 1)",
        "rgba(153, 50, 204, 1)",
        "rgba(158, 78, 196, 1)",
      ],
      borderWidth: 1,
    },
  ],
};

export const monthlyChartDatasets = [
  {
    data: [320, 360, 100, 150], 
    backgroundColor: ['#FB8C00', '#8E24AA', '#3949AB', '#00ACC1'], // Darker neon-style colors
    borderColor: '#212121', // Dark gray border
    borderWidth: 1,
  },
];
export const monthlyChartLabels = ['Fuel', 'Electricity', 'Land Transport', 'Air Travel'];

export const familyChartLabels = ['John (Parent 1)', 'Sarah (Parent 2)', 'Emily (Kid 1)', 'Jack (Kid 2)'];

export const familyChartDatasets = [
  {
    data: [250, 230, 120, 110], 
    backgroundColor: ['#1E88E5', '#D81B60', '#FFC107', '#43A047'], // Muted dark theme colors
    borderColor: '#212121', // Dark gray border
    borderWidth: 1,
  },
];


