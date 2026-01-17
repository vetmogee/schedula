"use client";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/app/_components/ui/dialog";

type Picture = {
  id: number;
  dataUrl: string;
};

type SalonGalleryProps = {
  pictures: Picture[];
  salonName: string;
};

export function SalonGallery({ pictures, salonName }: SalonGalleryProps) {

  if (pictures.length === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl bg-white/80 backdrop-blur shadow-md p-6 border border-white/60">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Gallery</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {pictures.map((picture) => {
          return (
            <Dialog key={picture.id}>
              <DialogTrigger asChild>
                <div className="relative rounded-lg overflow-hidden bg-gray-100 aspect-square cursor-pointer hover:opacity-90 transition-opacity">
                  <img
                    src={picture.dataUrl}
                    alt={`${salonName} - Picture ${picture.id}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src =
                        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23ddd' width='100' height='100'/%3E%3Ctext fill='%23999' font-family='sans-serif' font-size='14' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3EImage%3C/text%3E%3C/svg%3E";
                    }}
                  />
                </div>
              </DialogTrigger>
              <DialogContent className="max-w-5xl w-[95vw] p-2 bg-transparent border-none shadow-none">
                <DialogTitle className="sr-only">
                  {salonName} - Picture {picture.id}
                </DialogTitle>
                <div className="relative w-full flex items-center justify-center bg-black/20 rounded-lg p-4">
                  <img
                    src={picture.dataUrl}
                    alt={`${salonName} - Picture ${picture.id}`}
                    className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src =
                        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23ddd' width='100' height='100'/%3E%3Ctext fill='%23999' font-family='sans-serif' font-size='14' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3EImage%3C/text%3E%3C/svg%3E";
                    }}
                  />
                </div>
              </DialogContent>
            </Dialog>
          );
        })}
      </div>
    </div>
  );
}

