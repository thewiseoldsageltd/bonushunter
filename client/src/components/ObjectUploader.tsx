import React, { useState, useMemo, useEffect } from "react";
import type { ReactNode } from "react";
import Uppy from "@uppy/core";
import { DashboardModal } from "@uppy/react";
// Note: Uppy styles will be applied via the dashboard component
import AwsS3 from "@uppy/aws-s3";
import type { UploadResult } from "@uppy/core";
import { Button } from "@/components/ui/button";

interface ObjectUploaderProps {
  maxNumberOfFiles?: number;
  maxFileSize?: number;
  onGetUploadParameters: (file?: any) => Promise<{
    method: "PUT";
    url: string;
    headers?: Record<string, string>;
  }>;
  onComplete?: (
    result: UploadResult<Record<string, unknown>, Record<string, unknown>>
  ) => void;
  buttonClassName?: string;
  children: ReactNode;
}

/**
 * A file upload component that renders as a button and provides a modal interface for
 * file management.
 * 
 * Features:
 * - Renders as a customizable button that opens a file upload modal
 * - Provides a modal interface for:
 *   - File selection
 *   - File preview
 *   - Upload progress tracking
 *   - Upload status display
 * 
 * The component uses Uppy under the hood to handle all file upload functionality.
 * All file management features are automatically handled by the Uppy dashboard modal.
 * 
 * @param props - Component props
 * @param props.maxNumberOfFiles - Maximum number of files allowed to be uploaded
 *   (default: 1)
 * @param props.maxFileSize - Maximum file size in bytes (default: 10MB)
 * @param props.onGetUploadParameters - Function to get upload parameters (method and URL).
 *   Typically used to fetch a presigned URL from the backend server for direct-to-S3
 *   uploads.
 * @param props.onComplete - Callback function called when upload is complete. Typically
 *   used to make post-upload API calls to update server state and set object ACL
 *   policies.
 * @param props.buttonClassName - Optional CSS class name for the button
 * @param props.children - Content to be rendered inside the button
 */
export function ObjectUploader({
  maxNumberOfFiles = 1,
  maxFileSize = 10485760, // 10MB default
  onGetUploadParameters,
  onComplete,
  buttonClassName,
  children,
}: ObjectUploaderProps) {
  const [showModal, setShowModal] = useState(false);
  const [hasFiles, setHasFiles] = useState(false);
  
  // Create Uppy instance with proper dependency management
  const uppy = useMemo(() => 
    new Uppy({
      restrictions: {
        maxNumberOfFiles,
        maxFileSize,
        allowedFileTypes: ['image/*'], // Only allow images for logos
      },
      autoProceed: false,
      allowMultipleUploadBatches: false,
    })
      .on("file-added", (file) => {
        console.log('🔍 ObjectUploader: File added to Uppy:', file.name, file.type, file.size);
        setHasFiles(true);
      })
      .on("file-removed", () => {
        // Fixed logic: should be > 0, not > 1  
        setHasFiles(uppy.getFiles().length > 0);
      })
      .on("complete", (result: any) => {
        console.log('🔍 ObjectUploader: Upload complete:', result);
        onComplete?.(result);
        setShowModal(false);
        setHasFiles(false);
      })
      .on("upload-error", (file, error) => {
        console.error('🔍 ObjectUploader: Upload error:', error, file);
      })
      .on("error", (error) => {
        console.error('🔍 ObjectUploader: General error:', error);
      }),
    [maxNumberOfFiles, maxFileSize]
  );

  // Update AwsS3 plugin when onGetUploadParameters changes
  useEffect(() => {
    console.log('🔍 ObjectUploader: Setting up AwsS3 plugin with fresh upload parameters');
    
    // Add upload start listener for debugging
    uppy.on('upload', (data) => {
      console.log('🔍 ObjectUploader: Upload started!', data);
    });
    
    const plugin = uppy.getPlugin('AwsS3');
    if (!plugin) {
      uppy.use(AwsS3, {
        shouldUseMultipart: false,
        getUploadParameters: async (file: any) => {
          console.log('🔍 ObjectUploader: AwsS3 getUploadParameters called for:', file.name);
          const result = await onGetUploadParameters(file);
          
          // Ensure Content-Type header is included
          const headers = {
            'Content-Type': file.type,
            ...result.headers
          };
          
          console.log('🔍 ObjectUploader: Returning upload params:', { 
            method: result.method, 
            url: result.url.substring(0, 100) + '...', 
            headers 
          });
          
          return {
            ...result,
            headers
          };
        },
      });
    } else {
      plugin.setOptions({
        getUploadParameters: async (file: any) => {
          console.log('🔍 ObjectUploader: AwsS3 getUploadParameters called for:', file.name);
          const result = await onGetUploadParameters(file);
          
          // Ensure Content-Type header is included
          const headers = {
            'Content-Type': file.type,
            ...result.headers
          };
          
          console.log('🔍 ObjectUploader: Returning upload params:', { 
            method: result.method, 
            url: result.url.substring(0, 100) + '...', 
            headers 
          });
          
          return {
            ...result,
            headers
          };
        },
      });
    }

    // Cleanup on unmount - Note: Uppy doesn't have close() in this version
    return () => {
      // uppy.close(); // Not available in this version
    };
  }, [uppy, onGetUploadParameters]);

  // Disable global space bar protection when files are selected
  React.useEffect(() => {
    if (hasFiles) {
      document.body.setAttribute('data-uppy-active', 'true');
    } else {
      document.body.removeAttribute('data-uppy-active');
    }
    
    return () => {
      document.body.removeAttribute('data-uppy-active');
    };
  }, [hasFiles]);

  return (
    <div>
      <Button 
        onClick={() => {
          console.log('🔍 ObjectUploader: Button clicked - opening modal');
          setShowModal(true);
        }}
        className={buttonClassName} 
        type="button"
      >
        {children}
      </Button>

      {showModal && (
        <DashboardModal
          uppy={uppy}
          open={showModal}
          onRequestClose={() => {
            console.log('🔍 ObjectUploader: Modal close requested');
            setShowModal(false);
          }}
          proudlyDisplayPoweredByUppy={false}
          disablePageScrollWhenModalOpen={true}
          closeAfterFinish={true}
        />
      )}
    </div>
  );
}