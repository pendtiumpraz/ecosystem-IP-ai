/**
 * Google Drive Integration
 * - OAuth flow for user authentication
 * - Upload images/videos from AI generation
 * - Create MODO folder structure
 */

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const GOOGLE_REDIRECT_URI = process.env.NEXT_PUBLIC_APP_URL + "/api/auth/google/callback";

// Scopes needed for Drive access
const SCOPES = [
  "https://www.googleapis.com/auth/drive.file", // Create/edit files created by app
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile",
];

export interface GoogleTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink: string;
  webContentLink: string;
  thumbnailLink?: string;
}

/**
 * Generate OAuth URL for Google Drive authorization
 */
export function getGoogleAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: GOOGLE_REDIRECT_URI,
    response_type: "code",
    scope: SCOPES.join(" "),
    access_type: "offline",
    prompt: "consent",
    state,
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

/**
 * Exchange authorization code for tokens
 */
export async function exchangeCodeForTokens(code: string): Promise<GoogleTokens> {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      code,
      grant_type: "authorization_code",
      redirect_uri: GOOGLE_REDIRECT_URI,
    }),
  });

  const data = await response.json();

  if (data.error) {
    throw new Error(data.error_description || data.error);
  }

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: Date.now() + (data.expires_in * 1000),
  };
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(refreshToken: string): Promise<GoogleTokens> {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  const data = await response.json();

  if (data.error) {
    throw new Error(data.error_description || data.error);
  }

  return {
    accessToken: data.access_token,
    refreshToken: refreshToken, // Keep existing refresh token
    expiresAt: Date.now() + (data.expires_in * 1000),
  };
}

/**
 * Get or create MODO folder in user's Drive
 */
export async function getOrCreateModoFolder(accessToken: string): Promise<string> {
  // Search for existing MODO folder
  const searchResponse = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=name='MODO Creator Verse' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  const searchData = await searchResponse.json();

  if (searchData.files && searchData.files.length > 0) {
    return searchData.files[0].id;
  }

  // Create new folder
  const createResponse = await fetch("https://www.googleapis.com/drive/v3/files", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: "MODO Creator Verse",
      mimeType: "application/vnd.google-apps.folder",
    }),
  });

  const folder = await createResponse.json();
  return folder.id;
}

/**
 * Get or create project subfolder
 */
export async function getOrCreateProjectFolder(
  accessToken: string,
  parentFolderId: string,
  projectName: string
): Promise<string> {
  // Search for existing project folder
  const searchResponse = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=name='${projectName}' and '${parentFolderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  const searchData = await searchResponse.json();

  if (searchData.files && searchData.files.length > 0) {
    return searchData.files[0].id;
  }

  // Create new folder
  const createResponse = await fetch("https://www.googleapis.com/drive/v3/files", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: projectName,
      mimeType: "application/vnd.google-apps.folder",
      parents: [parentFolderId],
    }),
  });

  const folder = await createResponse.json();
  return folder.id;
}

/**
 * Upload file to Google Drive
 */
export async function uploadFileToDrive(
  accessToken: string,
  folderId: string,
  fileName: string,
  fileData: Buffer | Blob,
  mimeType: string
): Promise<DriveFile> {
  // Create file metadata
  const metadata = {
    name: fileName,
    parents: [folderId],
  };

  // Create multipart form
  const boundary = "modo_upload_boundary";
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  // Convert to base64 if Buffer
  let base64Data: string;
  if (Buffer.isBuffer(fileData)) {
    base64Data = fileData.toString("base64");
  } else {
    const arrayBuffer = await fileData.arrayBuffer();
    base64Data = Buffer.from(arrayBuffer).toString("base64");
  }

  const requestBody =
    delimiter +
    "Content-Type: application/json; charset=UTF-8\r\n\r\n" +
    JSON.stringify(metadata) +
    delimiter +
    `Content-Type: ${mimeType}\r\n` +
    "Content-Transfer-Encoding: base64\r\n\r\n" +
    base64Data +
    closeDelimiter;

  const response = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,webViewLink,webContentLink,thumbnailLink",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": `multipart/related; boundary=${boundary}`,
      },
      body: requestBody,
    }
  );

  const file = await response.json();

  if (file.error) {
    throw new Error(file.error.message);
  }

  // Make file publicly viewable
  await fetch(`https://www.googleapis.com/drive/v3/files/${file.id}/permissions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      role: "reader",
      type: "anyone",
    }),
  });

  return file;
}

/**
 * Upload image from URL to Google Drive
 */
export async function uploadImageFromUrl(
  accessToken: string,
  folderId: string,
  imageUrl: string,
  fileName: string
): Promise<DriveFile> {
  // Fetch image from URL
  const response = await fetch(imageUrl);
  const blob = await response.blob();
  const mimeType = response.headers.get("content-type") || "image/png";

  return uploadFileToDrive(accessToken, folderId, fileName, blob, mimeType);
}

/**
 * Get direct download/view URL for a file
 */
export function getDirectUrl(fileId: string): string {
  return `https://drive.google.com/uc?export=view&id=${fileId}`;
}

/**
 * Delete file from Drive (soft delete - move to trash)
 */
export async function trashFile(accessToken: string, fileId: string): Promise<void> {
  await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ trashed: true }),
  });
}

// ============ DRIVE URL UTILITIES ============

/**
 * Extract file ID from various Google Drive URL formats
 * Supports:
 * - https://drive.google.com/file/d/{fileId}/view
 * - https://drive.google.com/open?id={fileId}
 * - https://drive.google.com/uc?id={fileId}
 * - https://drive.google.com/uc?export=view&id={fileId}
 */
export function extractDriveFileId(url: string): string | null {
  if (!url) return null;

  const patterns = [
    /\/file\/d\/([a-zA-Z0-9_-]+)/,      // /file/d/{id}/...
    /[?&]id=([a-zA-Z0-9_-]+)/,          // ?id={id} or &id={id}
    /\/d\/([a-zA-Z0-9_-]+)/,            // /d/{id}/...
    /^([a-zA-Z0-9_-]{25,})$/,           // Just the ID itself
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  return null;
}

/**
 * Get download URL for server to download the original file
 * Used for AI processing (I2I, I2V)
 */
export function getDriveDownloadUrl(fileId: string): string {
  return `https://drive.google.com/uc?export=download&id=${fileId}`;
}

/**
 * Get thumbnail URL for displaying in gallery/preview
 * @param size - Thumbnail size (default: w300)
 */
export function getDriveThumbnailUrl(fileId: string, size: string = "w300"): string {
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=${size}`;
}

/**
 * Get public view URL for displaying the image
 */
export function getDrivePublicUrl(fileId: string): string {
  return `https://drive.google.com/uc?export=view&id=${fileId}`;
}

/**
 * Generate all URLs from a single file ID
 */
export interface DriveUrls {
  fileId: string;
  downloadUrl: string;    // For AI download (original quality)
  thumbnailUrl: string;   // For gallery preview (small)
  publicUrl: string;      // For full view
}

export function generateDriveUrls(fileId: string): DriveUrls {
  return {
    fileId,
    downloadUrl: getDriveDownloadUrl(fileId),
    thumbnailUrl: getDriveThumbnailUrl(fileId),
    publicUrl: getDrivePublicUrl(fileId),
  };
}

/**
 * Generate all URLs from a Drive URL input
 */
export function generateDriveUrlsFromInput(driveUrl: string): DriveUrls | null {
  const fileId = extractDriveFileId(driveUrl);
  if (!fileId) return null;
  return generateDriveUrls(fileId);
}

/**
 * Check if a Drive file is publicly accessible
 * @returns true if file can be accessed without authentication
 */
export async function checkDriveFileAccessible(fileId: string): Promise<boolean> {
  try {
    const response = await fetch(getDrivePublicUrl(fileId), {
      method: "HEAD",
      redirect: "follow"
    });

    // Google Drive returns 200 for accessible files
    // Returns 403 or redirect to login for private files
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Get file metadata from Drive API (requires access token)
 */
export interface DriveFileMetadata {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  thumbnailLink?: string;
  webViewLink?: string;
  webContentLink?: string;
}

export async function getDriveFileMetadata(
  accessToken: string,
  fileId: string
): Promise<DriveFileMetadata | null> {
  try {
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?fields=id,name,mimeType,size,thumbnailLink,webViewLink,webContentLink`,
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    );

    if (!response.ok) return null;

    const data = await response.json();
    return {
      id: data.id,
      name: data.name,
      mimeType: data.mimeType,
      size: parseInt(data.size || "0"),
      thumbnailLink: data.thumbnailLink,
      webViewLink: data.webViewLink,
      webContentLink: data.webContentLink,
    };
  } catch {
    return null;
  }
}

/**
 * Get file metadata without authentication (for public files)
 * Uses HEAD request to check file info
 */
export async function getPublicDriveFileInfo(fileId: string): Promise<{
  accessible: boolean;
  contentType?: string;
  contentLength?: number;
}> {
  try {
    const response = await fetch(getDriveDownloadUrl(fileId), {
      method: "HEAD",
      redirect: "follow"
    });

    return {
      accessible: response.ok,
      contentType: response.headers.get("content-type") || undefined,
      contentLength: parseInt(response.headers.get("content-length") || "0") || undefined,
    };
  } catch {
    return { accessible: false };
  }
}

/**
 * Download file from Drive (for public files)
 */
export async function downloadDriveFile(fileId: string): Promise<Buffer | null> {
  try {
    const response = await fetch(getDriveDownloadUrl(fileId), {
      redirect: "follow"
    });

    if (!response.ok) return null;

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch {
    return null;
  }
}

