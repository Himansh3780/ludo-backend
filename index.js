const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

let waitingUser = null;
let matches = {};

function createMatchId(a, b) {
  return `${a}_${b}`;
}

app.post("/join", (req, res) => {
  const { uid } = req.body;

  for (const id in matches) {
    const m = matches[id];
    if (m.playerA === uid || m.playerB === uid)
      return res.json({ status: "matched", matchId: id, playerA: m.playerA, playerB: m.playerB });
  }

  if (!waitingUser || waitingUser === uid) {
    waitingUser = uid;
    return res.json({ status: "waiting" });
  }

  const matchId = createMatchId(waitingUser, uid);
  matches[matchId] = { playerA: waitingUser, playerB: uid, roomCode: "", result: null };
  waitingUser = null;

  res.json({ status: "matched", matchId, playerA: matches[matchId].playerA, playerB: uid });
});

app.post("/room-code", (req, res) => {
  const { matchId, uid, roomCode } = req.body;
  const m = matches[matchId];
  if (!m || m.playerA !== uid) return res.sendStatus(403);
  m.roomCode = roomCode;
  res.json({ success: true });
});

app.post("/status", (req, res) => {
  const m = matches[req.body.matchId];
  if (!m) return res.sendStatus(404);
  res.json({ roomCode: m.roomCode || null });
});

app.post("/submit-result", (req, res) => {
  const { matchId, winnerUid, screenshotUrl, upiId } = req.body;
  matches[matchId].result = { winnerUid, screenshotUrl, upiId };
  res.json({ success: true });
});

app.post("/admin-result", (req, res) => {
  res.json(matches[req.body.matchId]?.result || {});
});

app.listen(3000);
