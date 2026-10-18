-- Used by @socket.io/postgres-adapter for event payloads too large for a NOTIFY message.
CREATE TABLE IF NOT EXISTS socket_io_attachments (
    id          BIGSERIAL UNIQUE,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    payload     BYTEA
);
