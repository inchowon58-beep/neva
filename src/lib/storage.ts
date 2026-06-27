/** Vercel / Lambda 등 읽기 전용 파일시스템 환경 */
export function isServerlessDeploy(): boolean {
  return process.env.VERCEL === "1" || Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME);
}

export function isBlobStorageEnabled(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN?.trim());
}

export class StorageNotConfiguredError extends Error {
  constructor() {
    super(
      "Vercel 배포 환경에서는 데이터 저장을 위해 Vercel Blob Storage 연결이 필요합니다. " +
        "Vercel 대시보드 → 프로젝트 → Storage → Blob Store 생성 → Connect to Project 후 재배포해 주세요."
    );
    this.name = "StorageNotConfiguredError";
  }
}

export function assertStorageWritable(): void {
  if (isServerlessDeploy() && !isBlobStorageEnabled()) {
    throw new StorageNotConfiguredError();
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
  if (isReadOnlyFilesystemError(error)) {
    return new StorageNotConfiguredError().message;
  }
  return error instanceof Error ? error.message : "저장 실패";
}
