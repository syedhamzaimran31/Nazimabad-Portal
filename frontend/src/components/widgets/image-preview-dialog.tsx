import {
  Dialog,
  DialogContent,
  DialogFooter,
} from "@/components/ui/dialog";

import { ImagePreviewDialogProps } from "@/lib/types";

export function ImagePreviewDialog({
  imageUrl,
  onClose,
}: ImagePreviewDialogProps) {
  return (
    <Dialog open={!!imageUrl} onOpenChange={onClose}>
      <DialogContent className="max-w-[50vw] max-h-[80vh] m-5  overflow-hidden">
        <img
          src={imageUrl}
          alt="Selected Image"
          className="w-[90vw] h-[50vh] object-contain p-5 "
        />
        <DialogFooter>
          {/* <DialogClose asChild>
            <Button variant="outline" onClick={onClose}>
              Close Preview
            </Button>
          </DialogClose> */}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
