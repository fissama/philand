import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface MemberAvatarProps {
  name: string;
  email: string;
  avatar?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function MemberAvatar({ 
  name, 
  email, 
  avatar, 
  size = "md",
  className 
}: MemberAvatarProps) {
  const sizeClasses = {
    sm: "h-6 w-6 text-xs",
    md: "h-8 w-8 text-sm",
    lg: "h-10 w-10 text-base"
  };

  // Generate initials from name, fallback to email if name is empty
  const displayName = name || email;
  const initials = displayName
    .split(/[\s@]+/) // Split by space or @ for email
    .filter(part => part.length > 0)
    .map(n => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Only show avatar image if avatar URL is not empty/null
  const hasAvatar = avatar && avatar.trim().length > 0;

  return (
    <Avatar className={`${sizeClasses[size]} ${className || ''}`} title={`${name} (${email})`}>
      {hasAvatar && <AvatarImage src={avatar} alt={name} />}
      <AvatarFallback>{initials || '??'}</AvatarFallback>
    </Avatar>
  );
}
