
import React from 'react';
import { FileIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Attachment } from '@/data/mockData';

interface AttachmentProps {
  attachment: Attachment;
  onDelete?: (id: string) => void;
  className?: string;
  showDelete?: boolean;
}

const AttachmentComponent: React.FC<AttachmentProps> = ({ 
  attachment, 
  onDelete, 
  className,
  showDelete = true 
}) => {
  const isImage = attachment.fileType.startsWith('image/');
  const fileSize = formatFileSize(attachment.fileSize);
  
  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDelete) {
      onDelete(attachment.id);
    }
  };
  
  const handleClick = () => {
    window.open(attachment.url, '_blank');
  };

  return (
    <div 
      className={cn(
        "flex items-center p-2 border rounded gap-3 group hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors",
        className
      )}
      onClick={handleClick}
    >
      {isImage ? (
        <div className="h-10 w-10 shrink-0 rounded overflow-hidden bg-gray-100 dark:bg-gray-800">
          <img 
            src={attachment.url} 
            alt={attachment.fileName}
            className="h-full w-full object-cover"
          />
        </div>
      ) : (
        <FileIcon className="h-6 w-6 shrink-0 text-blue-500" />
      )}
      
      <div className="flex-grow min-w-0">
        <div className="text-sm font-medium truncate">{attachment.fileName}</div>
        <div className="text-xs text-muted-foreground">{fileSize}</div>
      </div>
      
      {showDelete && onDelete && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={handleDelete}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  
  return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(2))} ${sizes[i]}`;
}

export default AttachmentComponent;
