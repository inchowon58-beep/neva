/** Vercel / Lambda 등 읽기 전용 파일시스템 환경 */
export function isServerlessDeploy(): boolean {
  return process.env.VERCEL === "1" || Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME);
}

/** Blob Store 연결 여부 (토큰 또는 OIDC store id) */
export function isBlobStorageConfigured(): boolean {
  if (process.env.BLOB_READ_WRITE_TOKEN?.trim()) return true;
  if (process.env.BLOB_STORE_ID?.trim()) return true;
  return false;
}

/** Vercel 등 서버리스에서는 Blob 사용 (OIDC 포함) */
export function shouldUseBlobStorage(): boolean {
  if (isBlobStorageConfigured()) return true;
  return isServerlessDeploy();
}

export class StorageNotConfiguredError extends Error {
  constructor(detail?: string) {
    super(
      detail ??
        "Vercel Blob Storage가 연결되지 않았거나 재배포가 필요합니다. " +
          "Vercel → neva 프로젝트 → Storage → blob-neva 연결 확인 후 Deployments에서 Redeploy 해 주세요."
    );
    this.name = "StorageNotConfiguredError";
  }
}

export function isReadOnlyFilesystemError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const msg = error.message.toLowerCase();
  return (
    msg.includes("erofs") ||
    msg.includes("read-only file system") ||
    msg.includes("eacces") ||
    error.name === "StorageNotConfiguredError"
  );
}

export function storageErrorMessage(error: unknown): string {
  if (error instanceof StorageNotConfiguredError) return error.message;

  if (error instanceof Error) {
    const msg = error.message;
    if (
      msg.includes("No blob credentials") ||
      msg.includes("No token found") ||
      msg.includes("BLOB_READ_WRITE_TOKEN") ||
      msg.includes("BLOB_STORE_ID")
    ) {
      return new StorageNotConfiguredError(
        "Blob 인증 정보를 찾을 수 없습니다. Storage 연결 후 반드시 Redeploy 해 주세요. " +
          "(Vercel은 BLOB_STORE_ID + OIDC 또는 BLOB_READ_WRITE_TOKEN 을 사용합니다.)"
      ).message;
    }
  }

  if (isReadOnlyFilesystemError(error)) {
    return new StorageNotConfiguredError().message;
  }

  return error instanceof Error ? error.message : "저장 실패";
}

/** @deprecated use isBlobStorageConfigured */
export function isBlobStorageEnabled(): boolean {
  return shouldUseBlobStorage();
}

export function assertStorageWritable(): void {
  if (isServerlessDeploy() && !shouldUseBlobStorage()) {
    throw new StorageNotConfiguredError();
  }
}
