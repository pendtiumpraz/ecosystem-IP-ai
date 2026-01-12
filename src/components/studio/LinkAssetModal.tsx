"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link2, Loader2, CheckCircle2, AlertCircle, ExternalLink } from "lucide-react";
import { showSuccess, showError } from "@/lib/sweetalert";

interface LinkAssetModalProps {
    isOpen: boolean;
    onClose: () => void;
    entityType: "character" | "moodboard" | "animation" | "reference";
    entityId: string;
    userId: string;
    projectId?: string;
    mediaType?: "image" | "video";
    onSuccess?: (asset: LinkedAsset) => void;
}

interface LinkedAsset {
    id: string;
    fileName: string;
    mediaType: string;
    sourceType: string;
    urls: {
        downloadUrl: string;
        thumbnailUrl: string;
        publicUrl: string;
    };
    isAccessible: boolean;
}

export function LinkAssetModal({
    isOpen,
    onClose,
    entityType,
    entityId,
    userId,
    projectId,
    mediaType = "image",
    onSuccess,
}: LinkAssetModalProps) {
    const [driveUrl, setDriveUrl] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // Extract file ID and generate preview when URL changes
    const handleUrlChange = (url: string) => {
        setDriveUrl(url);
        setError(null);

        // Try to extract file ID and show preview
        const fileIdMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) ||
            url.match(/[?&]id=([a-zA-Z0-9_-]+)/);

        if (fileIdMatch) {
            const fileId = fileIdMatch[1];
            setPreviewUrl(`https://drive.google.com/thumbnail?id=${fileId}&sz=w400`);
        } else {
            setPreviewUrl(null);
        }
    };

    const handleSubmit = async () => {
        if (!driveUrl.trim()) {
            setError("Please enter a Google Drive URL");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch("/api/assets/link", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId,
                    projectId,
                    entityType,
                    entityId,
                    driveUrl,
                    mediaType,
                }),
            });

            const data = await response.json();

            if (!data.success) {
                setError(data.error || "Failed to link asset");
                return;
            }

            showSuccess("Asset linked successfully!");
            onSuccess?.(data.data);
            handleClose();
        } catch (err) {
            setError("Network error. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setDriveUrl("");
        setError(null);
        setPreviewUrl(null);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Link2 className="h-5 w-5 text-orange-500" />
                        Add from Google Drive
                    </DialogTitle>
                    <DialogDescription>
                        Paste a Google Drive sharing link to add an existing {mediaType} to this {entityType}.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* URL Input */}
                    <div className="space-y-2">
                        <Label htmlFor="driveUrl">Google Drive URL</Label>
                        <Input
                            id="driveUrl"
                            placeholder="https://drive.google.com/file/d/..."
                            value={driveUrl}
                            onChange={(e) => handleUrlChange(e.target.value)}
                            disabled={isLoading}
                        />
                        <p className="text-xs text-gray-500">
                            Make sure the file is shared as &quot;Anyone with the link can view&quot;
                        </p>
                    </div>

                    {/* Preview */}
                    {previewUrl && (
                        <div className="space-y-2">
                            <Label>Preview</Label>
                            <div className="relative rounded-lg border bg-gray-50 p-2">
                                <img
                                    src={previewUrl}
                                    alt="Preview"
                                    className="w-full h-48 object-contain rounded"
                                    onError={() => setPreviewUrl(null)}
                                />
                                <div className="absolute top-2 right-2">
                                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 p-3 rounded-lg">
                            <AlertCircle className="h-4 w-4 flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Help */}
                    <div className="bg-orange-50 p-3 rounded-lg text-sm">
                        <p className="font-medium text-orange-800 mb-1">How to get a shareable link:</p>
                        <ol className="text-orange-700 space-y-1 ml-4 list-decimal">
                            <li>Right-click the file in Google Drive</li>
                            <li>Click &quot;Share&quot;</li>
                            <li>Set to &quot;Anyone with the link&quot;</li>
                            <li>Copy the link and paste it above</li>
                        </ol>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={handleClose} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isLoading || !driveUrl.trim()}
                        className="bg-orange-500 hover:bg-orange-600"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Linking...
                            </>
                        ) : (
                            <>
                                <Link2 className="h-4 w-4 mr-2" />
                                Link Asset
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
