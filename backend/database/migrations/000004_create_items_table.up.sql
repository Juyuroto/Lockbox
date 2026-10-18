CREATE TABLE items (
    id BIGSERIAL PRIMARY KEY,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    data TEXT NOT NULL,
    user_id BIGINT NOT NULL REFERENCES users (id),
    vault_id BIGINT NOT NULL REFERENCES vaults (id),
    folder_id BIGINT REFERENCES folders (id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_items_deleted_at ON items (deleted_at);
CREATE INDEX idx_items_user_id ON items (user_id);
CREATE INDEX idx_items_vault_id ON items (vault_id);
CREATE INDEX idx_items_folder_id ON items (folder_id);
