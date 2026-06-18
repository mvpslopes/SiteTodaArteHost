import { LOGO } from '../constants/branding';

interface SplashScreenProps {
  fading?: boolean;
}

export default function SplashScreen({ fading }: SplashScreenProps) {
  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center transition-opacity duration-500 ${
        fading ? 'pointer-events-none opacity-0' : 'opacity-100'
      }`}
    >
      <div className="absolute inset-0 bg-nacional-radial" />
      <div className="absolute inset-4 rounded-sm border border-white/20 sm:inset-8" />

      <div className="relative z-10 flex flex-col items-center px-8 text-center">
        <div className="animate-splash-logo mb-8 w-full max-w-md px-4 sm:max-w-lg">
          <img
            src={LOGO}
            alt="43ª Exposição Nacional do Cavalo Mangalarga Marchador"
            className="mx-auto h-auto w-full max-w-[420px] object-contain drop-shadow-2xl"
          />
        </div>

        <p className="font-serif text-lg tracking-wide text-nacional-gold sm:text-xl">
          Organização Financeira
        </p>
        <p className="mt-1 text-sm text-white/60">Nacional 2026</p>

        <div className="mt-10 flex items-center gap-2">
          <span className="h-2 w-2 animate-bounce rounded-full bg-nacional-gold [animation-delay:0ms]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-nacional-gold [animation-delay:150ms]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-nacional-gold [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
}
