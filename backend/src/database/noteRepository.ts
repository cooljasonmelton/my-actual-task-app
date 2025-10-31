import db from "./db";
import type { Note } from "./types";

const DEFAULT_USER_IDENTIFIER = "default-user";
const DEFAULT_USER_DISPLAY_NAME = "Default User";

type DbNoteRow = {
  id: number;
  user_id: number;
  content: string | null;
  updated_at: string | Date;
};

type DbUserRow = {
  id: number;
  identifier: string;
  display_name: string | null;
  created_at: string | Date;
};

const statements = {
  insertDefaultUserIfMissing: db.prepare(`
    INSERT INTO users (identifier, display_name)
    VALUES (?, ?)
    ON CONFLICT(identifier) DO NOTHING
  `),
  selectUserByIdentifier: db.prepare(`
    SELECT id, identifier, display_name, created_at
    FROM users
    WHERE identifier = ?
    LIMIT 1
  `),
  insertNoteIfMissing: db.prepare(`
    INSERT INTO notes (user_id, content)
    VALUES (?, '')
    ON CONFLICT(user_id) DO NOTHING
  `),
  selectNoteByUserId: db.prepare(`
    SELECT id, user_id, content, updated_at
    FROM notes
    WHERE user_id = ?
    LIMIT 1
  `),
  updateNoteContent: db.prepare(`
    UPDATE notes
    SET content = ?, updated_at = CURRENT_TIMESTAMP
    WHERE user_id = ?
  `),
};

const ensureNoteRow = db.transaction((): DbNoteRow => {
  statements.insertDefaultUserIfMissing.run(
    DEFAULT_USER_IDENTIFIER,
    DEFAULT_USER_DISPLAY_NAME
  );

  const userRow = statements.selectUserByIdentifier.get(
    DEFAULT_USER_IDENTIFIER
  ) as DbUserRow | undefined;

  if (!userRow) {
    throw new Error("Failed to ensure default user for notes");
  }

  statements.insertNoteIfMissing.run(userRow.id);

  const noteRow = statements.selectNoteByUserId.get(userRow.id) as
    | DbNoteRow
    | undefined;

  if (!noteRow) {
    throw new Error("Failed to ensure default note record");
  }

  return noteRow;
});

const mapDbNoteToNote = (row: DbNoteRow): Note => ({
  id: row.id,
  userId: row.user_id,
  content: row.content ?? "",
  updatedAt: new Date(row.updated_at),
});

export const noteQueries = {
  getDefaultNote(): Note {
    const noteRow = ensureNoteRow();
    return mapDbNoteToNote(noteRow);
  },

  updateDefaultNote(content: string): Note {
    const noteRow = ensureNoteRow();
    statements.updateNoteContent.run(content, noteRow.user_id);
    const updatedRow = statements.selectNoteByUserId.get(noteRow.user_id) as
      | DbNoteRow
      | undefined;

    if (!updatedRow) {
      throw new Error("Failed to read updated note content");
    }

    return mapDbNoteToNote(updatedRow);
  },
};
