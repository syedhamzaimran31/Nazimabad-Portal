import React from 'react';
import { Card, CardContent } from './card';
import { FileIcon } from 'lucide-react';
import { Label } from './label';
import { Input } from './input';

interface FileUploaderProps {
  value: File | undefined; // File object or undefined if no file is selected
  onChange: (file: File | undefined) => void; // Function to handle the change
}

const FileUploader: React.FC<FileUploaderProps> = ({ value, onChange }) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; // Safely access the first file
    onChange(file); // Pass the file object or undefined to the parent component
  };

  const imageUrl = value ? URL.createObjectURL(value) : null; // Create URL for the selected file

  return (
    <Card>
      <CardContent className="p-2 ">
        <div className="border-2 border-dashed border-gray-200 rounded-lg flex flex-col gap-1 p-1 items-center">
          {!imageUrl ? (
            <>
              <FileIcon className="w-12 h-12" />
              <span className="sm:text-sm sm:font-medium text-[10px] font-sm text-gray-500">
                Drag and drop a file or click to browse
              </span>
              <span className="text-xs text-gray-500"> image</span>
            </>
          ) : (
            <img src={imageUrl} alt="Uploaded preview" className="w-full h-auto" />
          )}
        </div>
        <div className="space-y-2 text-sm">
          <Label htmlFor="file" className="text-sm font-sm">
           
          </Label>
          <Input 
            id="file" 
            type="file" 
            accept="image/*" 
          
            onChange={handleFileChange} 
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default FileUploader;
