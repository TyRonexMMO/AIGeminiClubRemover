import React from 'react';
import { ProcessedImage } from '../types';
import { IconDownload } from './Icons';

interface SinglePreviewProps {
    image: ProcessedImage;
}

const SinglePreview: React.FC<SinglePreviewProps> = ({ image }) => {
    const handleDownload = () => {
        if (image.status !== 'completed') return;
        const link = document.createElement('a');
        link.href = image.processedSrc;
        link.download = `clean_${image.name.replace(/\.[^/.]+$/, "")}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="grid lg:grid-cols-2 gap-8">
            {/* Original */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                    <span className="font-bold text-slate-700 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> រូបភាពដើម
                    </span>
                    <span className="text-xs font-mono text-slate-400 bg-white px-2 py-1 rounded border">
                        {image.originalWidth} x {image.originalHeight}px
                    </span>
                </div>
                <div className="p-4 bg-slate-100/50 min-h-[400px] flex items-center justify-center checkerboard relative">
                    <img src={image.originalSrc} alt="Original" className="max-w-full max-h-[600px] rounded-lg shadow-sm object-contain" />
                </div>
            </div>

            {/* Processed */}
            <div className="bg-white rounded-2xl shadow-lg border border-primary/20 overflow-hidden relative">
                <div className="absolute inset-0 bg-primary/5 pointer-events-none z-0"></div>
                <div className="relative z-10 bg-white/80 backdrop-blur px-6 py-4 border-b border-primary/10 flex justify-between items-center">
                    <span className="font-bold text-primary flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${image.status === 'completed' ? 'bg-green-500' : 'bg-yellow-500'} animate-pulse`}></span> 
                        {image.status === 'completed' ? 'លទ្ធផល' : 'កំពុងដំណើរការ...'}
                    </span>
                    <div className="flex gap-2">
                        <button 
                            onClick={handleDownload}
                            disabled={image.status !== 'completed'}
                            className="text-xs bg-primary text-white px-3 py-1.5 rounded-lg hover:bg-primary-dark transition flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <IconDownload className="w-3 h-3" />
                            ទាញយក
                        </button>
                    </div>
                </div>
                <div className="p-4 bg-slate-100/50 min-h-[400px] flex items-center justify-center checkerboard relative">
                    {image.status === 'processing' && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur z-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-3"></div>
                            <span className="text-sm font-medium text-slate-500">កំពុងដំណើរការ...</span>
                        </div>
                    )}
                    {image.processedSrc && (
                        <img src={image.processedSrc} alt="Processed" className="max-w-full max-h-[600px] rounded-lg shadow-sm object-contain" />
                    )}
                </div>
            </div>
        </div>
    );
};

export default SinglePreview;