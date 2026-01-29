import React from 'react';

interface IconProps {
    className?: string;
}

const defaultProps = {
    className: "h-6 w-6",
    fill: "none",
    viewBox: "0 0 24 24",
    stroke: "currentColor",
    strokeWidth: 1.5,
};

export const GlobeIcon: React.FC<IconProps> = ({ className }) => (
  <svg {...defaultProps} className={className || defaultProps.className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

// Existing Icons
export const AnalysisIcon: React.FC<IconProps> = ({ className }) => (
    <svg {...defaultProps} className={className || defaultProps.className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
    </svg>
);

export const DebateIcon: React.FC<IconProps> = ({ className }) => (
    <svg {...defaultProps} className={className || defaultProps.className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
    </svg>
);
export const StrategyIcon: React.FC<IconProps> = ({ className }) => (
    <svg {...defaultProps} className={className || defaultProps.className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
    </svg>
);
export const HistoryIcon: React.FC<IconProps> = ({ className }) => (
    <svg {...defaultProps} className={className || defaultProps.className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);
export const LogoutIcon: React.FC<IconProps> = ({ className }) => (
    <svg {...defaultProps} className={className || defaultProps.className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
    </svg>
);
export const ScaleIcon: React.FC<IconProps> = ({ className }) => (
  <svg {...defaultProps} className={className || defaultProps.className} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.153.24c-1.119 0-2.235-.34-3.218-.99-1.396-.92-2.936-2.033-4.483-3.286C5.454 9.06 3 7.35 3 7.35s2.454 1.71 5.25 3.367c1.547 1.253 3.087 2.366 4.483 3.286 1.09.722 2.253 1.05 3.42 1.05.759 0 1.503-.12 2.21-.357.482-.174.71-.703.59-1.202L18.75 4.97z" />
  </svg>
);
export const LightBulbIcon: React.FC<IconProps> = ({ className }) => (
    <svg {...defaultProps} className={className || defaultProps.className} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.311a7.5 7.5 0 01-3.75 0M12 12.75h.007v.008H12v-.008z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9z" />
    </svg>
);
export const ShieldCheckIcon: React.FC<IconProps> = ({ className }) => (
    <svg {...defaultProps} className={className || defaultProps.className} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.286z" />
    </svg>
);
export const UserGroupIcon: React.FC<IconProps> = ({ className }) => (
    <svg {...defaultProps} className={className || defaultProps.className} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m-7.5-2.962c.57-1.002 1.63-1.63 2.82-1.866M9 14.25a3 3 0 100-6 3 3 0 000 6z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 14.25c-2.43 0-4.68.63-6.51 1.755c-1.83 1.125-2.99 2.94-2.99 4.995V21h19.5v-.01c0-2.055-1.16-3.87-2.99-4.995C16.68 14.88 14.43 14.25 12 14.25z" />
    </svg>
);
export const ExclamationIcon: React.FC<IconProps> = ({ className }) => (
    <svg {...defaultProps} className={className || defaultProps.className} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
);
export const CopyIcon: React.FC<IconProps> = ({ className }) => (
    <svg {...defaultProps} className={className || defaultProps.className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.03 1.125 0 1.13.094 1.976 1.057 1.976 2.192V7.5m-9 3v5.25A2.25 2.25 0 006.75 18h10.5a2.25 2.25 0 002.25-2.25V10.5" />
    </svg>
);
export const CheckIcon: React.FC<IconProps> = ({ className }) => (
    <svg {...defaultProps} className={className || defaultProps.className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
);
export const SearchIcon: React.FC<IconProps> = ({ className }) => (
    <svg {...defaultProps} className={className || defaultProps.className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
);
export const EyeIcon: React.FC<IconProps> = ({ className }) => (
    <svg {...defaultProps} className={className || defaultProps.className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178a1.012 1.012 0 010 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);
export const DocumentTextIcon: React.FC<IconProps> = ({ className }) => (
    <svg {...defaultProps} className={className || defaultProps.className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
);
export const UsersIcon: React.FC<IconProps> = ({ className }) => (
    <svg {...defaultProps} className={className || defaultProps.className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.125-1.584 11.258 11.258 0 00-2.625-2.25M15 19.128v-3.873c.03-.037.06-.073.09-.111a9.364 9.364 0 003.14-1.636 14.96 14.96 0 00-2.25-3.232 9.39 9.39 0 00-2.625-1.21 9.363 9.363 0 00-3.14 1.636 14.96 14.96 0 00-2.25-3.232 9.39 9.39 0 00-2.625 1.21 9.363 9.363 0 00-3.14-1.636 14.96 14.96 0 00-2.25-3.232 9.38 9.38 0 002.625 2.25 9.337 9.337 0 004.125 1.584 9.38 9.38 0 002.625-.372M15 19.128c-1.236.632-2.59.948-3.998.948s-2.762-.316-3.998-.948" />
    </svg>
);
export const DownloadIcon: React.FC<IconProps> = ({ className }) => (
    <svg {...defaultProps} className={className || defaultProps.className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
);
export const UploadIcon: React.FC<IconProps> = ({ className }) => (
    <svg {...defaultProps} className={className || defaultProps.className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
    </svg>
);
export const ThumbUpIcon: React.FC<IconProps> = ({ className }) => (
    <svg {...defaultProps} className={className || defaultProps.className} fill="currentColor" strokeWidth="0">
        <path d="M7.47,20.46 L7.47,20.46 C6.93,20.46 6.48,20.24 6.17,19.86 C5.88,19.5 5.76,19.03 5.86,18.59 L6.5,15.02 L3.66,15.02 C2.52,15.02 1.56,14.07 1.55,12.93 C1.55,12.93 1.55,12.92 1.55,12.92 L1.55,12.92 L1.56,12.85 C1.62,12.43 1.83,12.05 2.15,11.78 L10.14,5.24 C10.49,4.95 10.95,4.84 11.4,4.95 C11.85,5.06 12.22,5.38 12.38,5.8 L13.16,8.53 L18.42,8.53 C19.03,8.53 19.6,8.84 19.9,9.37 C20.2,9.9 20.18,10.54 19.85,11.05 L16.88,15.82 C16.56,16.34 16.03,16.67 15.44,16.67 L10.29,16.67 L9.63,20.08 C9.57,20.3 9.4,20.46 9.19,20.46 L7.47,20.46 Z M11.16,6.54 L3.83,12.48 C3.68,12.6 3.59,12.76 3.57,12.93 C3.57,12.98 3.6,13.02 3.64,13.02 L7.4,13.02 C7.96,13.02 8.42,13.43 8.5,13.98 L9.2,17.77 L9.4,18.46 L15.44,18.46 C15.48,18.46 15.52,18.45 15.55,18.42 C15.57,18.4 15.6,18.36 15.61,18.33 L18.58,13.56 C18.75,13.27 18.76,12.93 18.62,12.65 C18.48,12.37 18.2,12.19 17.9,12.19 L12.3,12.19 C11.74,12.19 11.28,11.78 11.2,11.23 L10.33,8.19 L11.16,6.54 Z" />
    </svg>
);
export const ThumbDownIcon: React.FC<IconProps> = ({ className }) => (
    <svg {...defaultProps} className={className || defaultProps.className} fill="currentColor" strokeWidth="0">
        <path d="M16.53,3.54 L16.53,3.54 C17.07,3.54 17.52,3.76 17.83,4.14 C18.12,4.5 18.24,4.97 18.14,5.41 L17.5,8.98 L20.34,8.98 C21.48,8.98 22.44,9.93 22.45,11.07 C22.45,11.07 22.45,11.08 22.45,11.08 L22.45,11.08 L22.44,11.15 C22.38,11.57 22.17,11.95 21.85,12.22 L13.86,18.76 C13.51,19.05 13.05,19.16 12.6,19.05 C12.15,18.94 11.78,18.62 11.62,18.2 L10.84,15.47 L5.58,15.47 C4.97,15.47 4.4,15.16 4.1,14.63 C3.8,14.1 3.82,13.46 4.15,12.95 L7.12,8.18 C7.44,7.66 7.97,7.33 8.56,7.33 L13.71,7.33 L14.37,3.92 C14.43,3.7 14.6,3.54 14.81,3.54 L16.53,3.54 Z M12.84,17.46 L20.17,11.52 C20.32,11.4 20.41,11.24 20.43,11.07 C20.43,11.02 20.4,10.98 20.36,10.98 L16.6,10.98 C16.04,10.98 15.58,10.57 15.5,10.02 L14.8,6.23 L14.6,5.54 L8.56,5.54 C8.52,5.54 8.48,5.55 8.45,5.58 C8.43,5.6 8.4,5.64 8.39,5.67 L5.42,10.44 C5.25,10.73 5.24,11.07 5.38,11.35 C5.52,11.63 5.8,11.81 6.1,11.81 L11.7,11.81 C12.26,11.81 12.72,12.22 12.8,12.77 L13.67,15.81 L12.84,17.46 Z" />
    </svg>
);
export const XMarkIcon: React.FC<IconProps> = ({ className }) => (
    <svg {...defaultProps} className={className || defaultProps.className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);
export const SunIcon: React.FC<IconProps> = ({ className }) => (
    <svg {...defaultProps} className={className || defaultProps.className} fill="currentColor" strokeWidth="0">
       <path d="M12,9c-1.65,0-3,1.35-3,3s1.35,3,3,3s3-1.35,3-3S13.65,9,12,9z M12,13c-0.55,0-1-0.45-1-1s0.45-1,1-1s1,0.45,1,1 S12.55,13,12,13z M2.15,11.5h-1.6c-0.28,0-0.5,0.22-0.5,0.5s0.22,0.5,0.5,0.5h1.6c0.28,0,0.5-0.22,0.5-0.5S2.43,11.5,2.15,11.5z M22,11.5h-1.6c-0.28,0-0.5,0.22-0.5,0.5s0.22,0.5,0.5,0.5H22c0.28,0,0.5-0.22,0.5-0.5S22.28,11.5,22,11.5z M12,20.45 c-0.28,0-0.5,0.22-0.5,0.5v1.6c0,0.28,0.22,0.5,0.5,0.5s0.5-0.22,0.5-0.5v-1.6C12.5,20.67,12.28,20.45,12,20.45z M12,1.55 c-0.28,0-0.5,0.22-0.5,0.5v1.6c0,0.28,0.22,0.5,0.5,0.5s0.5-0.22,0.5-0.5v-1.6C12.5,1.77,12.28,1.55,12,1.55z M4.61,18.01 l-1.13,1.13c-0.2,0.2-0.2,0.51,0,0.71c0.2,0.2,0.51,0.2,0.71,0l1.13-1.13c0.2-0.2,0.2-0.51,0-0.71C5.12,17.81,4.81,17.81,4.61,18.01z M19.39,4.22c-0.2-0.2-0.51-0.2-0.71,0l-1.13,1.13c-0.2,0.2-0.2,0.51,0,0.71c0.2,0.2,0.51,0.2,0.71,0l1.13-1.13 C19.59,4.73,19.59,4.42,19.39,4.22z M18.26,19.14c0.2,0.2-0.51,0.2-0.71,0l1.13-1.13c0.2-0.2,0.2-0.51,0-0.71c-0.2-0.2-0.51-0.2-0.71,0 l-1.13,1.13C18.06,18.63,18.06,18.94,18.26,19.14z M5.74,4.22c-0.2-0.2-0.51-0.2-0.71,0c-0.2,0.2-0.2,0.51,0,0.71l1.13,1.13 c0.2,0.2,0.51,0.2,0.71,0c0.2-0.2,0.2-0.51,0-0.71L5.74,4.22z" />
    </svg>
);
export const MoonIcon: React.FC<IconProps> = ({ className }) => (
    <svg {...defaultProps} className={className || defaultProps.className} fill="currentColor" strokeWidth="0">
        <path d="M12.31,2.41C12.03,2.44,11.76,2.5,11.5,2.5C6.81,2.5,3,6.31,3,11c0,2.39,1.01,4.56,2.64,6.08 c0.31,0.29,0.77,0.24,1.02-0.12c0.25-0.36,0.18-0.85-0.15-1.14C5.35,14.68,4.5,12.95,4.5,11c0-3.86,3.14-7,7-7 c0.9,0,1.75,0.17,2.55,0.48c0.42,0.17,0.89-0.08,1.06-0.5c0.17-0.42-0.08-0.89-0.5-1.06C13.81,2.6,13.06,2.43,12.31,2.41z M17,11 c0,2.21-1.79,4-4,4s-4-1.79-4-4s1.79-4,4-4S17,8.79,17,11z" />
    </svg>
);
export const ChevronDownIcon: React.FC<IconProps> = ({ className }) => (
    <svg {...defaultProps} className={className || defaultProps.className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
);
export const TrashIcon: React.FC<IconProps> = ({ className }) => (
    <svg {...defaultProps} className={className || defaultProps.className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
);
export const FolderIcon: React.FC<IconProps> = ({ className }) => (
    <svg {...defaultProps} className={className || defaultProps.className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
    </svg>
);
export const TagIcon: React.FC<IconProps> = ({ className }) => (
    <svg {...defaultProps} className={className || defaultProps.className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
    </svg>
);
export const PaperAirplaneIcon: React.FC<IconProps> = ({ className }) => (
    <svg {...defaultProps} className={className || defaultProps.className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
    </svg>
);
export const PlusIcon: React.FC<IconProps> = ({ className }) => (
    <svg {...defaultProps} className={className || defaultProps.className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
);
export const DashboardIcon: React.FC<IconProps> = ({ className }) => (
    <svg {...defaultProps} className={className || defaultProps.className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
);
export const ResearchIcon: React.FC<IconProps> = ({ className }) => (
    <svg {...defaultProps} className={className || defaultProps.className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" />
    </svg>
);
export const SettingsIcon: React.FC<IconProps> = ({ className }) => (
    <svg {...defaultProps} className={className || defaultProps.className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12a7.5 7.5 0 0015 0m-15 0a7.5 7.5 0 1115 0m-15 0H3m18 0h-1.5m-15 0a7.5 7.5 0 1115 0m-15 0H3m18 0h-1.5M12 18.75a.75.75 0 00.75-.75V12.313c0-.394.158-.77.438-1.049l2.25-2.25a.75.75 0 10-1.06-1.061l-2.25 2.25a.75.75 0 01-1.05 0l-2.25-2.25a.75.75 0 10-1.06 1.06l2.25 2.25c.28.28.437.655.437 1.05v5.688a.75.75 0 00.75.75z" />
    </svg>
);
export const DatabaseIcon: React.FC<IconProps> = ({ className }) => (
    <svg {...defaultProps} className={className || defaultProps.className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5-3.75v3.75" />
    </svg>
);
export const CheckCircleIcon: React.FC<IconProps> = ({ className }) => (
    <svg {...defaultProps} className={className || defaultProps.className} fill="none" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);
export const ShieldExclamationIcon: React.FC<IconProps> = ({ className }) => (
    <svg {...defaultProps} className={className || defaultProps.className} fill="none" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286zm0 12.982h.007v.008H12v-.008z" />
    </svg>
);
export const ChartBarIcon: React.FC<IconProps> = ({ className }) => (
    <svg {...defaultProps} className={className || defaultProps.className} fill="none" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
);
export const TheaterIcon: React.FC<IconProps> = ({ className }) => (
    <svg {...defaultProps} className={className || defaultProps.className} fill="none" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5C7.306 4.5 3.5 8.306 3.5 13c0 2.01.714 3.868 1.908 5.343A1 1 0 006 19h12a1 1 0 00.592-.657A8.47 8.47 0 0020.5 13c0-4.694-3.806-8.5-8.5-8.5z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.5 10a.5.5 0 11-1 0 .5.5 0 011 0zM9.5 10a.5.5 0 11-1 0 .5.5 0 011 0zM8 15s1 1.5 4 1.5 4-1.5 4-1.5" />
    </svg>
);
export const ArrowsRightLeftIcon: React.FC<IconProps> = ({ className }) => (
    <svg {...defaultProps} className={className || defaultProps.className} fill="none" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
    </svg>
);
export const ChatBubbleLeftRightIcon: React.FC<IconProps> = ({ className }) => (
    <svg {...defaultProps} className={className || defaultProps.className} fill="none" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.455.09-.934.09-1.423v-2.13a8.25 8.25 0 01-1.12-3.479.75.75 0 01.75-.75h1.5a.75.75 0 01.75.75c0 .414.336.75.75.75h3a.75.75 0 010 1.5H9a.75.75 0 01-.75-.75v-1.5a.75.75 0 01.75-.75H15a.75.75 0 01.75.75c0 .414.336.75.75.75h1.5a.75.75 0 01.75.75v3.438A8.25 8.25 0 0112 18.25c-2.472 0-4.685-.992-6.315-2.615a.75.75 0 00-1.06 1.06c1.95 1.95 4.638 3.065 7.375 3.065 4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 .428.02.85.058 1.26H3.75a.75.75 0 01.75.75v1.5c0 .414-.336.75-.75.75h-.75a.75.75 0 01-.75-.75V12c0-4.97 4.03-9 9-9s9 4.03 9 9z" />
    </svg>
);
export const StarIcon: React.FC<IconProps & { fill?: string }> = ({ className, fill = 'none' }) => (
    <svg {...defaultProps} className={className || defaultProps.className} fill={fill} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
    </svg>
);
export const ComputerDesktopIcon: React.FC<IconProps> = ({ className }) => (
    <svg {...defaultProps} className={className || defaultProps.className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25A2.25 2.25 0 0 1 5.25 3h13.5A2.25 2.25 0 0 1 21 5.25Z" />
    </svg>
);

// New Icons for Investigation
export const MicroscopeIcon: React.FC<IconProps> = ({ className }) => (
    <svg {...defaultProps} className={className || defaultProps.className} fill="none" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 10L6 14" />
    </svg>
);
export const ClipboardCheckIcon: React.FC<IconProps> = ({ className }) => (
    <svg {...defaultProps} className={className || defaultProps.className} fill="none" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
);

export const CheckBadgeIcon: React.FC<IconProps> = ({ className }) => (
    <svg {...defaultProps} className={className || defaultProps.className} fill="none" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

// Newly added icons for feature expansion
export const CalendarIcon: React.FC<IconProps> = ({ className }) => (
  <svg {...defaultProps} className={className || defaultProps.className} fill="none" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0h18M12 12.75h.008v.008H12v-.008z" />
  </svg>
);

export const CurrencyDollarIcon: React.FC<IconProps> = ({ className }) => (
  <svg {...defaultProps} className={className || defaultProps.className} fill="none" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);
// FIX: The path for this icon was corrupted.
export const BeakerIcon: React.FC<IconProps> = ({ className }) => (
    <svg {...defaultProps} className={className || defaultProps.className} fill="none" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.023-.75 0M9.75 3.104c.251.023.501.023.75 0M9.75 3.104v5.714a2.25 2.25 0 00.659 1.591l.243.243c.39.39.894.621 1.43.621h3.466c.536 0 1.04-.23 1.43-.621l.243-.243a2.25 2.25 0 00.659-1.591V3.104c-.251.023-.501.023-.75 0M4.875 14.5h14.25c.621 0 1.125.504 1.125 1.125v3.375c0 .621-.504 1.125-1.125 1.125H3.75A1.125 1.125 0 012.625 19v-3.375c0-.621.504-1.125 1.125-1.125h.25" />
    </svg>
);

// FIX: Added missing PencilSquareIcon for 'Notes' view.
export const PencilSquareIcon: React.FC<IconProps> = ({ className }) => (
    <svg {...defaultProps} className={className || defaultProps.className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
    </svg>
);

// FIX: Added missing BrainIcon for AI-related features.
export const BrainIcon: React.FC<IconProps> = ({ className }) => (
    <svg {...defaultProps} className={className || defaultProps.className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
    </svg>
);

// FIX: Added missing MicrophoneIcon for voice memo feature.
export const MicrophoneIcon: React.FC<IconProps> = ({ className }) => (
    <svg {...defaultProps} className={className || defaultProps.className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6V7.5a6 6 0 00-12 0v5.25a6 6 0 006 6z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 4.142-3.358 7.5-7.5 7.5s-7.5-3.358-7.5-7.5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-2.25" />
    </svg>
);

// New Icon for Token
export const SparklesIcon: React.FC<IconProps> = ({ className }) => (
    <svg {...defaultProps} className={className || defaultProps.className} fill="currentColor" viewBox="0 0 24 24" strokeWidth={0}>
        <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
    </svg>
);

