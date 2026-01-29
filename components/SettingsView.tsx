import React, { useState, useEffect } from 'react';
import { ComputerDesktopIcon } from './icons';

interface SettingsViewProps {
    t: (key: string, replacements?: { [key: string]: string }) => string;
    deviceId: string | null;
    deviceList: string[];
    onRemoveDevice: (deviceId: string) => void;
}

const SettingsCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="polished-pane rounded-2xl sm:rounded-3xl overflow-hidden">
        <div className="p-3 sm:p-4 border-b border-[var(--border-color)]">
            <h3 className="font-semibold text-base sm:text-lg text-[var(--text-primary)]">{title}</h3>
        </div>
        <div className="p-3 sm:p-4">
            {children}
        </div>
    </div>
);

const InputField: React.FC<{ label: string; type: string; id: string; value: string; disabled?: boolean }> = ({ label, type, id, value, disabled }) => (
     <div>
        <label htmlFor={id} className="block text-sm font-medium text-[var(--text-primary)] mb-1">
            {label}
        </label>
        <input
            id={id}
            name={id}
            type={type}
            required
            defaultValue={value}
            disabled={disabled}
            className="block w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-md text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent disabled:opacity-50"
        />
    </div>
);

export const SettingsView: React.FC<SettingsViewProps> = ({ t, deviceId, deviceList, onRemoveDevice }) => {
    const [fullName, setFullName] = useState(t('settings_profile_name_placeholder'));

    useEffect(() => {
        const storedName = localStorage.getItem('userFullName');
        if (storedName) {
            setFullName(storedName);
        }
    }, [t]);

    return (
        <div className="w-full max-w-full space-y-4 sm:space-y-6 animate-assemble-in">
            {deviceId && (
                <div className="polished-pane p-3 sm:p-4 flex items-center gap-3 sm:gap-4 rounded-2xl sm:rounded-3xl">
                    <ComputerDesktopIcon className="h-6 w-6 sm:h-8 sm:w-8 text-[var(--accent-primary)] flex-shrink-0"/>
                    <div className="min-w-0">
                        <h3 className="font-semibold text-sm sm:text-base text-[var(--text-primary)]">{t('settings_devices_current_device')}</h3>
                        <p className="font-mono text-xs sm:text-sm text-[var(--text-secondary)] tracking-wider truncate">{deviceId}</p>
                    </div>
                </div>
            )}

            <SettingsCard title={t('settings_profile_title')}>
                <form className="space-y-4">
                    <InputField label={t('settings_profile_name')} id="full-name" type="text" value={fullName} disabled />
                    <InputField label={t('settings_profile_phone')} id="phone" type="tel" value="+998 XX XXX-XX-XX" disabled />
                    <div className="pt-2 text-right">
                         <button disabled className="bg-[var(--accent-primary)] text-black font-bold py-2 px-5 rounded-lg transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed">
                            {t('button_save')}
                        </button>
                    </div>
                </form>
            </SettingsCard>

            <SettingsCard title={t('settings_devices_title')}>
                <div className="space-y-3 sm:space-y-4">
                    <p className="text-xs sm:text-sm text-[var(--text-secondary)]">{t('settings_devices_limit_info')}</p>
                    <div className="space-y-2">
                        {deviceList.map((id) => (
                            <div key={id} className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2 bg-[var(--bg-secondary)] p-3 rounded-xl border border-[var(--border-color)]">
                                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                                    <ComputerDesktopIcon className="h-4 w-4 sm:h-5 sm:w-5 text-[var(--text-secondary)] flex-shrink-0" />
                                    <span className="font-mono text-xs sm:text-sm text-[var(--text-primary)] truncate">{id}</span>
                                    {id === deviceId && (
                                        <span className="text-[10px] xs:text-xs font-bold px-2 py-0.5 rounded-full bg-[var(--accent-primary)]/20 text-[var(--accent-primary)] flex-shrink-0">
                                            {t('device_current_tag')}
                                        </span>
                                    )}
                                </div>
                                {id !== deviceId && (
                                    <button
                                        type="button"
                                        onClick={() => onRemoveDevice(id)}
                                        className="text-xs sm:text-sm font-semibold text-red-400 hover:text-red-300 hover:underline min-h-touch self-start xs:self-center"
                                    >
                                        {t('button_remove_device')}
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </SettingsCard>

             <SettingsCard title={t('settings_notifications_title')}>
                <p className="text-[var(--text-secondary)]">{t('settings_notifications_placeholder')}</p>
            </SettingsCard>
        </div>
    );
};