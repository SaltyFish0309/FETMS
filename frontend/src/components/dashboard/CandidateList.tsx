
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { User, DollarSign, Clock } from "lucide-react";

interface Candidate {
    _id: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
    pipelineStage: string;
    salary?: number;
    seniority?: string;
}

interface CandidateListProps {
    candidates: Candidate[];
    isLoading?: boolean;
    hasFilters: boolean;
}

export function CandidateList({ candidates, hasFilters }: CandidateListProps) {
    const navigate = useNavigate();

    return (
        <Card className="h-[600px] xl:h-full flex flex-col border-none shadow-sm">
            <CardHeader className="pb-3 border-b">
                <CardTitle className="text-base font-semibold text-foreground font-heading flex items-center justify-between">
                    <span>Qualified Candidates</span>
                    {hasFilters && (
                        <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                            {candidates.length} Found
                        </Badge>
                    )}
                </CardTitle>
                <p className="text-xs text-muted-foreground">Teachers matching current filters</p>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-hidden min-h-0">
                <ScrollArea className="h-full">
                    {!hasFilters ? (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-6 text-center space-y-4">
                            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                                <User className="h-8 w-8 opacity-30" />
                            </div>
                            <div>
                                <p className="font-medium text-foreground">Ready to Search</p>
                                <p className="text-xs mt-1 max-w-[240px] mx-auto">Select segments on the charts or apply filters to see matching candidates here.</p>
                            </div>
                        </div>
                    ) : candidates.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-6 text-center">
                            <User className="h-8 w-8 mb-2 opacity-50" />
                            <p className="text-sm">No candidates match these filters.</p>
                        </div>
                    ) : (
                        <div className="py-2">
                            {candidates.map((candidate) => (
                                <div
                                    key={candidate._id}
                                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors group mx-2 my-1"
                                    onClick={() => navigate(`/teachers/${candidate._id}`)}
                                >
                                    <Avatar className="h-10 w-10 border border-border">
                                        <AvatarImage src={`http://localhost:5000${candidate.profilePicture}`} alt={candidate.firstName} />
                                        <AvatarFallback className="bg-blue-100 text-blue-700">
                                            {candidate.firstName[0]}{candidate.lastName[0]}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-medium text-sm text-foreground group-hover:text-blue-600 truncate">
                                            {candidate.firstName} {candidate.lastName}
                                        </h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Badge variant="outline" className="text-[10px] px-1 py-0 h-5 border-border text-muted-foreground font-normal">
                                                {candidate.pipelineStage}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                                            {candidate.salary && (
                                                <div className="flex items-center gap-1">
                                                    <DollarSign className="h-3 w-3" />
                                                    {(candidate.salary / 1000).toFixed(0)}k
                                                </div>
                                            )}
                                            {candidate.seniority && (
                                                <div className="flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    {candidate.seniority.replace(/year\(s\)/i, 'Yr').replace(/month\(s\)/i, 'Mo')}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
