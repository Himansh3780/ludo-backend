const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

let waitingUser = null;

// JOIN MATCH API
app.post("/join", (req, res) => {
  const { uid } = req.body;

  if (!waitingUser) {
    waitingUser = uid;
    return res.json({
      status: "waiting",
      role: "A"
    });
  } else {
    const playerA = waitingUser;
    const playerB = uid;
    waitingUser = null;

    return res.json({
      status: "matched",
      playerA,
      playerB
    });
  }
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
