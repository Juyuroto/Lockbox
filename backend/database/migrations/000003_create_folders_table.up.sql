CREATE TABLE folders (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    parent_id BIGINT REFERENCES folders (id),
    user_id BIGINT NOT NULL REFERENCES users (id),
    vault_id BIGINT NOT NULL REFERENCES vaults (id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_folders_deleted_at ON folders (deleted_at);
CREATE INDEX idx_folders_user_id ON folders (user_id);
CREATE INDEX idx_folders_vault_id ON folders (vault_id);
