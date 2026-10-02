import asyncio
from pathlib import Path

from fastapi_mail import ConnectionConfig, FastMail, MessageSchema, MessageType

from app.core.config import get_settings


def _config() -> ConnectionConfig:
    s = get_settings()
    return ConnectionConfig(
        MAIL_USERNAME=s.mail_user or "",
        MAIL_PASSWORD=s.mail_password or "",
        MAIL_FROM=s.mail_from,
        MAIL_PORT=s.mail_port,
        MAIL_SERVER=s.mail_host,
        MAIL_STARTTLS=s.mail_tls,
        MAIL_SSL_TLS=s.mail_ssl,
        USE_CREDENTIALS=bool(s.mail_user),
        VALIDATE_CERTS=False,
    )


def send_report_email(recipients: list[str], subject: str, attachment_path: str) -> None:
    msg = MessageSchema(
        subject=f"Scheduled Report — {subject}",
        recipients=recipients,
        body=f"Attached: {Path(attachment_path).name}",
        subtype=MessageType.plain,
        attachments=[attachment_path],
    )
    asyncio.run(FastMail(_config()).send_message(msg))
