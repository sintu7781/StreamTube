import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const TrendsSection = ({ trends }) => {
  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader>
        <CardTitle>Growth Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 text-sm">
          <li>Views Growth: {trends?.viewsGrowth}%</li>
          <li>Subscribers Growth: {trends?.subscribersGrowth}%</li>
          <li>Likes Growth: {trends?.likesGrowth}%</li>
          <li>Comments Growth: {trends?.commentsGrowth}%</li>
        </ul>
      </CardContent>
    </Card>
  );
};

export default TrendsSection;
