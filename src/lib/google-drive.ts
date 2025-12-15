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
