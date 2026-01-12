"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RefreshCw, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { showSuccess, showError } from "@/lib/sweetalert";

interface ReplaceAssetButtonProps {
    assetId: string;
    userId: string;
    isAccessible: boolean;
    onReplace?: (asset: ReplacedAsset) => void;
    compact?: boolean;
}

interface ReplacedAsset {
    id: string;
    fileName: string;
    sourceType: string;
    urls: {
        downloadUrl: string;
        thumbnailUrl: string;
        publicUrl: string;
    };
    isAccessible: boolean;
}

export function ReplaceAssetButton({
    assetId,
    userId,
    isAccessible,
    onReplace,
    compact = false,
}: ReplaceAssetButtonProps) {
    const [showInput, setShowInput] = useState(false);
    const [newUrl, setNewUrl] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleReplace = async () => {
        if (!newUrl.trim()) return;

        setIsLoading(true);

        try {
            const response = await fetch(`/api/assets/${assetId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId,
                    newDriveUrl: newUrl,
                }),
            });

            const data = await response.json();

            if (!data.success) {
                showError(data.error || "Failed to replace asset");
                return;
            }

            showSuccess("Asset replaced successfully!");
            onReplace?.(data.data);
            setShowInput(false);
            setNewUrl("");
        } catch (err) {
            showError("Network error. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    // If asset is accessible, just show a check mark
    if (isAccessible && !showInput) {
        return compact ? (
            <CheckCircle2 className="h-4 w-4 text-green-500" />
        ) : (
            <div className="flex items-center gap-1 text-green-600 text-xs">
                <CheckCircle2 className="h-3 w-3" />
                <span>Accessible</span>
            </div>
        );
    }

    // If not accessible or replacing
    if (!showInput) {
        return (
            <Button
                variant="outline"
                size={compact ? "sm" : "default"}
                onClick={() => setShowInput(true)}
                className={!isAccessible ? "border-orange-300 text-orange-600 hover:bg-orange-50" : ""}
            >
                {!isAccessible && <AlertTriangle className="h-4 w-4 mr-1" />}
                <RefreshCw className="h-4 w-4 mr-1" />
                {compact ? "" : (isAccessible ? "Replace" : "Replace (Broken)")}
            </Button>
        );
    }

    // Show input for new URL
    return (
        <div className="flex gap-2 items-center">
            <Input
                placeholder="Paste new Drive URL..."
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                disabled={isLoading}
                className="flex-1 text-sm"
            />
            <Button
                size="sm"
                onClick={handleReplace}
                disabled={isLoading || !newUrl.trim()}
                className="bg-orange-500 hover:bg-orange-600"
            >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
            </Button>
            <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                    setShowInput(false);
                    setNewUrl("");
                }}
                disabled={isLoading}
            >
                Cancel
            </Button>
        </div>
    );
}
