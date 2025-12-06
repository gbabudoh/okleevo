"use client";

import React, { useState, useCallback } from 'react';
import { Upload, X, File } from 'lucide-react';

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in MB
  maxFiles?: number;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFilesSelected,
  accept,
  multiple = true,
  maxSize = 10,
  maxFiles = 5,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string>('');

  const validateFiles = (fileList: FileList): File[] => {
    const validFiles: File[] = [];
    setError('');

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      
      // Check file size
      if (file.size > maxSize * 1024 * 1024) {
        setError(`File ${file.name} exceeds ${maxSize}MB limit`);
        continue;
      }

      validFiles.push(file);
    }

    // Check max files
    if (files.length + validFiles.length > maxFiles) {
      setError(`Maximum ${maxFiles} files allowed`);
      return validFiles.slice(0, maxFiles - files.length);
    }

    return validFiles;
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const droppedFiles = validateFiles(e.dataTransfer.files);
      if (droppedFiles.length > 0) {
        const newFiles = [...files, ...droppedFiles];
        setFiles(newFiles);
        onFilesSelected(newFiles);
      }
    },
    [files, onFilesSelected]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = validateFiles(e.target.files);
      if (selectedFiles.length > 0) {
        const newFiles = [...files, ...selectedFiles];
        setFiles(newFiles);
        onFilesSelected(newFiles);
      }
    }
  };

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    onFilesSelected(newFiles);
  };

  return (
    <div className="w-full">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer
          ${isDragging ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-gray-400'}
        `}
      >
        <input
          type="file"
          onChange={handleFileInput}
          accept={accept}
          multiple={multiple}
          className="hidden"
          id="file-upload"
        />
        <label htmlFor="file-upload" className="cursor-pointer">
          <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-medium text-gray-700 mb-2">
            Drop files here or click to upload
          </p>
          <p className="text-sm text-gray-500">
            Maximum {maxSize}MB per file • Up to {maxFiles} files
          </p>
        </label>
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}

      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
            >
              <div className="flex items-center gap-3">
                <File className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{file.name}</p>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                onClick={() => removeFile(index)}
                className="p-1 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
