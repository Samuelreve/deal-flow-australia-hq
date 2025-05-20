
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserProfile } from "@/types/auth";

interface ProfessionalCardProps {
  professional: UserProfile;
  onContactClick?: (professional: UserProfile) => void;
}

const ProfessionalCard: React.FC<ProfessionalCardProps> = ({ professional, onContactClick }) => {
  const navigate = useNavigate();
  
  const getNameInitials = (name: string) => {
    if (!name) return '?';
    return name.split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  const specializations = professional.professional_specializations || [];
  
  const handleCardClick = () => {
    navigate(`/professionals/${professional.id}`);
  };

  return (
    <Card className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow" onClick={handleCardClick}>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12">
            {professional.avatar_url ? (
              <AvatarImage src={professional.avatar_url} alt={professional.name} />
            ) : (
              <AvatarFallback>{getNameInitials(professional.name)}</AvatarFallback>
            )}
          </Avatar>
          <div>
            <CardTitle className="text-lg">{professional.name}</CardTitle>
            <CardDescription>{professional.professional_headline || 'Professional'}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        {professional.professional_bio && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-3">{professional.professional_bio}</p>
        )}
        
        {professional.professional_firm_name && (
          <div className="text-sm mb-2">
            <span className="font-medium">Firm: </span>
            {professional.professional_firm_name}
          </div>
        )}
        
        {professional.professional_location && (
          <div className="text-sm mb-3">
            <span className="font-medium">Location: </span>
            {professional.professional_location}
          </div>
        )}
        
        {Array.isArray(specializations) && specializations.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {specializations.slice(0, 3).map((spec, index) => (
              <Badge key={index} variant="secondary">{spec}</Badge>
            ))}
            {specializations.length > 3 && (
              <Badge variant="outline">+{specializations.length - 3}</Badge>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end pt-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={(e) => {
            e.stopPropagation(); // Prevent card click navigation
            onContactClick && onContactClick(professional);
          }}
        >
          Contact
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProfessionalCard;
