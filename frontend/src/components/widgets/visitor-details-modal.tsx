// The Modals are also available for use as option
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Img } from "react-image";
import { VisitorDetailsDialogProps } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useImagePreview } from "@/lib/helpers/index";
import { ImagePreviewDialog } from "./image-preview-dialog";

export default function VisitorDetailsDialog({
  visitor,
  onClose,
}: VisitorDetailsDialogProps) {
  const { selectedImage, handleImageClick, handleCloseImagePreview } =
    useImagePreview();

  return (
    <>
      <Dialog open={!!visitor} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-h-[80vh] max-w-[50vw] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Visitor Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {visitor.persons.map((person, index) => (
              <Card key={index} className="shadow-md">
                <CardHeader>
                  <CardTitle>Person {index + 1}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div>
                    <div className="px-5 py-3">
                      <span className="text-3xl font-medium fon">Name: </span>
                      <span className="font-bold text-3xl  fon">
                        {person.name}
                      </span>
                    </div>
                    <div className="px-5 py-3">
                      <span className="text-3xl font-medium fon">CNIC: </span>
                      <span className="font-bold text-3xl  fon">
                        {person.cnic}
                      </span>
                    </div>
                    <div className="px-5 py-3">
                      <span className="text-3xl font-medium fon ">
                        CNIC Image:{" "}
                      </span>
                      <Img
                        alt="CNIC Image"
                        className="aspect-square rounded-md object-cover my-3"
                        height="200"
                        src={person.cnicImage || "/placeholder.svg"}
                        width="200"
                        onClick={() => handleImageClick(person.cnicImage)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {selectedImage && (
        <ImagePreviewDialog
          imageUrl={selectedImage}
          onClose={handleCloseImagePreview}
        />
      )}
    </>
  );
}
