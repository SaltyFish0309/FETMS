import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ImportSettings() {
    const navigate = useNavigate();

    return (
        <div className="container mx-auto py-8">
            <div className="flex items-center gap-4 mb-6">
                <Button variant="ghost" size="icon" onClick={() => navigate('/settings')}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="flex-1">
                    <h1 className="text-3xl font-bold">Data Import</h1>
                    <p className="text-muted-foreground mt-1">
                        Import data from external sources
                    </p>
                </div>
            </div>

            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Bulk Import</CardTitle>
                        <CardDescription>
                            Upload CSV or Excel files to import multiple records at once.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="p-12 text-center border-2 border-dashed rounded-lg bg-muted border-border">
                            <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-muted mb-4">
                                <Upload className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-medium">Coming Soon</h3>
                            <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
                                Bulk import functionality for Teachers and Schools will be available in a future update.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
