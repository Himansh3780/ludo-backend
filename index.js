const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// In-memory match store (OK for now)
let waitingUser = null;
let matches = {}; 
// structure:
// matches[matchId] = {
//   playerA,
//   playerB,
//   roomCode: ""
// }

function createMatchId(a, b) {
  return `${a}_${b}`;
}

// JOIN MATCH
app.post("/join", (req, res) => {
  const { uid } = req.body;

  // If user already in a match, return status
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

  if (!waitingUser) {
    waitingUser = uid;
    return res.json({ status: "waiting" });
  }

  if (waitingUser === uid) {
    return res.json({ status: "waiting" });
  }

  const playerA = waitingUser;
  const playerB = uid;
  waitingUser = null;

  const matchId = createMatchId(playerA, playerB);
  matches[matchId] = { playerA, playerB, roomCode: "" };

  return res.json({
    status: "matched",
    matchId,
    playerA,
    playerB
  });
});

// PLAYER A SENDS ROOM CODE
app.post("/room-code", (req, res) => {
  const { matchId, uid, roomCode } = req.body;
  const match = matches[matchId];

  if (!match) return res.status(400).json({ error: "Match not found" });
  if (match.playerA !== uid)
    return res.status(403).json({ error: "Only Player A can send code" });

  match.roomCode = roomCode;
  res.json({ success: true });
});

// PLAYER B CHECKS STATUS
app.post("/status", (req, res) => {
  const { matchId } = req.body;
  const match = matches[matchId];

  if (!match) return res.status(400).json({ error: "Match not found" });

  res.json({
    roomCode: match.roomCode || null
  });
});

app.listen(3000, () => console.log("Backend running"));
