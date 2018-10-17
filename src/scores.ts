import { Database } from "sqlite3";
import {app} from "./server";

export interface Score {
    id: number;
    username: string;
    score: number;
    position: number;
}

 /**
  * Get top scores.
  * @param count How many scores to retrieve.
  *              Will return all when the number is negative.
  */
export async function getScores(count: number = -1) {
    let db: Database = app.get("db");
    const query = `SELECT
    s.id, s.name, s.score
    FROM scores s
    ORDER BY s.score DESC`;

    return new Promise<Score[]>((resolve, reject) => {
        db.all(query, [], (error: Error, rows: Score[]) => {
            if(error) {
                throw error;
            }
            let rank = 0;
            let lastScore = 0;
            for (const row of rows) {
                if(lastScore != row.score) {
                    rank++;
                }
                row.position = rank;
                lastScore = row.score;
            }

            if(count < 0) {
                resolve(rows);
            } else {
                resolve(rows.slice(0, count));
            }
        });
    });  
}

/**
 * Get specific score.
 * @param id Score id
 */
export async function findScore(id?: number) {
    const scores = await getScores();
    return scores.find(score => score.id == id);
}

/**
 * Add a new score
 * @param username Name of the user that submitted this score
 * @param score Scorepoints
 */
export async function addScore(username: string, score: number) {
    let db: Database = app.get("db");
    return new Promise<Score>((resolve, reject) => {
        db.run("INSERT INTO scores(name, score) VALUES (?, ?)", [username, score], async function (error: Error) {
            if (error) throw error;
            const s = await findScore(this.lastID);
            resolve(s);
        });  
    });  
}

/**
 * Delete an existing score.
 * @param score Score to delete.
 */
export async function deleteScore(score: Score) {
    let db: Database = app.get("db");
    return new Promise((resolve, reject) => {
        db.run("DELETE FROM scores WHERE id = ?", [score.id], async function (error: Error) {
            if (error) throw error;
            resolve();
        });  
    });  
}
