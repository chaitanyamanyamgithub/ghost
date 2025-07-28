import { StealthSpeakLogo } from './icons';

interface HeaderProps {
  onLogoClick: () => void;
}

export default function Header({ onLogoClick }: HeaderProps) {
  return (
    <header className="flex-shrink-0 border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div 
            className="flex items-center gap-2 cursor-pointer"
            onClick={onLogoClick}
            title="A seemingly innocent logo"
          >
            <StealthSpeakLogo className="h-7 w-7 text-primary" />
            <span className="text-xl font-semibold tracking-tight text-foreground">
              TechPulse
            </span>
          </div>
          <div className="text-sm text-muted-foreground">
            Your daily dose of tech and AI insights.
          </div>
        </div>
      </div>
    </header>
  );
}
