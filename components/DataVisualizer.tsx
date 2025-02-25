"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDatastore } from "@/contexts/DatastoreContext";
import { Loader2 } from "lucide-react";

type ChartData = {
  labels: string[];
  values: number[];
};

export function DataVisualizer() {
  const { selectedDatastore, entryData } = useDatastore();
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const pieChartRef = useRef<HTMLDivElement>(null);
  const lineChartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!entryData) return;
    
    setIsLoading(true);
    
    try {
      const data = JSON.parse(entryData);
      
      // Extract numeric values for visualization
      if (typeof data === 'object' && data !== null) {
        const numericEntries = Object.entries(data)
          .filter(([_, value]) => typeof value === 'number')
          .slice(0, 10); // Take first 10 for simplicity
        
        if (numericEntries.length > 0) {
          setChartData({
            labels: numericEntries.map(([key]) => key),
            values: numericEntries.map(([_, value]) => value as number)
          });
        } else {
          setChartData(null);
        }
      } else {
        setChartData(null);
      }
    } catch (error) {
      console.error("Failed to parse data for visualization", error);
      setChartData(null);
    } finally {
      setIsLoading(false);
    }
  }, [entryData]);

  // Draw pie chart
  useEffect(() => {
    if (!chartData || !pieChartRef.current) return;
    
    const canvas = document.createElement('canvas');
    canvas.width = pieChartRef.current.clientWidth;
    canvas.height = pieChartRef.current.clientHeight;
    pieChartRef.current.innerHTML = '';
    pieChartRef.current.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const total = chartData.values.reduce((sum, value) => sum + value, 0);
    let startAngle = 0;
    
    // Generate colors
    const colors = chartData.labels.map((_, i) => {
      const hue = (i * 137.5) % 360; // Golden angle approximation
      return `hsl(${hue}, 70%, 60%)`;
    });
    
    // Draw pie slices
    chartData.values.forEach((value, i) => {
      const sliceAngle = (value / total) * 2 * Math.PI;
      const endAngle = startAngle + sliceAngle;
      
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2, canvas.height / 2);
      ctx.arc(
        canvas.width / 2, 
        canvas.height / 2, 
        Math.min(canvas.width, canvas.height) / 2 - 10, 
        startAngle, 
        endAngle
      );
      ctx.closePath();
      
      ctx.fillStyle = colors[i];
      ctx.fill();
      
      startAngle = endAngle;
    });
    
    // Draw legend
    const legendEl = document.createElement('div');
    legendEl.className = 'absolute bottom-2 left-2 right-2 flex flex-wrap gap-2 justify-center';
    
    chartData.labels.forEach((label, i) => {
      const item = document.createElement('div');
      item.className = 'flex items-center text-xs';
      
      const colorBox = document.createElement('div');
      colorBox.className = 'w-3 h-3 mr-1';
      colorBox.style.backgroundColor = colors[i];
      
      const labelText = document.createElement('span');
      labelText.textContent = `${label}: ${chartData.values[i]}`;
      
      item.appendChild(colorBox);
      item.appendChild(labelText);
      legendEl.appendChild(item);
    });
    
    pieChartRef.current.appendChild(legendEl);
  }, [chartData, pieChartRef.current]);

  // Draw line chart
  useEffect(() => {
    if (!chartData || !lineChartRef.current) return;
    
    const canvas = document.createElement('canvas');
    canvas.width = lineChartRef.current.clientWidth;
    canvas.height = lineChartRef.current.clientHeight - 20;
    lineChartRef.current.innerHTML = '';
    lineChartRef.current.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const maxValue = Math.max(...chartData.values);
    const padding = 30;
    const chartWidth = canvas.width - padding * 2;
    const chartHeight = canvas.height - padding * 2;
    
    // Draw axes
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, canvas.height - padding);
    ctx.lineTo(canvas.width - padding, canvas.height - padding);
    ctx.strokeStyle = '#888';
    ctx.stroke();
    
    // Draw line
    ctx.beginPath();
    chartData.values.forEach((value, i) => {
      const x = padding + (i / (chartData.values.length - 1)) * chartWidth;
      const y = canvas.height - padding - (value / maxValue) * chartHeight;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.strokeStyle = 'rgb(99, 102, 241)';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw points
    chartData.values.forEach((value, i) => {
      const x = padding + (i / (chartData.values.length - 1)) * chartWidth;
      const y = canvas.height - padding - (value / maxValue) * chartHeight;
      
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      ctx.fillStyle = 'rgb(99, 102, 241)';
      ctx.fill();
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 1;
      ctx.stroke();
    });
    
    // Draw x-axis labels
    chartData.labels.forEach((label, i) => {
      const x = padding + (i / (chartData.values.length - 1)) * chartWidth;
      ctx.fillStyle = '#888';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(label, x, canvas.height - padding + 15);
    });
  }, [chartData, lineChartRef.current]);

  if (!selectedDatastore || !entryData) {
    return null;
  }

  return (
    <Card className="shadow-sm mt-6">
      <CardHeader>
        <CardTitle className="text-lg">Data Visualization</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="bar">
          <TabsList className="mb-4">
            <TabsTrigger value="bar">Bar Chart</TabsTrigger>
            <TabsTrigger value="pie">Pie Chart</TabsTrigger>
            <TabsTrigger value="line">Line Chart</TabsTrigger>
          </TabsList>
          
          <TabsContent value="bar">
            {isLoading ? (
              <div className="flex justify-center items-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-primary/70" />
              </div>
            ) : chartData ? (
              <div className="h-40 flex items-end justify-around gap-2">
                {chartData.values.map((value, index) => {
                  const height = `${Math.max(10, (value / Math.max(...chartData.values)) * 100)}%`;
                  return (
                    <div key={index} className="flex flex-col items-center">
                      <div 
                        className="w-8 bg-primary/80 hover:bg-primary transition-all rounded-t"
                        style={{ height }}
                        title={`${chartData.labels[index]}: ${value}`}
                      />
                      <div className="text-xs mt-1 truncate w-12 text-center">
                        {chartData.labels[index]}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center text-muted-foreground h-40 flex items-center justify-center">
                No numeric data available for visualization
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="pie">
            {isLoading ? (
              <div className="flex justify-center items-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-primary/70" />
              </div>
            ) : chartData ? (
              <div ref={pieChartRef} className="h-40 relative">
                {/* Pie chart will be rendered here */}
              </div>
            ) : (
              <div className="text-center text-muted-foreground h-40 flex items-center justify-center">
                No numeric data available for visualization
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="line">
            {isLoading ? (
              <div className="flex justify-center items-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-primary/70" />
              </div>
            ) : chartData ? (
              <div ref={lineChartRef} className="h-40 relative">
                {/* Line chart will be rendered here */}
              </div>
            ) : (
              <div className="text-center text-muted-foreground h-40 flex items-center justify-center">
                No numeric data available for visualization
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
} 