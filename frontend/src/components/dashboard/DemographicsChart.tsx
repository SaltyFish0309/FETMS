import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getChartColor, getGenderColor } from './chartColors';

interface DemographicsChartProps {
  nationalityData: Array<{ name: string; value: number }>;
  genderData: Array<{ name: string; value: number }>;
  hiringStatusData: Array<{ name: string; value: number }>;
  onClick?: (category: string, name: string) => void;
}

export function DemographicsChart({
  nationalityData,
  genderData,
  hiringStatusData,
  onClick
}: DemographicsChartProps) {
  // Sort nationality by value descending, take top 6
  const sortedNationality = [...nationalityData]
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Nationality Chart - Horizontal Bars */}
      <Card className="col-span-1">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-slate-800 font-heading">
            Nationality
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={sortedNationality}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 60, bottom: 5 }}
              >
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  width={55}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: 'none',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Bar
                  dataKey="value"
                  radius={[0, 4, 4, 0]}
                  barSize={20}
                  animationDuration={300}
                >
                  {sortedNationality.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={getChartColor(index)}
                      className="cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => onClick?.('nationality', sortedNationality[index].name)}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Gender Chart - Simple Stats */}
      <Card className="col-span-1">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-slate-800 font-heading">
            Gender Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[220px] flex flex-col justify-center space-y-4">
            {genderData.map((item) => {
              const total = genderData.reduce((sum, g) => sum + g.value, 0);
              const percentage = total > 0 ? Math.round((item.value / total) * 100) : 0;

              return (
                <div
                  key={item.name}
                  className="cursor-pointer hover:bg-slate-50 p-3 rounded-lg transition-colors"
                  onClick={() => onClick?.('gender', item.name)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700">{item.name}</span>
                    <span className="text-sm font-semibold text-slate-800">{item.value}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5">
                    <div
                      className="h-2.5 rounded-full transition-all duration-300"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: getGenderColor(item.name)
                      }}
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{percentage}%</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Hiring Status Chart - Horizontal Bars */}
      <Card className="col-span-1">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-slate-800 font-heading">
            Hiring Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={hiringStatusData}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 80, bottom: 5 }}
              >
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  width={75}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: 'none',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Bar
                  dataKey="value"
                  radius={[0, 4, 4, 0]}
                  barSize={20}
                  animationDuration={300}
                >
                  {hiringStatusData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={getChartColor(index + 2)}
                      className="cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => onClick?.('hiringStatus', entry.name)}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
