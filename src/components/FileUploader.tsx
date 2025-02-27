
import React, { useRef, useState } from 'react';
import { Paperclip, UploadCloud, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import AttachmentComponent from './Attachment';
import { Attachment } from '@/data/mockData';

interface FileUploaderProps {
  onFileUpload: (files: File[]) => Promise<Attachment[]>;
  files: Attachment[];
  onFileDelete?: (id: string) => void;
  maxFiles?: number;
  maxSizeMB?: number;
  className?: string;
}

const FileUploader: React.FC<FileUploaderProps> = ({
  onFileUpload,
  files,
  onFileDelete,
  maxFiles = 5,
  maxSizeMB = 10,
  className
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  
  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    // Validate files before uploading
    const validFiles = validateFiles(Array.from(e.dataTransfer.files));
    if (validFiles.length > 0) {
      await uploadFiles(validFiles);
    }
  };
  
  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const validFiles = validateFiles(Array.from(e.target.files));
      if (validFiles.length > 0) {
        await uploadFiles(validFiles);
      }
      
      // Reset the input so the same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  const validateFiles = (filesToValidate: File[]): File[] => {
    // Check if we'd exceed the max number of files
    if (files.length + filesToValidate.length > maxFiles) {
      toast({
        title: `Maximum ${maxFiles} files allowed`,
        description: `You can only upload ${maxFiles} files at a time.`,
        variant: "destructive"
      });
      return filesToValidate.slice(0, maxFiles - files.length);
    }
    
    const validFiles: File[] = [];
    
    for (const file of filesToValidate) {
      // Check file size
      if (file.size > maxSizeBytes) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds the maximum size of ${maxSizeMB}MB.`,
          variant: "destructive"
        });
        continue;
      }
      
      validFiles.push(file);
    }
    
    return validFiles;
  };
  
  const uploadFiles = async (filesToUpload: File[]) => {
    if (filesToUpload.length === 0) return;
    
    setIsUploading(true);
    
    try {
      await onFileUpload(filesToUpload);
      
      toast({
        title: "Files uploaded successfully",
        description: `${filesToUpload.length} file(s) have been uploaded.`
      });
    } catch (error) {
      console.error('Error uploading files:', error);
      toast({
        title: "Error uploading files",
        description: "There was an error uploading your files. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className={className}>
      <input 
        type="file" 
        ref={fileInputRef}
        className="hidden"
        multiple
        onChange={handleFileInputChange}
      />
      
      {/* File upload area */}
      {files.length < maxFiles && (
        <div 
          className={`border-2 border-dashed rounded-md p-4 text-center cursor-pointer transition-colors ${
            isDragging ? 'border-primary bg-primary/5' : 'border-gray-300 dark:border-gray-600'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleButtonClick}
        >
          {isUploading ? (
            <div className="flex flex-col items-center justify-center py-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
              <p className="text-sm">Uploading...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-4">
              <UploadCloud className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm mb-1">Drag and drop files here or click to browse</p>
              <p className="text-xs text-muted-foreground">
                Maximum {maxFiles} files, up to {maxSizeMB}MB each
              </p>
            </div>
          )}
        </div>
      )}
      
      {/* File list */}
      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          <div className="text-sm font-medium mb-2">Attached files ({files.length}/{maxFiles})</div>
          {files.map(file => (
            <AttachmentComponent 
              key={file.id}
              attachment={file}
              onDelete={onFileDelete}
            />
          ))}
        </div>
      )}
      
      {/* Add more button when some files are already uploaded */}
      {files.length > 0 && files.length < maxFiles && (
        <Button
          variant="outline"
          size="sm"
          className="mt-3"
          onClick={handleButtonClick}
          disabled={isUploading}
        >
          <Paperclip className="h-4 w-4 mr-2" />
          Add more files
        </Button>
      )}
    </div>
  );
};

export default FileUploader;
