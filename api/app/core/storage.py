"""
S3-compatible storage helpers (presign, etc.).
Works with AWS S3, Supabase Storage, Cloudflare R2, MinIO.
"""
import boto3
from botocore.config import Config

from app.core.config import settings


def _get_s3_client():
    kwargs = dict(
        region_name=settings.storage_region,
        aws_access_key_id=settings.storage_access_key,
        aws_secret_access_key=settings.storage_secret_key,
        config=Config(signature_version="s3v4"),
    )
    if settings.storage_endpoint_url:
        kwargs["endpoint_url"] = settings.storage_endpoint_url
    return boto3.client("s3", **kwargs)


def generate_presigned_upload_url(object_key: str, content_type: str) -> str:
    """Return a presigned PUT URL valid for `presign_expiry_seconds`."""
    client = _get_s3_client()
    url = client.generate_presigned_url(
        "put_object",
        Params={
            "Bucket": settings.storage_bucket,
            "Key": object_key,
        },
        ExpiresIn=settings.presign_upload_expiry_seconds,
    )
    return url


def generate_presigned_download_url(object_key: str) -> str:
    """Return a presigned GET URL valid for `presign_download_expiry_seconds`."""
    client = _get_s3_client()
    url = client.generate_presigned_url(
        "get_object",
        Params={"Bucket": settings.storage_bucket, "Key": object_key},
        ExpiresIn=settings.presign_download_expiry_seconds,
    )
    return url


def get_object_metadata(object_key: str) -> dict[str, str | int | None]:
    client = _get_s3_client()
    result = client.head_object(Bucket=settings.storage_bucket, Key=object_key)
    return {
        "content_type": result.get("ContentType"),
        "content_length": result.get("ContentLength"),
        "etag": result.get("ETag"),
    }
