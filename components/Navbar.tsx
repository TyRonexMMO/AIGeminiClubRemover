import React from 'react';
import { IconLogo, IconSettings } from './Icons';

interface NavbarProps {
    onOpenSettings: () => void;
    showSettingsDot: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ onOpenSettings, showSettingsDot }) => {
    return (
        <nav className="sticky top-0 z-50 glass-panel border-b border-slate-200 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    <div className="flex items-center gap-2">
                        <div className="bg-primary/10 p-2 rounded-lg">
                            <IconLogo className="h-6 w-6 text-primary" />
                        </div>
                        <span className="font-bold text-xl tracking-tight text-slate-900">
                            Gemini<span className="text-primary">Remover</span>
                        </span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={onOpenSettings} 
                            className="text-slate-500 hover:text-primary transition p-2 rounded-full hover:bg-slate-100 relative"
                            aria-label="Settings"
                        >
                            <IconSettings className="w-6 h-6" />
                            {showSettingsDot && (
                                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                            )}
                        </button>
                        <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2 py-1 rounded border border-slate-200">
                            v2.1 KH
                        </span>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;