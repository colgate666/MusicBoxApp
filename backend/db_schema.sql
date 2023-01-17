CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT,
  email TEXT UNIQUE,
  password TEXT,
  avatar TEXT
);

CREATE TABLE user_likes (
  entity_id uuid,
  user_id uuid,
  type TEXT,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(entity_id, user_id)
);

CREATE TABLE play_history (
  user_id uuid,
  entity_id uuid,
  play_date TIMESTAMPTZ,
  type TEXT,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE play_queue (
  song_id uuid,
  user_id uuid,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE playlists (
  id uuid PRIMARY KEY,
  name uuid,
  owner uuid,
  private BOOLEAN,
  image TEXT,
  FOREIGN KEY(owner) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE playlist_items (
  playlist_id uuid,
  song_id uuid,
  FOREIGN KEY(playlist_id) REFERENCES playlists(id) ON DELETE CASCADE,
  UNIQUE(playlist_id, song_id)
);

CREATE TABLE comments (
  user_id uuid,
  entity_id uuid,
  commment TEXT,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);