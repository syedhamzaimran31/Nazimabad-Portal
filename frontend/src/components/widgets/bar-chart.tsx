'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import {
  getUniqueMonths,
  filterDataByMonth,
  groupDataByDay,
  generateFullMonthDates,
} from '@/lib/helpers/index'; // Importing helper functions

import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';

import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { BarChartDataProps } from '@/lib/types';

export const description = 'An interactive bar chart';

const chartConfig = {
  // views: {
  //   label: 'Page Views',
  // },
  visitors: {
    label: 'visitors',
    color: 'hsl(var(--chart-1))',
  },
  complaints: {
    label: 'complaints',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig;

export function BarChartData({ visitorsData = [], complaintsData = [] }: BarChartDataProps) {
  const [activeChart, setActiveChart] = useState<keyof typeof chartConfig>('visitors');
  const [selectedMonth, setSelectedMonth] = useState(''); // Store selected month
  // Set default month to current month
  // const [selectedMonth, setSelectedMonth] = useState(() => {
  //   const today = new Date();
  //   return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  // });

  // Get unique months using helper function
  const visitorMonths = useMemo(() => getUniqueMonths(visitorsData, 'visitDate'), [visitorsData]);
  const complaintMonths = useMemo(
    () => getUniqueMonths(complaintsData, 'created_at'),
    [complaintsData],
  );

  const combinedMonths = useMemo(() => {
    const allMonths = [...visitorMonths, ...complaintMonths];
    return Array.from(new Set(allMonths)); // Remove duplicates
  }, [visitorMonths, complaintMonths]);

  useEffect(() => {
    if (combinedMonths.length > 0 && !selectedMonth) {
      setSelectedMonth(combinedMonths[0]); // Set the first month from combinedMonths as default
    }
  }, [combinedMonths, selectedMonth]);

  // Filter visitors by selected month using helper function
  const filteredVisitorsByMonth = useMemo(() => {
    if (selectedMonth === 'all' || !selectedMonth) return visitorsData;
    return filterDataByMonth(visitorsData, selectedMonth, 'visitDate');
  }, [selectedMonth, visitorsData]);

  const filteredComplaintsByMonth = useMemo(() => {
    if (selectedMonth === 'all' || !selectedMonth) return complaintsData;
    return filterDataByMonth(complaintsData, selectedMonth, 'created_at');
  }, [selectedMonth, complaintsData]);

  // Generate full list of dates for the selected month
  const fullMonthDates = useMemo(() => {
    if (!selectedMonth || selectedMonth === 'all') return [];
    return generateFullMonthDates(selectedMonth); // Generate full dates for the month
  }, [selectedMonth]);

  // // Group data by day using helper function
  // const dataByDay = useMemo(() => {
  //   const groupedData = groupDataByDay(filteredVisitorsByMonth, 'visitDate');
  //   return fullMonthDates.map((date) => {
  //     const dayData = groupedData.find((d) => d.date === date) || { visitors: 0 };
  //     return {
  //       date,
  //       visitors: dayData.visitors,
  //     };
  //   });
  // }, [filteredVisitorsByMonth, fullMonthDates]);

  const groupedVisitorsByDay = useMemo(() => {
    const groupedData = groupDataByDay(filteredVisitorsByMonth, 'visitDate');
    console.log(`I am triggered in visitors ${groupedData}`);

    return fullMonthDates.map((date) => {
      const dayData = groupedData.find((d) => d.date === date) || { visitors: 0 };
      return {
        date,
        visitors: dayData.visitors,
        complaints: 0,
      };
    });
  }, [filteredVisitorsByMonth, fullMonthDates]);
  console.log(`groupedVisitorsByDay :${groupedVisitorsByDay}`);

  const groupedComplaintsByDay = useMemo(() => {
    console.log(`I am triggered `);
    const groupedData = groupDataByDay(filteredComplaintsByMonth, 'created_at');
    console.log(`I am triggered in complaints ${groupedData}`);

    return fullMonthDates.map((date) => {
      const dayData = groupedData.find((d) => d.date === date) || { complaints: 0 };
      return {
        date,
        visitors: 0,
        complaints: dayData.complaints || 0,
      };
    });
  }, [filteredComplaintsByMonth, fullMonthDates]);
  console.log(`groupedVisitorsByDay:${groupedComplaintsByDay}`);

  const total = React.useMemo(
    () => ({
      // visitors: chartData.reduce((acc, curr) => acc + curr.visitors, 0),
      visitors: visitorsData.length,
      complaints: complaintsData.length,
    }),
    [visitorsData, complaintsData],
  );
  console.log(visitorsData);
  console.log(complaintsData);

  return (
    <Card>
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
          {/* <CardTitle>Bar Chart - Interactive</CardTitle> */}
          <Select onValueChange={(value) => setSelectedMonth(value)}>
            <SelectTrigger className="w-[280px]">
              {/* Use the selectedMonth value or the first combined month if not selected */}
              <SelectValue placeholder={selectedMonth || combinedMonths[0]}>
                {selectedMonth || combinedMonths[0]} {/* Ensure the value is displayed on reload */}
              </SelectValue>{' '}
            </SelectTrigger>
            <SelectContent>
              {/* <SelectItem value="all">All Months</SelectItem> */}
              {combinedMonths.map((month) => (
                <SelectItem key={month} value={month}>
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <CardDescription>
            Showing total visitors and complaints of all available months
          </CardDescription>
        </div>
        <div className="flex">
          {['visitors', 'complaints'].map((key) => {
            const chart = key as keyof typeof chartConfig;
            return (
              <button
                key={chart}
                data-active={activeChart === chart}
                className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-8 sm:py-6"
                onClick={() => setActiveChart(chart)}
              >
                <span className="text-sm text-muted-foreground">{chartConfig[chart].label}</span>
                <span className="text-lg font-bold leading-none sm:text-3xl">
                  {total[key as keyof typeof total].toLocaleString()}
                </span>
              </button>
            );
          })}
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
          <BarChart
            accessibilityLayer
            data={activeChart === 'visitors' ? groupedVisitorsByDay : groupedComplaintsByDay}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            {/* Show Dates in the footer of chart */}
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                });
              }}
            />

            {/* Show visitors and complaints individual date using tooltip */}
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[150px]"
                  nameKey={activeChart}
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    });
                  }}
                />
              }
            />
            {/* Show chart */}
            <Bar dataKey={activeChart} fill={`var(--color-${activeChart})`} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
