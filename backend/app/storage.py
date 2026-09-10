import json
import os

import boto3
from botocore.exceptions import ClientError


class S3Storage:
    def __init__(self):
        self.bucket = os.environ["WEATHER_BUCKET"]
        self.client = boto3.client("s3", region_name=os.getenv("AWS_REGION"))

    def upload_json(self, filename: str, data: dict) -> None:
        self.client.put_object(
            Bucket=self.bucket,
            Key=filename,
            Body=json.dumps(data).encode("utf-8"),
            ContentType="application/json",
        )

    def list_files(self) -> list[dict]:
        files = []
        paginator = self.client.get_paginator("list_objects_v2")
        for page in paginator.paginate(Bucket=self.bucket):
            for item in page.get("Contents", []):
                files.append(
                    {
                        "name": item["Key"],
                        "size": item["Size"],
                        "created_at": item["LastModified"].isoformat(),
                    }
                )
        return files

    def get_json(self, filename: str) -> dict:
        try:
            result = self.client.get_object(Bucket=self.bucket, Key=filename)
            return json.loads(result["Body"].read().decode("utf-8"))
        except (ClientError, ValueError, KeyError) as exc:
            raise FileNotFoundError(filename) from exc
