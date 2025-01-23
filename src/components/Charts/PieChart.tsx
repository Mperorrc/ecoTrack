import React, { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, ChartData, Title } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels'; // Import the DataLabels plugin
import { color } from 'chart.js/helpers';

ChartJS.register(ArcElement, Tooltip, Legend, Title, ChartDataLabels); // Register the DataLabels plugin

type PieChartProps = {
    ChartDatasets: any[];
    chartLabels: string[];
    legendPosition?: string;
    titleText?: string;
};

const PieChart: React.FC<PieChartProps> = ({ titleText, chartLabels, legendPosition, ChartDatasets }) => {
    const [chartData, setChartData] = useState<ChartData<'pie'>>({
        labels: [],
        datasets: [],
    });
    const [chartOptions, setChartOptions] = useState({});

    useEffect(() => {
        setChartData({
            labels: chartLabels,
            datasets: ChartDatasets,
        });

        setChartOptions({
            responsive: true,
            plugins: {
                legend: {
                    display: true, // Display the legend (region labels)
                    position: legendPosition || 'bottom', // Set legend position (default: bottom)
                    labels: {
                        color: 'white', // Set the legend text color to white
                    },
                },
                title: {
                    display: titleText && titleText.length > 0,
                    text: titleText || '',
                    color: 'white',
                },
                tooltip: {
                    callbacks: {
                        label: function (tooltipItem: any) {
                            const dataset = tooltipItem.dataset; 
                            const data = dataset.data; 
                            const total = data.reduce((sum: number, val: number) => sum + val, 0); 
                            const value = data[tooltipItem.dataIndex]; 
                            const percentage = ((value / total) * 100).toFixed(2); 
                            return `${tooltipItem.label || ''}: ${value} (${percentage}%)`; 
                        },
                    },
                },
                datalabels: {
                    display: true, 
                    color: 'white',
                    formatter: (value: number, context: any) => {
                        const dataset = context.chart.data.datasets[0].data;
                        const total = dataset.reduce((sum: number, val: number) => sum + val, 0);
                        const percentage = ((value / total) * 100).toFixed(2);
                        return `${percentage}%`; 
                    },
                    font: {
                        size: 14,
                    },
                },
            },
        });
    }, [ChartDatasets, chartLabels, legendPosition, titleText]);

    return <Pie data={chartData} options={chartOptions} />;
};

export default PieChart;
