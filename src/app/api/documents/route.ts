import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { writeFile, mkdir, unlink } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";

const UPLOAD_DIR = join(process.cwd(), "uploads");
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
];

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const applicationToken = formData.get("applicationToken") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    if (!applicationToken) {
      return NextResponse.json(
        { error: "Application token is required" },
        { status: 400 }
      );
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "File type not allowed. Please upload PDF, JPG, or PNG." },
        { status: 400 }
      );
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File exceeds 10MB limit." },
        { status: 400 }
      );
    }

    // Ensure uploads directory exists
    await mkdir(UPLOAD_DIR, { recursive: true });

    // Generate unique filename to avoid collisions
    const ext = file.name.split(".").pop() || "bin";
    const storedName = `${randomUUID()}.${ext}`;
    const storagePath = join(UPLOAD_DIR, storedName);

    // Write file to disk
    const bytes = await file.arrayBuffer();
    await writeFile(storagePath, Buffer.from(bytes));

    // Create database record
    const document = await prisma.document.create({
      data: {
        applicationToken,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        storagePath: storedName,
      },
    });

    return NextResponse.json({
      id: document.id,
      fileName: document.fileName,
      fileType: document.fileType,
      fileSize: document.fileSize,
    });
  } catch (error) {
    console.error("Upload failed:", error);
    return NextResponse.json(
      { error: "Upload failed. Please try again." },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("applicationToken");
  if (!token) {
    return NextResponse.json(
      { error: "Application token is required" },
      { status: 400 }
    );
  }

  const documents = await prisma.document.findMany({
    where: { applicationToken: token },
    select: {
      id: true,
      fileName: true,
      fileType: true,
      fileSize: true,
    },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(documents);
}

export async function DELETE(request: NextRequest) {
  const { id, applicationToken } = await request.json();

  if (!id || !applicationToken) {
    return NextResponse.json(
      { error: "Document ID and application token are required" },
      { status: 400 }
    );
  }

  // Only allow deleting documents that match the token (prevents unauthorized deletion)
  const doc = await prisma.document.findFirst({
    where: { id, applicationToken },
  });

  if (!doc) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  // Delete file from disk
  try {
    await unlink(join(UPLOAD_DIR, doc.storagePath));
  } catch {
    // File may already be gone; proceed with DB cleanup
  }

  await prisma.document.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
