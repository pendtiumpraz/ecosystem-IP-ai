"use client";

import { useState, useEffect } from "react";
import { Plus, Image as ImageIcon, Video, Loader2, Star, Trash2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LinkAssetModal } from "./LinkAssetModal";
import { ReplaceAssetButton } from "./ReplaceAssetButton";
import { showSuccess, showError, showConfirm } from "@/lib/sweetalert";
import { cn } from "@/lib/utils";

interface Asset {
    id: string;
    fileName: string;
    mediaType: "image" | "video";
    sourceType: "generated" | "linked" | "replaced";
    thumbnailUrl: string | null;
    publicUrl: string | null;
    isAccessible: boolean;
    isPrimary: boolean;
    createdAt: string;
}

interface AssetGalleryProps {
    entityType: "character" | "moodboard" | "animation" | "reference";
    entityId: string;
    userId: string;
    projectId?: string;
    mediaType?: "image" | "video";
    onSelectForGeneration?: (asset: Asset) => void;
    showAddButton?: boolean;
    showGenerateButton?: boolean;
    onGenerate?: () => void;
    maxItems?: number;
    className?: string;
}

export function AssetGallery({
    entityType,
    entityId,
    userId,
    projectId,
    mediaType = "image",
    onSelectForGeneration,
    showAddButton = true,
    showGenerateButton = false,
    onGenerate,
    maxItems,
    className,
}: AssetGalleryProps) {
    const [assets, setAssets] = useState<Asset[]>([]);
    const [primaryAssetId, setPrimaryAssetId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
    const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

    // Fetch assets
    const fetchAssets = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(
                `/api/assets/entity/${entityType}/${entityId}?userId=${userId}`
            );
            const data = await response.json();

            if (data.success) {
                setAssets(data.data.assets);
                setPrimaryAssetId(data.data.primaryAssetId);
            }
        } catch (err) {
            console.error("Error fetching assets:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (entityId && userId) {
            fetchAssets();
        }
    }, [entityType, entityId, userId]);

    // Handle set primary
    const handleSetPrimary = async (assetId: string) => {
        try {
            const response = await fetch(`/api/assets/${assetId}/primary`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId }),
            });

            const data = await response.json();
            if (data.success) {
                setPrimaryAssetId(assetId);
                showSuccess("Set as primary image");
            }
        } catch (err) {
            showError("Failed to set primary");
        }
    };

    // Handle delete
    const handleDelete = async (assetId: string) => {
        const confirmed = await showConfirm(
            "Delete Asset",
            "Are you sure you want to delete this asset?"
        );

        if (!confirmed) return;

        try {
            const response = await fetch(`/api/assets/${assetId}?userId=${userId}`, {
                method: "DELETE",
            });

            const data = await response.json();
            if (data.success) {
                setAssets(assets.filter(a => a.id !== assetId));
                showSuccess("Asset deleted");
            }
        } catch (err) {
            showError("Failed to delete asset");
        }
    };

    // Handle asset linked - from LinkAssetModal
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleAssetLinked = (asset: any) => {
        const newAsset: Asset = {
            id: asset.id,
            fileName: asset.fileName,
            mediaType: asset.mediaType,
            sourceType: asset.sourceType,
            thumbnailUrl: asset.urls?.thumbnailUrl || null,
            publicUrl: asset.urls?.publicUrl || null,
            isAccessible: asset.isAccessible ?? true,
            isPrimary: false,
            createdAt: new Date().toISOString(),
        };
        setAssets([newAsset, ...assets]);
    };

    // Handle asset replaced - from ReplaceAssetButton
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleAssetReplaced = (replacedAsset: any) => {
        setAssets(assets.map(a => {
            if (a.id === replacedAsset.id) {
                return {
                    ...a,
                    thumbnailUrl: replacedAsset.urls?.thumbnailUrl || a.thumbnailUrl,
                    publicUrl: replacedAsset.urls?.publicUrl || a.publicUrl,
                    sourceType: replacedAsset.sourceType || 'replaced',
                    isAccessible: true,
                };
            }
            return a;
        }));
    };

    const displayAssets = maxItems ? assets.slice(0, maxItems) : assets;

    return (
        <div className={cn("space-y-4", className)}>
            {/* Header */}
            <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-700 flex items-center gap-2">
                    {mediaType === "image" ? (
                        <ImageIcon className="h-4 w-4" />
                    ) : (
                        <Video className="h-4 w-4" />
                    )}
                    {mediaType === "image" ? "Images" : "Videos"} ({assets.length})
                </h4>

                <div className="flex gap-2">
                    {showGenerateButton && onGenerate && (
                        <Button size="sm" onClick={onGenerate} className="bg-orange-500 hover:bg-orange-600">
                            Generate
                        </Button>
                    )}
                    {showAddButton && (
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setIsLinkModalOpen(true)}
                        >
                            <Plus className="h-4 w-4 mr-1" />
                            Add from Drive
                        </Button>
                    )}
                </div>
            </div>

            {/* Loading */}
            {isLoading && (
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                </div>
            )}

            {/* Empty state */}
            {!isLoading && assets.length === 0 && (
                <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed">
                    <ImageIcon className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                    <p className="text-gray-500 text-sm">No {mediaType}s yet</p>
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setIsLinkModalOpen(true)}
                        className="mt-2"
                    >
                        <Plus className="h-4 w-4 mr-1" />
                        Add from Drive
                    </Button>
                </div>
            )}

            {/* Gallery Grid */}
            {!isLoading && assets.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {displayAssets.map((asset) => (
                        <div
                            key={asset.id}
                            className={cn(
                                "relative group rounded-lg overflow-hidden border bg-gray-50",
                                !asset.isAccessible && "border-orange-300 bg-orange-50",
                                selectedAsset?.id === asset.id && "ring-2 ring-orange-500"
                            )}
                        >
                            {/* Thumbnail */}
                            <div className="aspect-square relative">
                                {asset.thumbnailUrl && asset.isAccessible ? (
                                    <img
                                        src={asset.thumbnailUrl}
                                        alt={asset.fileName}
                                        className="w-full h-full object-cover cursor-pointer"
                                        onClick={() => onSelectForGeneration?.(asset)}
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = "/placeholder-image.png";
                                        }}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        {!asset.isAccessible ? (
                                            <AlertTriangle className="h-8 w-8 text-orange-400" />
                                        ) : (
                                            <ImageIcon className="h-8 w-8 text-gray-300" />
                                        )}
                                    </div>
                                )}

                                {/* Primary badge */}
                                {asset.id === primaryAssetId && (
                                    <div className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1">
                                        <Star className="h-3 w-3" />
                                        Primary
                                    </div>
                                )}

                                {/* Source type badge */}
                                <div className="absolute top-2 right-2">
                                    <span className={cn(
                                        "px-2 py-0.5 rounded text-xs",
                                        asset.sourceType === "generated" && "bg-purple-100 text-purple-700",
                                        asset.sourceType === "linked" && "bg-blue-100 text-blue-700",
                                        asset.sourceType === "replaced" && "bg-orange-100 text-orange-700"
                                    )}>
                                        {asset.sourceType}
                                    </span>
                                </div>

                                {/* Hover actions */}
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    {asset.isAccessible && asset.id !== primaryAssetId && (
                                        <Button
                                            size="sm"
                                            variant="secondary"
                                            onClick={() => handleSetPrimary(asset.id)}
                                        >
                                            <Star className="h-4 w-4" />
                                        </Button>
                                    )}
                                    <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={() => handleDelete(asset.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            {/* Replace Button for inaccessible */}
                            {!asset.isAccessible && (
                                <div className="p-2">
                                    <ReplaceAssetButton
                                        assetId={asset.id}
                                        userId={userId}
                                        isAccessible={false}
                                        onReplace={handleAssetReplaced}
                                        compact
                                    />
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Show more indicator */}
                    {maxItems && assets.length > maxItems && (
                        <div className="aspect-square flex items-center justify-center bg-gray-100 rounded-lg border-2 border-dashed text-gray-500">
                            +{assets.length - maxItems} more
                        </div>
                    )}
                </div>
            )}

            {/* Select for generation */}
            {onSelectForGeneration && selectedAsset && (
                <div className="bg-orange-50 p-3 rounded-lg text-sm flex items-center justify-between">
                    <span>
                        Selected: <strong>{selectedAsset.fileName}</strong>
                    </span>
                    <Button size="sm" onClick={() => onSelectForGeneration(selectedAsset)}>
                        Use as Reference
                    </Button>
                </div>
            )}

            {/* Link Asset Modal */}
            <LinkAssetModal
                isOpen={isLinkModalOpen}
                onClose={() => setIsLinkModalOpen(false)}
                entityType={entityType}
                entityId={entityId}
                userId={userId}
                projectId={projectId}
                mediaType={mediaType}
                onSuccess={handleAssetLinked}
            />
        </div>
    );
}
