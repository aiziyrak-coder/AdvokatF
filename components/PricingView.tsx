import React, { useState } from 'react';
import { login, register } from '../services/authService';

interface PricingViewProps {
    onLogin: (token: string) => void;
    t: (key: string, replacements?: { [key: string]: string }) => string;
    loginError: string | null;
}

// Internal Icon Components for Auth View
const UserIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
);

const PhoneIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
    </svg>
);

const LockClosedIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
    </svg>
);

const InputField = ({ 
    id, 
    type, 
    value, 
    onChange, 
    placeholder, 
    icon, 
    required = false 
}: { 
    id: string, 
    type: string, 
    value: string, 
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, 
    placeholder: string, 
    icon: React.ReactNode, 
    required?: boolean 
}) => (
    <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-secondary)] group-focus-within:text-[var(--accent-primary)] transition-colors duration-300">
            {icon}
        </div>
        <input
            id={id}
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            className="w-full pl-10 pr-4 py-3.5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent outline-none transition-all duration-300 hover:bg-[var(--bg-secondary)]/80 shadow-inner"
        />
    </div>
);

export const PricingView: React.FC<PricingViewProps> = ({ onLogin, t, loginError }) => {
    const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
    
    // Login State (UI: Phone & Token, Backend: username & password)
    const [phone, setPhone] = useState('+9989'); // This will be username
    const [token, setToken] = useState(''); // This will be password
    
    // Register State
    const [regName, setRegName] = useState(''); // Ism Familiya (split to first/last)
    const [regPhone, setRegPhone] = useState('+9989'); // Username
    const [regPassword, setRegPassword] = useState('');
    const [regConfirmPassword, setRegConfirmPassword] = useState('');
    
    // Common State
    const [agreed, setAgreed] = useState(true);
    const [localError, setLocalError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLocalError(null);
        if (agreed && phone.trim() && token.trim()) {
            setIsLoading(true);
            try {
                // Backendga phone username sifatida, token password sifatida ketadi
                const data = await login(phone, token);
                onLogin(data.access);
            } catch (err: any) {
                console.error('Login error:', err?.response?.data || err);
                let message = t('login_failed') || 'Login failed. Please check your credentials.';
                const data = err?.response?.data;
                if (data) {
                    if (typeof data === 'string') {
                        message = data;
                    } else if (data.detail) {
                        message = data.detail;
                    } else if (Array.isArray(data.non_field_errors) && data.non_field_errors.length > 0) {
                        message = data.non_field_errors[0];
                    } else {
                        const keys = Object.keys(data);
                        if (keys.length > 0) {
                            const firstKey = keys[0];
                            const val = (data as any)[firstKey];
                            if (Array.isArray(val) && val.length > 0) {
                                message = `${firstKey}: ${val[0]}`;
                            }
                        }
                    }
                }
                setLocalError(message);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleRegisterSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLocalError(null);
        setSuccessMessage(null);

        if (!regName.trim() || !regPhone.trim() || !regPassword.trim() || !regConfirmPassword.trim()) {
            setLocalError(t('register_error_fields'));
            return;
        }

        if (regPassword !== regConfirmPassword) {
            setLocalError(t('register_error_password_mismatch'));
            return;
        }
        
        setIsLoading(true);

        try {
            // Ism Familiyani ajratish
            const nameParts = regName.trim().split(' ');
            const firstName = nameParts[0];
            const lastName = nameParts.slice(1).join(' ') || '';

            const payload = {
                username: regPhone,
                password: regPassword,
                first_name: firstName,
                last_name: lastName,
                email: '' // Email majburiy emas yoki backendda handle qilinadi
            };

            const data = await register(payload);
            console.log('Register success:', data);
            // Ro'yxatdan o'tgach darhol avtomatik login qilamiz
            try {
                const loginData = await login(regPhone, regPassword);
                onLogin(loginData.access);
                setSuccessMessage(t('register_success'));
            } catch (loginErr: any) {
                console.error('Auto login after register failed:', loginErr?.response?.data || loginErr);
                setSuccessMessage(t('register_success'));
                setActiveTab('login');
                setPhone(regPhone);
                setToken('');
            }
        } catch (err: any) {
            console.error('Register error:', err?.response?.data || err);
            let message = t('register_failed') || 'Registration failed. Try a different phone number.';
            const data = err?.response?.data;
            if (data) {
                if (typeof data === 'string') {
                    message = data;
                } else if (data.detail) {
                    message = data.detail;
                } else if (Array.isArray(data.non_field_errors) && data.non_field_errors.length > 0) {
                    message = data.non_field_errors[0];
                } else {
                    const keys = Object.keys(data);
                    if (keys.length > 0) {
                        const firstKey = keys[0];
                        const val = (data as any)[firstKey];
                        if (Array.isArray(val) && val.length > 0) {
                            message = `${firstKey}: ${val[0]}`;
                        }
                    }
                }
            }
            setLocalError(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen min-h-[100dvh] w-full flex items-center justify-center relative overflow-hidden bg-[var(--bg-primary)] p-3 xs:p-4 sm:p-6 py-12 sm:py-16">
            
            {/* Ambient Background Elements - Gradient Orbs */}
            <div className="absolute top-[-10%] left-[-5%] w-[300px] h-[300px] sm:w-[450px] sm:h-[450px] md:w-[600px] md:h-[600px] bg-[var(--accent-cyan)]/20 rounded-full blur-[80px] sm:blur-[100px] md:blur-[120px] animate-pulse-slow pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-5%] w-[300px] h-[300px] sm:w-[450px] sm:h-[450px] md:w-[600px] md:h-[600px] bg-[var(--accent-purple)]/20 rounded-full blur-[80px] sm:blur-[100px] md:blur-[120px] animate-pulse-slow pointer-events-none" style={{ animationDelay: '2s' }}></div>
            <div className="absolute top-[40%] left-[30%] w-[150px] h-[150px] sm:w-[250px] sm:h-[250px] md:w-[300px] md:h-[300px] bg-[var(--accent-blue)]/10 rounded-full blur-[60px] sm:blur-[80px] md:blur-[100px] animate-pulse-slow pointer-events-none" style={{ animationDelay: '4s' }}></div>

            <div className="w-full max-w-md relative z-10 flex flex-col gap-4 sm:gap-6 md:gap-8">
                
                {/* Header Section */}
                <div className="text-center space-y-2 sm:space-y-4">
                    <div className="inline-flex items-center justify-center p-1 rounded-full bg-gradient-to-br from-[var(--accent-cyan)] to-[var(--accent-purple)] shadow-[0_0_30px_rgba(6,182,212,0.5)] sm:shadow-[0_0_40px_rgba(6,182,212,0.6)]">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center relative overflow-hidden">
                            <span className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--accent-purple)] drop-shadow-sm">
                                A
                            </span>
                            <div className="absolute inset-0 bg-white/5 blur-xl"></div>
                        </div>
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-[var(--accent-cyan)] to-[var(--accent-blue)]">
                            {t('app_name')}
                        </h1>
                        <p className="text-[var(--text-secondary)] text-sm sm:text-base mt-1 sm:mt-2 max-w-xs mx-auto leading-relaxed px-2">
                            {t('auth_welcome_subtitle')}
                        </p>
                    </div>
                </div>

                {/* Main Card with Gradient Border */}
                <div className="gradient-border p-[1px] shadow-2xl w-full max-w-md mx-auto">
                    <div className="bg-[var(--bg-secondary)]/90 backdrop-blur-xl rounded-xl overflow-hidden h-full">
                        {/* Tab Switcher */}
                        <div className="p-1.5 sm:p-2 m-2 bg-[var(--bg-primary)]/50 rounded-xl flex relative border border-[var(--border-color)]">
                            <div 
                                className={`absolute top-1.5 bottom-1.5 sm:top-2 sm:bottom-2 w-[calc(50%-6px)] sm:w-[calc(50%-8px)] bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--accent-blue)] rounded-lg shadow-lg transition-all duration-300 ease-out`}
                                style={{ left: activeTab === 'login' ? '6px' : 'calc(50%)' }}
                            ></div>
                            <button
                                type="button"
                                onClick={() => { setActiveTab('login'); setLocalError(null); }}
                                className={`flex-1 relative z-10 py-2.5 sm:py-3 text-xs sm:text-sm font-bold transition-colors duration-300 min-h-touch rounded-lg ${activeTab === 'login' ? 'text-white' : 'text-[var(--text-secondary)] hover:text-white'}`}
                            >
                                {t('auth_tab_login')}
                            </button>
                            <button
                                type="button"
                                onClick={() => { setActiveTab('register'); setLocalError(null); }}
                                className={`flex-1 relative z-10 py-2.5 sm:py-3 text-xs sm:text-sm font-bold transition-colors duration-300 min-h-touch rounded-lg ${activeTab === 'register' ? 'text-white' : 'text-[var(--text-secondary)] hover:text-white'}`}
                            >
                                {t('auth_tab_register')}
                            </button>
                        </div>

                        <div className="p-4 sm:p-6 md:p-8 pt-2 sm:pt-4">
                            {activeTab === 'login' ? (
                                <form onSubmit={handleLoginSubmit} className="space-y-6">
                                <div className="space-y-4">
                                    <InputField
                                        id="phone"
                                        type="tel"
                                        value={phone}
                                        onChange={e => setPhone(e.target.value)}
                                        placeholder={t('login_phone_label')}
                                        icon={<PhoneIcon className="h-5 w-5" />}
                                        required
                                    />
                                    <InputField
                                        id="token"
                                        type="password"
                                        value={token}
                                        onChange={e => setToken(e.target.value)}
                                        placeholder={t('login_token_label')}
                                        icon={<LockClosedIcon className="h-5 w-5" />}
                                        required
                                    />
                                </div>
                                
                                <div className="flex items-center justify-between">
                                    <label className="flex items-center space-x-3 cursor-pointer group">
                                        <div className="relative flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={agreed}
                                                onChange={e => setAgreed(e.target.checked)}
                                                className="peer appearance-none h-5 w-5 border-2 border-[var(--border-color)] rounded-md bg-[var(--bg-primary)] checked:bg-[var(--accent-primary)] checked:border-[var(--accent-primary)] transition-all"
                                            />
                                            <svg className="absolute w-3.5 h-3.5 text-black left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" viewBox="0 0 12 10" fill="none">
                                                <path d="M1 5L4.5 8.5L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                        </div>
                                        <span className="text-xs text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
                                            {t('login_terms_agree')} <a href="#" className="text-[var(--accent-primary)] hover:underline">{t('terms_of_service')}</a>
                                        </span>
                                    </label>
                                </div>

                                <button
                                    type="submit"
                                    disabled={!agreed || isLoading}
                                    className="w-full bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--accent-blue)] text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 disabled:shadow-none mt-4"
                                >
                                    {isLoading ? t('loading') : t('auth_button_login')}
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handleRegisterSubmit} className="space-y-4">
                                <div className="space-y-3">
                                    <InputField
                                        id="regName"
                                        type="text"
                                        value={regName}
                                        onChange={e => setRegName(e.target.value)}
                                        placeholder={t('register_name_label')}
                                        icon={<UserIcon className="h-5 w-5" />}
                                        required
                                    />
                                    <InputField
                                        id="regPhone"
                                        type="tel"
                                        value={regPhone}
                                        onChange={e => setRegPhone(e.target.value)}
                                        placeholder={t('register_phone_label')}
                                        icon={<PhoneIcon className="h-5 w-5" />}
                                        required
                                    />
                                    <div className="grid grid-cols-1 xs:grid-cols-2 gap-3">
                                        <InputField
                                            id="regPassword"
                                            type="password"
                                            value={regPassword}
                                            onChange={e => setRegPassword(e.target.value)}
                                            placeholder={t('register_password_label')}
                                            icon={<LockClosedIcon className="h-5 w-5" />}
                                            required
                                        />
                                        <InputField
                                            id="regConfirm"
                                            type="password"
                                            value={regConfirmPassword}
                                            onChange={e => setRegConfirmPassword(e.target.value)}
                                            placeholder={t('register_password_confirm_label')}
                                            icon={<LockClosedIcon className="h-5 w-5" />}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center space-x-3 pt-2">
                                    <div className="relative flex items-center">
                                        <input
                                            id="regTerms"
                                            type="checkbox"
                                            checked={agreed}
                                            onChange={e => setAgreed(e.target.checked)}
                                            className="peer appearance-none h-5 w-5 border-2 border-[var(--border-color)] rounded-md bg-[var(--bg-primary)] checked:bg-[var(--accent-primary)] checked:border-[var(--accent-primary)] transition-all cursor-pointer"
                                        />
                                        <svg className="absolute w-3.5 h-3.5 text-black left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" viewBox="0 0 12 10" fill="none">
                                            <path d="M1 5L4.5 8.5L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                    </div>
                                    <label htmlFor="regTerms" className="text-xs text-[var(--text-secondary)] cursor-pointer">
                                        {t('login_terms_agree')} <a href="#" className="text-[var(--accent-primary)] hover:underline">{t('terms_of_service')}</a>
                                    </label>
                                </div>

                                <button
                                    type="submit"
                                    disabled={!agreed || isLoading}
                                    className="w-full bg-gradient-to-r from-[var(--accent-purple)] to-[var(--accent-pink)] text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 disabled:shadow-none mt-4"
                                >
                                    {isLoading ? t('loading') : t('register_button')}
                                </button>
                            </form>
                        )}

                        {/* Error & Success Messages */}
                        {(loginError || localError) && (
                            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3">
                                <div className="h-2 w-2 rounded-full bg-red-500 flex-shrink-0"></div>
                                <p className="text-red-400 text-xs font-medium">{loginError || localError}</p>
                            </div>
                        )}
                        {successMessage && (
                            <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-3">
                                <div className="h-2 w-2 rounded-full bg-green-500 flex-shrink-0"></div>
                                <p className="text-green-400 text-xs font-medium">{successMessage}</p>
                            </div>
                        )}
                        </div>
                    </div>
                </div>
            </div>
            
            <footer className="absolute bottom-0 left-0 right-0 w-full py-4 sm:py-6 pb-[max(1rem,env(safe-area-inset-bottom))] text-center text-[10px] xs:text-xs text-[var(--text-secondary)] z-10">
                <div className="flex flex-col xs:flex-row justify-center items-center gap-1 xs:gap-2 opacity-60 hover:opacity-100 transition-opacity px-4">
                    <span>© 2026</span>
                    <a href="https://cdcgroup.uz" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--accent-primary)] transition-colors">CDCGroup</a>
                    <span className="hidden xs:inline-block w-1 h-1 rounded-full bg-[var(--text-secondary)]"></span>
                    <span>{t('footer_supporter')} <a href="https://cdcgroup.uz" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--accent-primary)] transition-colors">CraDev</a></span>
                </div>
            </footer>
        </div>
    );
};
