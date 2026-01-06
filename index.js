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
//   result
// }

function createMatchId(a, b) {
  return `${a}_${b}`;
}

// JOIN MATCH
app.post("/join", (req, res) => {
  const { uid } = req.body;

  // return existing match
  for (const id in matches) {
    const m = matches[id];
    if (m.playerA === uid || m.playerB === uid) {
      return res.json({
        status: "matched",
        matchId: id,
        playerA: m.playerA,
        playerB: m.playerB
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
  matches[matchId] = {
    playerA,
    playerB,
    roomCode: "",
    result: null
  };

  res.json({ status: "matched", matchId, playerA, playerB });
});

// PLAYER A SENDS ROOM CODE
app.post("/room-code", (req, res) => {
  const { matchId, uid, roomCode } = req.body;
  const match = matches[matchId];

  if (!match) return res.status(400).json({ error: "Match not found" });
  if (match.playerA !== uid)
    return res.status(403).json({ error: "Only Player A allowed" });

  match.roomCode = roomCode;
  res.json({ success: true });
});

// ✅ PLAYER B CHECKS ROOM CODE (THIS WAS MISSING)
app.post("/status", (req, res) => {
  const { matchId } = req.body;
  const match = matches[matchId];

  if (!match) return res.status(400).json({ error: "Match not found" });

  res.json({
    roomCode: match.roomCode || null
  });
});

// RESULT SUBMISSION
app.post("/submit-result", (req, res) => {
  const { matchId, winnerUid, screenshotUrl } = req.body;
  const match = matches[matchId];

  if (!match) return res.status(400).json({ error: "Match not found" });

  match.result = { winnerUid, screenshotUrl };
  res.json({ success: true });
});

app.listen(3000, () => console.log("Backend running"));
