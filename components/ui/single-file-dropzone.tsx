'use client';

import { File, UploadCloud, X } from 'lucide-react';
import * as React from 'react';
import { useDropzone, type DropzoneOptions } from 'react-dropzone';
import { twMerge } from 'tailwind-merge';

const variants = {
  base: 'relative rounded-xl flex justify-center items-center flex-col cursor-pointer min-h-[150px] min-w-[200px] border border-dashed border-border transition-colors duration-200 ease-in-out',
  active: 'border-2',
  disabled: 'bg-muted border-border cursor-default pointer-events-none bg-opacity-30',
  accept: 'border border-primary bg-primary/10',
  reject: 'border border-destructive bg-destructive/10',
};

type InputProps = {
  width?: number;
  height?: number;
  className?: string;
  value?: File;
  onChange?: (file?: File) => void | Promise<void>;
  disabled?: boolean;
  dropzoneOptions?: Omit<DropzoneOptions, 'disabled'>;
};

const SingleFileDropzone = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { dropzoneOptions, width, height, value, className, disabled, onChange },
    ref,
  ) => {
    // dropzone configuration
    const {
      getRootProps,
      getInputProps,
      acceptedFiles,
      fileRejections,
      isFocused,
      isDragAccept,
      isDragReject,
    } = useDropzone({
      multiple: false,
      disabled,
      onDrop: (acceptedFiles) => {
        const file = acceptedFiles[0];
        if (file) {
          void onChange?.(file);
        }
      },
      ...dropzoneOptions,
    });

    // styling
    const dropZoneClassName = React.useMemo(
      () =>
        twMerge(
          variants.base,
          isFocused && variants.active,
          disabled && variants.disabled,
          (isDragReject ?? fileRejections[0]) && variants.reject,
          isDragAccept && variants.accept,
          className,
        ).trim(),
      [
        isFocused,
        fileRejections,
        isDragAccept,
        isDragReject,
        disabled,
        className,
      ],
    );

    return (
      <div className="relative">
        <div
          {...getRootProps({
            className: dropZoneClassName,
            style: {
              width,
              height,
            },
          })}
        >
          {/* Main File Input */}
          <input ref={ref} {...getInputProps()} />

          {value ? (
            // File Preview
            <div className="flex flex-col items-center justify-center space-y-2 text-center p-4">
               <File className="h-8 w-8 text-primary" />
               <div className="text-sm font-medium text-foreground truncate max-w-[200px]">
                 {value.name}
               </div>
               <div className="text-xs text-muted-foreground">
                 {(value.size / 1024 / 1024).toFixed(2)} MB
               </div>
            </div>
          ) : (
            // Upload Icon
            <div className="flex flex-col items-center justify-center text-xs text-muted-foreground p-4 text-center space-y-2">
              <UploadCloud className="mb-2 h-7 w-7" />
              <div className="text-muted-foreground">
                <span className="font-medium text-primary">Click to upload</span> or drag and drop
              </div>
              <div className="text-[10px] text-muted-foreground/70">
                PDF, PNG, JPG (max 10MB)
              </div>
            </div>
          )}

          {/* Remove File Icon */}
          {value && !disabled && (
            <div
              className="group absolute right-0 top-0 -translate-y-1/4 translate-x-1/4 transform"
              onClick={(e) => {
                e.stopPropagation();
                void onChange?.(undefined);
              }}
            >
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-md border border-border transition-all duration-300 hover:h-6 hover:w-6 hover:bg-destructive text-muted-foreground hover:text-white cursor-pointer">
                <X className="h-3 w-3" />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  },
);
SingleFileDropzone.displayName = 'SingleFileDropzone';

export { SingleFileDropzone };
