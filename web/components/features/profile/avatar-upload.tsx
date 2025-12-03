"use client";

import { useState, useRef, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Camera, Trash2, Upload } from "lucide-react";
import { useTranslations } from "next-intl";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";
import { authStore } from "@/lib/auth";
import { compressImage, validateImageFile, getInitials } from "@/lib/image-utils";
import { toast } from "sonner";

interface AvatarUploadProps {
  readonly currentAvatar?: string;
  readonly userName?: string;
}

export function AvatarUpload({ currentAvatar, userName }: AvatarUploadProps) {
  const t = useTranslations();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(currentAvatar || null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Sync preview with currentAvatar prop when it changes
  useEffect(() => {
    setPreview(currentAvatar || null);
  }, [currentAvatar]);

  const uploadMutation = useMutation({
    mutationFn: (avatar: string) => api.profile.uploadAvatar({ avatar }),
    onSuccess: (data) => {
      toast.success(t('profile.avatarUploaded'));
      // Add cache-busting timestamp to force image reload
      const avatarUrlWithTimestamp = `${data.avatar_url}?t=${Date.now()}`;
      // Update preview with S3 URL from server
      setPreview(avatarUrlWithTimestamp);
      // Update auth store immediately for header to reflect change
      authStore.getState().updateUser({ avatar: avatarUrlWithTimestamp });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: (error: unknown) => {
      toast.error(t('common.error'), {
        description: error instanceof Error ? error.message : t('profile.failedToUpload')
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.profile.deleteAvatar(),
    onSuccess: () => {
      toast.success(t('profile.avatarRemoved'));
      setPreview(null);
      // Update auth store immediately for header to reflect change
      authStore.getState().updateUser({ avatar: undefined });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: (error: unknown) => {
      toast.error(t('common.error'), {
        description: error instanceof Error ? error.message : t('profile.failedToRemove')
      });
    }
  });

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file
    const error = validateImageFile(file, 5);
    if (error) {
      toast.error(error);
      return;
    }

    setIsProcessing(true);

    try {
      // Compress image with aggressive settings
      const compressed = await compressImage(file, 200, 0.75);
      
      // Check compressed size (should be < 100KB)
      const sizeKB = Math.round((compressed.length * 3) / 4 / 1024);
      if (sizeKB > 100) {
        toast.warning(t('profile.compressing', { size: sizeKB }));
      }
      
      // Upload to server (preview will be set to S3 URL on success)
      uploadMutation.mutate(compressed);
    } catch (error) {
      toast.error(t('profile.failedToProcess'));
      console.error(error);
    } finally {
      setIsProcessing(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleDelete = () => {
    deleteMutation.mutate();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('profile.avatar')}</CardTitle>
        <CardDescription>
          {t('profile.uploadDescription')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-6 sm:flex-row">
          {/* Avatar Preview */}
          <div className="relative">
            <Avatar className="h-32 w-32 border-4 border-border">
              {preview ? (
                <AvatarImage 
                  key={preview} 
                  src={preview} 
                  alt={t('profile.altProfile')} 
                />
              ) : (
                <AvatarFallback className="text-4xl">
                  {getInitials(userName)}
                </AvatarFallback>
              )}
            </Avatar>
            {preview && (
              <div className="absolute -bottom-2 -right-2">
                <Button
                  size="icon"
                  variant="destructive"
                  className="h-10 w-10 rounded-full"
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Upload Controls */}
          <div className="flex flex-col gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            <Button
              onClick={handleUploadClick}
              disabled={isProcessing || uploadMutation.isPending}
              className="gap-2"
            >
              {isProcessing ? (
                <>
                  <Upload className="h-4 w-4 animate-spin" />
                  {t('profile.processing')}
                </>
              ) : (
                <>
                  <Camera className="h-4 w-4" />
                  {preview ? t('profile.changePhoto') : t('profile.uploadPhoto')}
                </>
              )}
            </Button>

            <p className="text-xs text-muted-foreground">
              {t('profile.recommendedSize')}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
