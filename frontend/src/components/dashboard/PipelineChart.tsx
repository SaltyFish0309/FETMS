import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell, CartesianGrid, LabelList } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getChartColor } from './chartColors';

interface PipelineChartProps {
    data: Array<{ name: string; value: number; color?: string; id?: string }>;
    onClick?: (data: { name: string; value: number; id?: string }) => void;
}

export function PipelineChart({ data, onClick }: PipelineChartProps) {
    return (
        <Card className="col-span-1 min-w-0 border-none shadow-none">
            <CardHeader className="px-0 pt-0">
                <CardTitle className="text-lg font-semibold text-foreground font-heading">Recruitment Pipeline</CardTitle>
            </CardHeader>
            <CardContent className="px-0 pb-0">
                <div className="h-[300px] w-full min-w-0">
                    <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="var(--color-border)" />
                            <XAxis type="number" hide />
                            <YAxis
                                dataKey="name"
                                type="category"
                                width={120}
                                tick={{ fontSize: 14, fill: 'var(--color-muted-foreground)', fontWeight: 500 }}
                                tickFormatter={(value) => value.length > 10 ? `${value.substring(0, 10)}...` : value}
                                interval={0}
                            />
                            <Tooltip
                                cursor={{ fill: 'transparent' }}
                                contentStyle={{
                                  backgroundColor: 'var(--color-popover)',
                                  border: '1px solid var(--color-border)',
                                  borderRadius: '8px',
                                  color: 'var(--color-popover-foreground)',
                                }}
                                itemStyle={{ color: 'var(--color-popover-foreground)' }}
                                labelStyle={{ color: 'var(--color-popover-foreground)' }}
                            />
                            <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={28} animationDuration={300}>
                                <LabelList dataKey="value" position="right" fontSize={14} fill="var(--color-muted-foreground)" fontWeight={600} />
                                {data.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={entry.color || getChartColor(index)}
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
