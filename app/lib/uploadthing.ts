import { createUploadthing, type FileRouter } from "uploadthing/server";

const f = createUploadthing();

export const ourFileRouter = {
  imageUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .onUploadComplete(async ({ file }) => {
      console.log("Upload complete for file:", file.name);
      return { uploadedBy: "test-builder" };
    }),
  fileUploader: f({
    image: { maxFileSize: "4MB", maxFileCount: 1 },
    pdf: { maxFileSize: "4MB", maxFileCount: 1 },
  })
    .onUploadComplete(async ({ file }) => {
      console.log("Upload complete for file:", file.name);
      return { uploadedBy: "test-builder" };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;

