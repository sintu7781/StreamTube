import {
  PieChart,
  Pie,
  Tooltip,
  Cell,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#a29bfe"];

const AudienceDemographics = ({ demographics }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {Object.entries(demographics).map(([key, data]) => (
        <Card key={key} className="rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="capitalize">{key}</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="label"
                  outerRadius={80}
                  fill="#8884d8"
                  label
                >
                  {data.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AudienceDemographics;
