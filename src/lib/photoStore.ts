import { db } from "@/lib/db";
import type { PhotoRecord } from "@/lib/photoTypes";

export async function savePhoto(mealId: string, blob: Blob): Promise<string> {
  const id = crypto.randomUUID();
  const record: PhotoRecord = {
    id,
    mealId,
    blob,
    createdAt: Date.now(),
  };
  await db.photos.add(record);
  return id;
}

export async function getPhotosByMealId(mealId: string): Promise<PhotoRecord[]> {
  return db.photos.where("mealId").equals(mealId).sortBy("createdAt");
}

export async function getPhoto(id: string): Promise<PhotoRecord | undefined> {
  return db.photos.get(id);
}

export async function deletePhoto(id: string): Promise<void> {
  await db.photos.delete(id);
}

export async function reassignPhotos(fromMealId: string, toMealId: string): Promise<string[]> {
  const photos = await getPhotosByMealId(fromMealId);
  await db.transaction("rw", db.photos, async () => {
    for (const photo of photos) {
      await db.photos.update(photo.id, { mealId: toMealId });
    }
  });
  return photos.map((photo) => photo.id);
}

export async function deletePhotosByMealId(mealId: string): Promise<void> {
  await db.photos.where("mealId").equals(mealId).delete();
}
