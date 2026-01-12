"use client";

import { useState } from "react";

import { Button } from "@/app/_components/ui/button";
import { Input } from "@/app/_components/ui/input";
import { Label } from "@/app/_components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/app/_components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/_components/ui/select";

type Service = {
  id: number;
  name: string;
  price: number;
  duration: string;
  position: number;
};

type Category = {
  id: number;
  name: string;
  position: number;
  services: Service[];
};

type Props = {
  categories: Category[];
  currency: string;
  createCategoryAction: (formData: FormData) => Promise<void>;
  createServiceAction: (formData: FormData) => Promise<void>;
  updateCategoryAction: (formData: FormData) => Promise<void>;
  updateServiceAction: (formData: FormData) => Promise<void>;
  swapCategoryPositionAction: (formData: FormData) => Promise<void>;
  reorderServicesAction: (formData: FormData) => Promise<void>;
};

export function SalonServicesManager({
  categories,
  currency,
  createCategoryAction,
  createServiceAction,
  updateCategoryAction,
  updateServiceAction,
  swapCategoryPositionAction,
  reorderServicesAction,
}: Props) {
  const [categorySheetOpen, setCategorySheetOpen] = useState(false);
  const [serviceSheetOpen, setServiceSheetOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<
    string | undefined
  >(categories[0]?.id ? String(categories[0].id) : undefined);

  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingService, setEditingService] = useState<{
    service: Service;
    categoryId: number;
  } | null>(null);
  const [dragging, setDragging] = useState<{
    serviceId: number;
    categoryId: number;
  } | null>(null);

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white/80 backdrop-blur px-5 py-4 border border-white/60 shadow-sm">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-gray-900">
            Service setup
          </h2>
          <p className="text-sm text-gray-600">
            Start by creating a service category, then add services under it.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => setCategorySheetOpen(true)}
          >
            + New category
          </Button>
          <Button
            type="button"
            onClick={() => setServiceSheetOpen(true)}
            disabled={categories.length === 0}
          >
            + New service
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {categories.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-dashed border-pink-200 bg-pink-50/60 px-4 py-6 text-center text-sm text-pink-700">
            You don&apos;t have any service categories yet. Click{" "}
            <span className="font-semibold">New category</span> to create your
            first one.
          </div>
        ) : (
          categories.map((category) => (
            <div
              key={category.id}
              className="rounded-2xl bg-white/80 backdrop-blur border border-white/60 shadow-sm p-4 space-y-3"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold text-gray-900">
                    {category.name}
                  </h3>
                  <div className="flex items-center gap-1">
                    <form
                      action={swapCategoryPositionAction}
                      className="inline-flex"
                    >
                      <input type="hidden" name="id" value={category.id} />
                      <input type="hidden" name="direction" value="up" />
                      <Button
                        type="submit"
                        variant="ghost"
                        size="icon-sm"
                        disabled={category === categories[0]}
                        aria-label="Move category up"
                      >
                        ↑
                      </Button>
                    </form>
                    <form
                      action={swapCategoryPositionAction}
                      className="inline-flex"
                    >
                      <input type="hidden" name="id" value={category.id} />
                      <input type="hidden" name="direction" value="down" />
                      <Button
                        type="submit"
                        variant="ghost"
                        size="icon-sm"
                        disabled={category === categories[categories.length - 1]}
                        aria-label="Move category down"
                      >
                        ↓
                      </Button>
                    </form>
                  </div>
                </div>
                <span className="text-xs rounded-full bg-pink-100 text-pink-700 px-2 py-0.5">
                  {category.services.length}{" "}
                  {category.services.length === 1 ? "service" : "services"}
                </span>
              </div>

              {category.services.length === 0 ? (
                <p className="text-xs text-gray-500">
                  No services yet in this category.
                </p>
              ) : (
                <ul className="space-y-2">
                  {category.services.map((service, index) => (
                    <li
                      key={service.id}
                      className="flex items-center justify-between text-sm gap-2 rounded-md border border-transparent hover:border-pink-200 bg-white/70"
                      draggable
                      onDragStart={() =>
                        setDragging({
                          serviceId: service.id,
                          categoryId: category.id,
                        })
                      }
                      onDragOver={(e) => {
                        if (dragging?.categoryId === category.id) {
                          e.preventDefault();
                        }
                      }}
                      onDrop={async (e) => {
                        e.preventDefault();
                        if (
                          !dragging ||
                          dragging.categoryId !== category.id ||
                          dragging.serviceId === service.id
                        ) {
                          setDragging(null);
                          return;
                        }

                        const currentServices = category.services;
                        const fromIndex = currentServices.findIndex(
                          (s) => s.id === dragging.serviceId
                        );
                        const toIndex = currentServices.findIndex(
                          (s) => s.id === service.id
                        );
                        if (fromIndex === -1 || toIndex === -1) {
                          setDragging(null);
                          return;
                        }

                        const reordered = [...currentServices];
                        const [moved] = reordered.splice(fromIndex, 1);
                        reordered.splice(toIndex, 0, moved);

                        const orderedIds = reordered.map((s) => s.id);
                        const formData = new FormData();
                        formData.set("categoryId", String(category.id));
                        formData.set("orderedIds", JSON.stringify(orderedIds));
                        await reorderServicesAction(formData);

                        setDragging(null);
                      }}
                      onDragEnd={() => setDragging(null)}
                    >
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">
                          {service.name}
                        </span>
                        <span className="text-xs text-gray-500">
                          {service.duration}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-pink-700">
                          {currency} {service.price.toFixed(2)}
                        </span>
                        <div className="flex items-center gap-1">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon-sm"
                            onClick={() =>
                              setEditingService({
                                service,
                                categoryId: category.id,
                              })
                            }
                            aria-label="Edit service"
                          >
                            ✎
                          </Button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))
        )}
      </div>

      <Sheet open={categorySheetOpen} onOpenChange={setCategorySheetOpen}>
        <SheetContent side="bottom" className="rounded-t-3xl p-0 max-h-[70vh]">
          <SheetHeader className="border-b px-6 py-4">
            <SheetTitle>Create service category</SheetTitle>
          </SheetHeader>
          <form
            action={async (formData) => {
              await createCategoryAction(formData);
              setCategorySheetOpen(false);
            }}
            className="px-6 py-4 space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="category-name">Category name</Label>
              <Input
                id="category-name"
                name="name"
                placeholder="e.g. Haircuts, Coloring, Nails"
                required
              />
            </div>
            <SheetFooter className="flex flex-row justify-end gap-2 px-0 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCategorySheetOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Create category</Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      <Sheet
        open={!!editingCategory}
        onOpenChange={(open) => {
          if (!open) setEditingCategory(null);
        }}
      >
        <SheetContent side="bottom" className="rounded-t-3xl p-0 max-h-[70vh]">
          <SheetHeader className="border-b px-6 py-4">
            <SheetTitle>Edit category</SheetTitle>
          </SheetHeader>
          {editingCategory && (
            <form
              action={async (formData) => {
                await updateCategoryAction(formData);
                setEditingCategory(null);
              }}
              className="px-6 py-4 space-y-4"
            >
              <input
                type="hidden"
                name="id"
                value={editingCategory.id}
              />
              <div className="space-y-2">
                <Label htmlFor="edit-category-name">Category name</Label>
                <Input
                  id="edit-category-name"
                  name="name"
                  defaultValue={editingCategory.name}
                  required
                />
              </div>
              <SheetFooter className="flex flex-row justify-end gap-2 px-0 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingCategory(null)}
                >
                  Cancel
                </Button>
                <Button type="submit">Save</Button>
              </SheetFooter>
            </form>
          )}
        </SheetContent>
      </Sheet>

      <Sheet
        open={!!editingService}
        onOpenChange={(open) => {
          if (!open) setEditingService(null);
        }}
      >
        <SheetContent side="bottom" className="rounded-t-3xl p-0 max-h-[75vh]">
          <SheetHeader className="border-b px-6 py-4">
            <SheetTitle>Edit service</SheetTitle>
          </SheetHeader>
          {editingService && (
            <form
              action={async (formData) => {
                await updateServiceAction(formData);
                setEditingService(null);
              }}
              className="px-6 py-4 space-y-4"
            >
              <input
                type="hidden"
                name="id"
                value={editingService.service.id}
              />
              <div className="space-y-2">
                <Label htmlFor="edit-service-name">Service name</Label>
                <Input
                  id="edit-service-name"
                  name="name"
                  defaultValue={editingService.service.name}
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-service-price">Price</Label>
                  <Input
                    id="edit-service-price"
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    defaultValue={editingService.service.price}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-service-duration">Duration</Label>
                  <Input
                    id="edit-service-duration"
                    name="duration"
                    type="time"
                    step={60}
                    defaultValue={editingService.service.duration}
                    required
                  />
                </div>
              </div>
              <SheetFooter className="flex flex-row justify-end gap-2 px-0 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingService(null)}
                >
                  Cancel
                </Button>
                <Button type="submit">Save</Button>
              </SheetFooter>
            </form>
          )}
        </SheetContent>
      </Sheet>

      <Sheet open={serviceSheetOpen} onOpenChange={setServiceSheetOpen}>
        <SheetContent side="bottom" className="rounded-t-3xl p-0 max-h-[75vh]">
          <SheetHeader className="border-b px-6 py-4">
            <SheetTitle>Create service</SheetTitle>
          </SheetHeader>
          <form
            action={async (formData) => {
              // Ensure the chosen category id is submitted
              if (selectedCategoryId) {
                formData.set("categoryId", selectedCategoryId);
              }
              await createServiceAction(formData);
              setServiceSheetOpen(false);
            }}
            className="px-6 py-4 space-y-4"
          >
            <div className="space-y-2">
              <Label>Category</Label>
              <input
                type="hidden"
                name="categoryId"
                value={selectedCategoryId || ""}
              />
              <Select
                value={selectedCategoryId}
                onValueChange={setSelectedCategoryId}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem
                      key={category.id}
                      value={String(category.id)}
                    >
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="service-name">Service name</Label>
              <Input
                id="service-name"
                name="name"
                placeholder="e.g. Women's haircut"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="service-price">Price</Label>
                <Input
                  id="service-price"
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="e.g. 45"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="service-duration">Duration</Label>
                <Input
                  id="service-duration"
                  name="duration"
                  type="time"
                  step={60}
                  required
                />
              </div>
            </div>

            <SheetFooter className="flex flex-row justify-end gap-2 px-0 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setServiceSheetOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={!selectedCategoryId}>
                Create service
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </section>
  );
}


