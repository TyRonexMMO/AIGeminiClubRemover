import React from 'react';
import { ProcessedImage } from '../types';
import { IconDownload } from './Icons';

interface MultiPreviewProps {
    images: ProcessedImage[];
    onClear: () => void;
    onDownloadAll: () => void;
}

const MultiPreview: React.FC<MultiPreviewProps> = ({ images, onClear, onDownloadAll }) => {
    const handleDownloadSingle = (image: ProcessedImage) => {
        if(image.status !== 'completed') return;
        const link = document.createElement('a');
        link.href = image.processedSrc;
        link.download = `clean_${image.name.replace(/\.[^/.]+$/, "")}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800">បញ្ជីរូបភាព ({images.length})</h2>
                <div className="flex gap-3">
                     <button 
                        onClick={onDownloadAll}
                        className="bg-slate-900 text-white px-6 py-2.5 rounded-xl hover:bg-slate-800 transition flex items-center gap-2 font-medium shadow-lg shadow-slate-200"
                    >
                        <IconDownload className="w-5 h-5" />
                        ទាញយកទាំងអស់
                    </button>
                    <button 
                        onClick={onClear}
                        className="bg-white border border-slate-200 text-slate-600 px-4 py-2.5 rounded-xl hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition"
                    >
                        សម្អាត
                    </button>
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {images.map(img => (
                    <div key={img.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col relative group">
                        <div className="h-40 bg-slate-100 relative overflow-hidden checkerboard">
                            {img.status === 'processing' && (
                                <div className="absolute inset-0 flex items-center justify-center z-10 bg-white/50">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                                </div>
                            )}
                            <img 
                                src={img.processedSrc || img.originalSrc} 
                                alt={img.name}
                                className={`w-full h-full object-contain transition duration-500 ${img.status === 'processing' ? 'opacity-50' : 'opacity-100'}`} 
                            />
                            {img.status === 'completed' && (
                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition">
                                     <span className="bg-green-500 text-white text-[10px] px-2 py-1 rounded-full font-bold shadow-sm">រួចរាល់</span>
                                </div>
                            )}
                        </div>
                        <div className="p-3 flex justify-between items-center bg-white">
                            <div className="truncate text-xs font-medium text-slate-600 max-w-[70%]" title={img.name}>{img.name}</div>
                            <button 
                                onClick={() => handleDownloadSingle(img)}
                                disabled={img.status !== 'completed'}
                                className="text-primary hover:text-primary-dark disabled:opacity-50"
                            >
                                <IconDownload className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MultiPreview;