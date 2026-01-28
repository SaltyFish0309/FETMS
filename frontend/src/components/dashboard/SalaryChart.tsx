import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { getChartColor } from './chartColors';

interface SalaryChartProps {
    data: Array<{ name: string; value: number }>;
    onClick?: (data: { name: string; value: number }) => void;
}

export function SalaryChart({ data, onClick }: SalaryChartProps) {
    const filteredData = data.filter(d => d.value > 0);

    return (
        <Card className="col-span-1 h-full min-w-0">
            <CardHeader>
                <CardTitle className="text-base font-semibold text-foreground font-heading">Salary Distribution</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[250px] w-full min-w-0">
                    <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                        <BarChart data={filteredData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                            <XAxis
                                dataKey="name"
                                tick={{ fontSize: 12, fill: 'var(--color-muted-foreground)', fontWeight: 500 }}
                                interval={0}
                                angle={-15}
                                textAnchor="end"
                                height={40}
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
                                {filteredData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={getChartColor(2)}
                                        onClick={() => onClick && onClick(entry)}
                                        className="cursor-pointer hover:opacity-80 transition-opacity"
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
