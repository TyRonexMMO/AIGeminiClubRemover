import React, { useRef, useState } from 'react';
import { IconUpload, IconImage } from './Icons';

interface UploadAreaProps {
    onFilesSelected: (files: FileList) => void;
}

const UploadArea: React.FC<UploadAreaProps> = ({ onFilesSelected }) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            onFilesSelected(e.dataTransfer.files);
        }
    };

    const handleClick = () => {
        inputRef.current?.click();
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            onFilesSelected(e.target.files);
        }
    };

    return (
        <div className="max-w-3xl mx-auto">
            <div 
                className={`relative group cursor-pointer ${isDragging ? 'scale-95 opacity-80' : ''} transition-all duration-200`}
                onClick={handleClick}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-blue-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-200"></div>
                <div className={`relative bg-white rounded-2xl border-2 border-dashed ${isDragging ? 'border-primary' : 'border-slate-300'} group-hover:border-primary transition-all duration-200 p-10 flex flex-col items-center justify-center min-h-[280px]`}>
                    
                    <div className="w-20 h-20 bg-blue-50 text-primary rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                        <IconUpload className="w-10 h-10" />
                    </div>
                    
                    <h3 className="text-xl font-bold text-slate-800 mb-2">ចុចទីនេះ ឬ អូសរូបភាពដាក់ចូល</h3>
                    <p className="text-slate-500 mb-6">គាំទ្រប្រភេទ JPG, PNG, WebP</p>
                    
                    <button className="bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-full font-medium transition-all shadow-lg shadow-blue-500/30 flex items-center gap-2">
                        <IconImage className="w-5 h-5" />
                        ជ្រើសរើសរូបភាព
                    </button>
                    <input 
                        type="file" 
                        ref={inputRef} 
                        className="hidden" 
                        multiple 
                        accept="image/*" 
                        onChange={handleChange}
                    />
                </div>
            </div>
        </div>
    );
};

export default UploadArea;