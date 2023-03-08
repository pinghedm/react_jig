import React, { useState, useCallback, useMemo } from "react";

interface OptimalSize {
  message: string;
  pieces: number;
  sides: [number, number];
  gridRatio: number;
  pieceRatio: number;
}

interface JIGResults {
  baseDetails: string;
  baseNumPieces: number;
  up: {
    goodSizes: OptimalSize[];
    bestSizeMessage: string;
  };
  down: { goodSizes: OptimalSize[] };
  opinionBest: string;
  opinionBetter: string;
}

const getResults = async (width: number, height: number, numPieces: number) => {
  const res = await fetch(process.env.REACT_APP_BACKEND_BASE_URL + "/jig", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "omit",
    body: JSON.stringify({ width, height, pieces: numPieces }),
  });
  const json = (await res.json()) as JIGResults;
  return json;
};

function App() {
  const [width, setWidth] = useState<null | number>(0);
  const [height, setHeight] = useState<null | number>(0);
  const [numPieces, setNumPieces] = useState<null | number>(0);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<null | JIGResults>(null);

  const canSubmit = useMemo(() => !loading && width && height && numPieces, [
    loading,
    width,
    height,
    numPieces,
  ]);
  const submit = useCallback(async () => {
    if (canSubmit) {
      setLoading(true);
      const res = await getResults(
        width as number,
        height as number,
        numPieces as number
      );
      setLoading(false);
      setResults(res);
    }
  }, [canSubmit, width, height, numPieces]);

  return (
    <div
      style={{
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        width: "90%",
        margin: "auto",
      }}
    >
      <div style={{ fontSize: "48px", alignSelf: "center" }}>iJIG</div>
      <div style={{ fontSize: "16px", alignSelf: "center" }}>
        Internet-Enabled Jigsaw Inference Gizmo
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          gap: "15px",
          fontSize: "24px",
          alignItems: "center",
          justifyContent: "center",
          marginTop: "35px",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              gap: "5px",
              alignItems: "center",
              height: "50px",
            }}
          >
            <span style={{ width: "85px" }}>Width:</span>
            <input
              style={{ width: "100px", fontSize: "24px" }}
              min="0"
              value={width ?? ""}
              onChange={(e) => {
                setWidth(Number(e.target.value));
              }}
              onClick={() => {
                setWidth(null);
              }}
              type="number"
              onKeyPress={(e) => {
                if (e.key === "Enter" && canSubmit) {
                  submit();
                }
              }}
            />
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              gap: "5px",
              alignItems: "center",
              height: "50px",
            }}
          >
            <span style={{ width: "85px" }}>Height:</span>
            <input
              style={{ width: "100px", fontSize: "24px" }}
              min="0"
              value={height ?? ""}
              onChange={(e) => {
                setHeight(Number(e.target.value));
              }}
              type="number"
              onKeyPress={(e) => {
                if (e.key === "Enter" && canSubmit) {
                  submit();
                }
              }}
              onClick={() => {
                setHeight(null);
              }}
            />
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              gap: "5px",
              alignItems: "center",
              height: "50px",
            }}
          >
            <span style={{ width: "85px" }}>Pieces:</span>
            <input
              style={{ width: "100px", fontSize: "24px" }}
              min="0"
              value={numPieces ?? ""}
              onChange={(e) => {
                setNumPieces(Number(e.target.value));
              }}
              type="number"
              onKeyPress={(e) => {
                if (e.key === "Enter" && canSubmit) {
                  submit();
                }
              }}
              onClick={() => {
                setNumPieces(null);
              }}
            />
          </div>
        </div>
        <button
          disabled={width === 0 || height === 0 || numPieces === 0}
          onClick={submit}
          style={{ height: "50px", borderRadius: "10px", width: "100px" }}
        >
          Solve
        </button>
      </div>
      {!loading && results !== null ? (
        <ResultsDisplay results={results} />
      ) : null}
    </div>
  );
}

const ResultsDisplay = ({ results }: { results: JIGResults }) => {
  return (
    <div style={{ width: "100%", margin: "auto", marginTop: "15px" }}>
      <ul
        style={{
          fontSize: "24px",
        }}
      >
        <li>{results.baseDetails}</li>
        <li>{results.up.bestSizeMessage}</li>
        <li>{results.opinionBest}</li>
        <li>{results.opinionBetter}</li>
      </ul>
      <div style={{ fontSize: "18px" }}>Best Close Sizes:</div>
      <table
        style={{
          width: "100%",
          margin: "auto",
          maxWidth: "400px",
          textAlign: "right",
        }}
      >
        <tr>
          <th>Pieces</th>
          <th>Size</th>
          <th>Grid Ratio</th>
          <th>Piece Ratio</th>
        </tr>
        {[...results.up.goodSizes, ...results.down.goodSizes].map((m, idx) => (
          <tr key={idx}>
            <td>{m.pieces}</td>
            <td>
              {m.sides[0]} X {m.sides[1]}
            </td>
            <td>{m.gridRatio}</td>
            <td>{m.pieceRatio}</td>
          </tr>
        ))}
      </table>
    </div>
  );
};

export default App;
