import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import UploadArea from './components/UploadArea';
import SettingsModal from './components/SettingsModal';
import SinglePreview from './components/SinglePreview';
import MultiPreview from './components/MultiPreview';
import { IconAlert, IconRefresh, IconFacebook, IconTelegram } from './components/Icons';
import { WatermarkEngine, loadImage } from './utils/watermarkLogic';
import { ProcessedImage } from './types';

const App: React.FC = () => {
    const [engine, setEngine] = useState<WatermarkEngine | null>(null);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [processedImages, setProcessedImages] = useState<ProcessedImage[]>([]);
    const [hasBg48, setHasBg48] = useState(false);
    const [hasBg96, setHasBg96] = useState(false);

    const initEngine = useCallback(async () => {
        const newEngine = await WatermarkEngine.create();
        setEngine(newEngine);
        setHasBg48(!!newEngine.bgCaptures.bg48);
        setHasBg96(!!newEngine.bgCaptures.bg96);
    }, []);

    useEffect(() => {
        initEngine();
    }, [initEngine]);

    const handleAssetsChanged = async () => {
        await initEngine();
    };

    const processFiles = async (files: FileList) => {
        if (!engine || !engine.hasAssets()) {
            setIsSettingsOpen(true);
            alert("Please upload the calibration images in settings first!");
            return;
        }

        const validFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
        if (validFiles.length === 0) return;

        const newItems: ProcessedImage[] = validFiles.map(f => ({
            id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: f.name,
            originalSrc: URL.createObjectURL(f),
            processedSrc: '',
            originalWidth: 0,
            originalHeight: 0,
            status: 'processing'
        }));

        setProcessedImages(prev => [...prev, ...newItems]);

        // Process sequentially to not freeze UI too much
        for (let i = 0; i < newItems.length; i++) {
            const item = newItems[i];
            try {
                const img = await loadImage(item.originalSrc);
                const resultDataUrl = await engine.removeWatermarkFromImage(img);
                
                setProcessedImages(prev => prev.map(p => {
                    if (p.id === item.id) {
                        return {
                            ...p,
                            processedSrc: resultDataUrl,
                            originalWidth: img.width,
                            originalHeight: img.height,
                            status: 'completed'
                        };
                    }
                    return p;
                }));
            } catch (error) {
                console.error("Error processing image", error);
                setProcessedImages(prev => prev.map(p => p.id === item.id ? { ...p, status: 'error' } : p));
            }
        }
    };

    const handleReset = () => {
        setProcessedImages([]);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDownloadAll = async () => {
        if (typeof window.JSZip === 'undefined') {
            alert('JSZip library not loaded. Please check your internet connection.');
            return;
        }

        const zip = new window.JSZip();
        let count = 0;
        
        processedImages.forEach(img => {
            if (img.status === 'completed' && img.processedSrc) {
                const base64 = img.processedSrc.split(',')[1];
                zip.file(`clean_${img.name.replace(/\.[^/.]+$/, "")}.png`, base64, { base64: true });
                count++;
            }
        });

        if (count === 0) return;

        const content = await zip.generateAsync({ type: "blob" });
        const url = URL.createObjectURL(content);
        const link = document.createElement('a');
        link.href = url;
        link.download = "gemini_cleaned_images.zip";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const showWarning = !hasBg48 || !hasBg96;

    return (
        <>
            <Navbar 
                onOpenSettings={() => setIsSettingsOpen(true)} 
                showSettingsDot={showWarning} 
            />

            <main className="flex-grow">
                {showWarning && (
                    <div className="bg-orange-50 border-b border-orange-200 px-4 py-3">
                        <div className="max-w-7xl mx-auto flex items-center justify-between">
                            <div className="flex items-center gap-2 text-orange-700">
                                <IconAlert className="w-5 h-5" />
                                <span className="text-sm font-medium">
                                    សូមបញ្ចូលឯកសារ `bg_48.png` និង `bg_96.png` នៅក្នុងការកំណត់ (Settings) ដើម្បីឱ្យកម្មវិធីដំណើរការ។
                                </span>
                            </div>
                            <button 
                                onClick={() => setIsSettingsOpen(true)}
                                className="text-sm bg-orange-100 text-orange-800 px-3 py-1 rounded hover:bg-orange-200 font-medium"
                            >
                                ដោះស្រាយ
                            </button>
                        </div>
                    </div>
                )}

                {processedImages.length === 0 ? (
                    <section className="relative pt-16 pb-20 lg:pt-24 lg:pb-28 overflow-hidden">
                        <div className="absolute inset-0 -z-10 h-full w-full bg-white [background:radial-gradient(125%_125%_at_50%_10%,#fff_40%,#e0f2fe_100%)]"></div>
                        
                        <div className="text-center max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
                                លុប <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">Watermark</span> ចេញពីរូបភាព <br className="hidden md:block" /> Gemini AI ដោយឥតគិតថ្លៃ
                            </h1>
                            <p className="text-lg text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
                                ឧបករណ៍សម្រាប់លុប Watermark ចេញពីរូបភាពដែលបង្កើតដោយ Gemini AI ។ ដំណើរការក្នុង Browser របស់អ្នក ១០០% ដោយមិនចាំបាច់ Upload ទៅកាន់ Server ឡើយ។
                            </p>

                            <UploadArea onFilesSelected={processFiles} />
                        </div>
                    </section>
                ) : (
                    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 scroll-mt-20">
                        {processedImages.length === 1 ? (
                            <SinglePreview image={processedImages[0]} />
                        ) : (
                            <MultiPreview 
                                images={processedImages} 
                                onClear={handleReset} 
                                onDownloadAll={handleDownloadAll} 
                            />
                        )}

                        <div className="mt-8 flex justify-center">
                            <button 
                                onClick={handleReset}
                                className="text-slate-500 hover:text-primary transition flex items-center gap-2 text-sm font-medium"
                            >
                                <IconRefresh className="w-4 h-4" />
                                ជ្រើសរើសរូបភាពថ្មី
                            </button>
                        </div>
                    </section>
                )}
            </main>

            <footer className="bg-white border-t border-slate-200 py-8">
                <div className="max-w-7xl mx-auto px-4 flex flex-col items-center gap-4">
                    <div className="flex items-center gap-6">
                        <a 
                            href="https://web.facebook.com/Ronex.Elite" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-slate-400 hover:text-[#1877F2] transition transform hover:scale-110"
                            aria-label="Facebook"
                        >
                            <IconFacebook className="w-6 h-6" />
                        </a>
                        <a 
                            href="https://t.me/TYRoneX97" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-slate-400 hover:text-[#229ED9] transition transform hover:scale-110"
                            aria-label="Telegram"
                        >
                            <IconTelegram className="w-6 h-6" />
                        </a>
                    </div>
                    <p className="text-slate-500 text-sm text-center">
                        &copy; រក្សា​សិទ្ធិ​គ្រប់​យ៉ាង​ដោយ​ RATH C.Ponleu ឆ្នាំ​២០២៥
                    </p>
                </div>
            </footer>

            <SettingsModal 
                isOpen={isSettingsOpen} 
                onClose={() => setIsSettingsOpen(false)} 
                onAssetsChanged={handleAssetsChanged}
                hasBg48={hasBg48}
                hasBg96={hasBg96}
            />
        </>
    );
};

export default App;