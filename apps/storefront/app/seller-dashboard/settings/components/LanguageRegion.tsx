import { Button } from '@/components/animate-ui/components/buttons/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Globe } from 'lucide-react';


const LanguageRegion = () => {
  return (
    <div>
          <Card className="w-full shadow-md">
      <CardHeader>
        <CardTitle className="text-lg flex  font-normal items-center gap-3">
          <Globe  className="text-chart-6" />
         <p>
           Language & Region
         </p>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Full Name */}
        <div className="space-y-2">
          <Label htmlFor="name">Language</Label>
          <Input
            id="name"
            defaultValue="Language"
            className="bg-muted"
          />
        </div>

        {/* Email */}
        <div className="space-y-3">
          <Label htmlFor="">Currency</Label>
          <Input
            id=""
            type="text"
            defaultValue="USD$"
            className="bg-muted"
          />
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <Label htmlFor="">Time Zone</Label>
          <Input
            id=""
            defaultValue="GMT (UTC+0)"
            className="bg-muted"
          />
        </div>

        {/* Button */}
        <Button className="w-full bg-chart-6 hover:bg-chart-6/70 text-card ">
          Updated Prefarance
        </Button>
      </CardContent>
    </Card>
    </div>
  )
}

export default LanguageRegion;