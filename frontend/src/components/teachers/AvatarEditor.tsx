import { useState, useCallback } from 'react';
import Cropper, { type Area } from 'react-easy-crop';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { getCroppedImg } from '@/lib/utils'; // We'll need to add this utility
import { ZoomIn, ZoomOut } from 'lucide-react';

interface AvatarEditorProps {
    isOpen: boolean;
    imageSrc: string | null;
    onClose: () => void;
    onSave: (file: File) => void;
}

export function AvatarEditor({ isOpen, imageSrc, onClose, onSave }: AvatarEditorProps) {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

    const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixelsValue: Area) => {
        setCroppedAreaPixels(croppedAreaPixelsValue);
    }, []);

    const handleSave = async () => {
        if (imageSrc && croppedAreaPixels) {
            try {
                const croppedImageBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
                const file = new File([croppedImageBlob], "avatar.jpg", { type: "image/jpeg" });
                onSave(file);
                onClose();
            } catch (e) {
                console.error(e);
            }
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Edit Profile Picture</DialogTitle>
                </DialogHeader>

                <div className="relative h-[300px] w-full bg-muted rounded-md overflow-hidden">
                    {imageSrc && (
                        <Cropper
                            image={imageSrc}
                            crop={crop}
                            zoom={zoom}
                            aspect={1}
                            onCropChange={setCrop}
                            onCropComplete={onCropComplete}
                            onZoomChange={setZoom}
                            cropShape="round"
                            showGrid={false}
                        />
                    )}
                </div>

                <div className="flex items-center gap-4 py-4">
                    <ZoomOut className="w-4 h-4 text-muted-foreground" />
                    <Slider
                        value={[zoom]}
                        min={1}
                        max={3}
                        step={0.1}
                        onValueChange={(value: number[]) => setZoom(value[0])}
                        className="flex-1"
                    />
                    <ZoomIn className="w-4 h-4 text-muted-foreground" />
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSave}>Save</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
