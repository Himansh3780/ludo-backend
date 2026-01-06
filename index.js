const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

let waitingUser = null;
let matches = {};
// matches[matchId] = {
//   playerA,
//   playerB,
//   roomCode,
//   result: { winnerUid, screenshotUrl }
// }

function createMatchId(a, b) {
  return `${a}_${b}`;
}

app.post("/join", (req, res) => {
  const { uid } = req.body;

  for (const id in matches) {
    const m = matches[id];
    if (m.playerA === uid || m.playerB === uid) {
      return res.json({
        status: "matched",
        matchId: id,
        playerA: m.playerA,
        playerB: m.playerB,
        roomCode: m.roomCode || null
      });
    }
  }

  if (!waitingUser || waitingUser === uid) {
    waitingUser = uid;
    return res.json({ status: "waiting" });
  }

  const playerA = waitingUser;
  const playerB = uid;
  waitingUser = null;

  const matchId = createMatchId(playerA, playerB);
  matches[matchId] = { playerA, playerB, roomCode: "", result: null };

  res.json({ status: "matched", matchId, playerA, playerB });
});

app.post("/room-code", (req, res) => {
  const { matchId, uid, roomCode } = req.body;
  const match = matches[matchId];
  if (!match || match.playerA !== uid)
    return res.status(400).json({ error: "Invalid" });

  match.roomCode = roomCode;
  res.json({ success: true });
});

// NEW: submit result
app.post("/submit-result", (req, res) => {
  const { matchId, winnerUid, screenshotUrl } = req.body;
  const match = matches[matchId];
  if (!match) return res.status(400).json({ error: "Match not found" });

  match.result = { winnerUid, screenshotUrl };
  res.json({ success: true });
});

// NEW: admin view
app.post("/admin-result", (req, res) => {
  const { matchId } = req.body;
  const match = matches[matchId];
  if (!match) return res.status(400).json({ error: "Match not found" });
  res.json(match.result);
});

app.listen(3000, () => console.log("Backend running"));
