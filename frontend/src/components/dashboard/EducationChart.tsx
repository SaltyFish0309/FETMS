import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useTranslation } from "react-i18next";
import { getChartColor } from './chartColors';

interface EducationChartProps {
    data: Array<{ name: string; value: number }>;
    onClick?: (data: { name: string; value: number }) => void;
}

export function EducationChart({ data, onClick }: EducationChartProps) {
    const { t } = useTranslation('dashboard');
    const { t: tTeachers } = useTranslation('teachers');

    const translatedData = data.map(item => ({
        ...item,
        originalName: item.name,
        name: tTeachers(`enums.degree.${item.name.toLowerCase().replace(/\s+/g, '_')}` as string)
    }));

    return (
        <Card className="col-span-1 h-full min-w-0">
            <CardHeader>
                <CardTitle className="text-base font-semibold text-foreground font-heading">{t('charts.education')}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[250px] w-full min-w-0">
                    <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                        <BarChart data={translatedData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="var(--color-border)" />
                            <XAxis type="number" hide />
                            <YAxis
                                dataKey="name"
                                type="category"
                                width={90}
                                tick={{ fontSize: 13, fill: 'var(--color-muted-foreground)', fontWeight: 500 }}
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
                            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20} animationDuration={300}>
                                {translatedData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={getChartColor(index)}
                                        onClick={() => onClick && onClick({ name: entry.originalName, value: entry.value })}
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
