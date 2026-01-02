import React, { useRef } from 'react';
import { IconSettings } from './Icons';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAssetsChanged: () => void;
    hasBg48: boolean;
    hasBg96: boolean;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onAssetsChanged, hasBg48, hasBg96 }) => {
    if (!isOpen) return null;

    const handleFileChange = (key: string, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target?.result) {
                    try {
                        localStorage.setItem(key, event.target.result as string);
                        onAssetsChanged();
                    } catch (err) {
                        alert("Storage full or error saving mask. Try a smaller image.");
                    }
                }
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="fixed inset-0 z-[100]">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose}></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl shadow-2xl p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <IconSettings className="w-5 h-5 text-slate-500" />
                    ការកំណត់ (Settings)
                </h3>

                <div className="space-y-4">
                    <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-700">
                        <p>To ensure the tool works correctly, please upload the calibration mask files (`bg_48.png` and `bg_96.png`) if you have them.</p>
                    </div>

                    <div className="space-y-3">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Background Mask (48x48)</label>
                            <div className="flex items-center gap-2">
                                <input 
                                    type="file" 
                                    accept="image/png" 
                                    onChange={(e) => handleFileChange('bg_48_data', e)}
                                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                                />
                                <span className={`font-bold ${hasBg48 ? 'text-green-500' : 'text-red-500'}`}>
                                    {hasBg48 ? '✓' : '✕'}
                                </span>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Background Mask (96x96)</label>
                            <div className="flex items-center gap-2">
                                <input 
                                    type="file" 
                                    accept="image/png" 
                                    onChange={(e) => handleFileChange('bg_96_data', e)}
                                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                                />
                                <span className={`font-bold ${hasBg96 ? 'text-green-500' : 'text-red-500'}`}>
                                    {hasBg96 ? '✓' : '✕'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex justify-end">
                    <button 
                        onClick={onClose} 
                        className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm hover:bg-slate-800"
                    >
                        បិទ (Close)
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;