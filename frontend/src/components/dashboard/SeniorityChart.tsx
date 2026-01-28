import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { getChartColor } from './chartColors';

interface SeniorityChartProps {
    data: Array<{ name: string; value: number }>;
    onClick?: (data: { name: string; value: number }) => void;
}

export function SeniorityChart({ data, onClick }: SeniorityChartProps) {
    // Filter out 0 values if desired, or keep them to show gaps? 
    // Usually standard to show all buckets 0-10+ for comparison even if empty.
    // SalaryChart filters > 0. Let's do the same for cleaner look, or maybe show all for continuity.
    // User asked for "interval of 1 year", preserving order is important.
    // If we filter, we lose the "scale". Let's KEEP all data points so "0, 1, 2... 10+" shows the full distribution.
    // Wait, SalaryChart filters. But Salary ranges are categories. 
    // Seniority is a timeline. 
    // I will KEEP all data to show the distribution shape correctly.
    const chartData = data;

    return (
        <Card className="col-span-1 h-full min-w-0">
            <CardHeader>
                <CardTitle className="text-base font-semibold text-foreground font-heading">Years of Experience</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[250px] w-full min-w-0">
                    <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                        <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                            <XAxis
                                dataKey="name"
                                tick={{ fontSize: 12, fill: 'var(--color-muted-foreground)', fontWeight: 500 }}
                                interval={0}
                                angle={-45} // More angle for "0 Years" etc
                                textAnchor="end"
                                height={60}
                            />
                            <YAxis hide />
                            <Tooltip
                                cursor={{ fill: 'var(--color-muted)' }}
                                contentStyle={{
                                  backgroundColor: 'var(--color-popover)',
                                  border: '1px solid var(--color-border)',
                                  borderRadius: '8px',
                                  color: 'var(--color-popover-foreground)',
                                }}
                                itemStyle={{ color: 'var(--color-popover-foreground)' }}
                                labelStyle={{ color: 'var(--color-popover-foreground)' }}
                            />
                            <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={32} animationDuration={300}>
                                {chartData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={getChartColor(4)}
                                        className="cursor-pointer hover:opacity-80 transition-opacity"
                                        onClick={() => onClick && onClick(entry)}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
