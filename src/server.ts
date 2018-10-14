import * as express from "express";
import {Request, Response} from "express";
import * as compression from "compression";
import * as parser from "body-parser";
import * as path from "path";
import * as hbs from "express-handlebars";
import {Database} from "sqlite3";
import {addScore, getScores, Score} from "./scores";
import * as bearerToken from "express-bearer-token";

const db = new Database("data/scores.db", (error: Error) => { if(error) throw error; });
db.run("CREATE TABLE IF NOT EXISTS scores(id INTEGER PRIMARY KEY, name text, score int)");

export const app = express();
app.engine('.hbs', hbs({extname: '.hbs'}));
app.set("db", db);
app.set("port", process.env.PORT || 80);
app.set("token",  process.env.TOKEN || "default-token");
app.set("views", path.join(__dirname, "/../views"));
app.set("view engine", ".hbs");
app.use(compression());
app.use(bearerToken());
app.use(parser.json());
app.use(parser.urlencoded({ extended: true }));

/**
 * Index WebUI page.
 */
app.get("/", async (req: Request, res: Response) => {
    res.render("scores", {
        scores: await getScores(100)
    });
});

/**
 * Listing all scores.
 */
app.get("/api", async (req: Request, res: Response) => {
    let scores;
    try {
        scores = await getScores(10);
    } catch(e) {
        res.status(500);
        res.json({error: true, code: 500, description: "Internal Server Error"});
        console.error(e);
    }
    res.json({error: false, scores: scores, count: scores.length})
});

/**
 * Adding a new score.
 */
app.put("/api", async (req: Request, res: Response) => {
    if((<any>req).token != app.get("token")) {
        res.status(401);
        res.json({error: true, code: 401, description: "Unauthorized"});
        console.warn("denied request with wrong token from " + req.ip);
        return;
    }

    let username: string = req.body.username;
    let submittedScore: number = req.body.score;

    if(username.length === 0) {
        username = "Anon";
    }

    let score: Score;
    try {
        score = await addScore(username, submittedScore);
    } catch(e) {
        res.status(500);
        res.json({error: true, code: 500, description: "Internal Server Error"});
        console.error(e);
    }
    res.json({error: false, position: score.position});
});

/**
 * API 404 Error.
 */
app.use("/api/*", (req: Request, res: Response) => {
    res.status(404);
    res.json({error: true, code: 404, description: "Not Found"});
});  

/**
 * WebUI 404 Error.
 */
app.use((req: Request, res: Response) => {
    res.status(404);
    res.render("error", { code: 404, description: "Not Found" });
});

export const server = app.listen(app.get("port"), () => {
    console.log("Server started on port " + app.get("port"));
    console.log("Press CTRL-C to stop\n");
});