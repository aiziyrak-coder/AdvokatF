import React from 'react';

interface LoadingSpinnerProps {
    t: (key: string, replacements?: { [key: string]: string }) => string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ t }) => {
  const messages = React.useMemo(() => [
    t('loading_message_1'),
    t('loading_message_2'),
    t('loading_message_3'),
    t('loading_message_4'),
    t('loading_message_5'),
    t('loading_message_6'),
  ], [t]);
  const [message, setMessage] = React.useState(messages[0]);

  React.useEffect(() => {
    setMessage(messages[0]); // Reset message on language change
    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % messages.length;
      setMessage(messages[index]);
    }, 2500);

    return () => clearInterval(interval);
  }, [messages]);
  

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[var(--bg-primary)]/80 backdrop-blur-sm z-50">
      <div className="relative h-28 w-28 mb-6 scales-of-justice">
         <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Base/Stand */}
            <g className="scales-base">
                <path d="M50 90 V 18" stroke="var(--text-secondary)" strokeWidth="3" strokeLinecap="round"/>
                <path d="M35 90 H 65" stroke="var(--text-secondary)" strokeWidth="3" strokeLinecap="round"/>
                <circle cx="50" cy="20" r="3" fill="var(--accent-primary)"/>
            </g>
            {/* Animated Beam and Pans */}
            <g className="scales-beam">
                <path d="M10 20 H 90" stroke="var(--accent-primary)" strokeWidth="3" strokeLinecap="round"/>
                {/* Hangers */}
                <path d="M15 20 V 30" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round"/>
                <path d="M85 20 V 30" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round"/>
                {/* Pans */}
                <path d="M5 45 C 5 35, 25 35, 25 45" stroke="var(--accent-secondary)" strokeWidth="2.5" />
                <path d="M75 45 C 75 35, 95 35, 95 45" stroke="var(--accent-secondary)" strokeWidth="2.5" />
            </g>
        </svg>
      </div>
      <p className="text-lg font-semibold text-slate-300 transition-opacity duration-500">{message}</p>
      <div className="absolute bottom-4 text-xs text-gray-500">{t('loading_disclaimer')}</div>
    </div>
  );
};