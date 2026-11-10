import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

// Compile the pure TypeScript helper with the project's installed compiler so
// these tests also run on the Node 20 version used by CI.
async function importHelper(filename) {
  const source = await readFile(
    new URL(
      `../apps/frontend/src/components/react-flow/${filename}.ts`,
      import.meta.url,
    ),
    "utf8",
  );
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ESNext,
    },
  });
  return import(
    `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`
  );
}
const { addStepAtPosition, parseFlowStep } = await importHelper("Flow-Drop");
const { alignNodesVertically, addNodeBelow } =
  await importHelper("Flow-Helpers");

const position = { x: 370, y: -120 };
const node = (id, action = true, configured = true) => ({
  id,
  type: "customNode",
  position: { x: 0, y: 0 },
  data: {
    ...(configured ? { id: `integration-${id}` } : {}),
    name: id,
    image: "",
    action,
    configured,
    metadata: { subject: "Keep this configuration" },
  },
});
const edge = (source, target) => ({
  id: `${source}-${target}`,
  source,
  target,
  type: "buttonEdge",
});
const add = (nodes, edges, kind = "action", plan = "free") =>
  addStepAtPosition(nodes, edges, kind, position, plan, "new-step");

test("only palette step types are accepted", () => {
  assert.equal(parseFlowStep("action"), "action");
  assert.equal(parseFlowStep("trigger"), "trigger");
  for (const value of ["", "file", "text/plain", '{"kind":"action"}']) {
    assert.equal(parseFlowStep(value), null);
  }
});

test("dropping into a new workflow reuses its empty action without losing connections", () => {
  const nodes = [node("trigger", false), node("empty", true, false)];
  const edges = [edge("trigger", "empty")];
  const result = add(nodes, edges);
  assert.equal(result.nodeId, "empty");
  assert.equal(result.nodes.length, 2);
  assert.deepEqual(result.nodes[1].position, position);
  assert.equal(result.nodes[0], nodes[0]);
  assert.equal(result.edges, edges);
  assert.deepEqual(nodes[1].position, { x: 0, y: 0 });
});

test("a new action follows the connected tail and preserves configuration and drop coordinates", () => {
  const trigger = node("trigger", false);
  const first = node("first");
  const second = node("second");
  const edges = [edge("trigger", "first"), edge("first", "second")];
  const result = add([trigger, second, first], edges);
  assert.deepEqual(
    result.nodes.map((n) => n.id),
    ["trigger", "first", "second", "new-step"],
  );
  assert.equal(result.nodes[1], first);
  assert.equal(result.nodes[2], second);
  assert.deepEqual(result.nodes[3].position, position);
  assert.equal(result.nodes[3].data.configured, false);
  assert.equal(result.nodes[3].data.action, true);
  assert.equal(result.edges.at(-1).source, "second");
  assert.equal(result.edges.at(-1).target, "new-step");
  assert.equal(edges.length, 2);
});

test("only one trigger is allowed, and the initial empty trigger can be reused", () => {
  assert.match(
    add([node("trigger", false)], [], "trigger").error,
    /one trigger/,
  );
  const result = add([node("trigger", false, false)], [], "trigger");
  assert.equal(result.nodeId, "trigger");
  assert.equal(result.nodes.length, 1);
  assert.deepEqual(result.nodes[0].position, position);
});

test("an empty canvas accepts a trigger but requires it before actions", () => {
  assert.match(add([], []).error, /Add a trigger/);
  const result = add([], [], "trigger");
  assert.equal(result.nodes.length, 1);
  assert.equal(result.nodes[0].data.action, false);
  assert.deepEqual(result.edges, []);
});

test("free plans stop at three actions while pro plans can add more", () => {
  const nodes = [node("trigger", false), node("a"), node("b"), node("c")];
  const edges = [edge("trigger", "a"), edge("a", "b"), edge("b", "c")];
  assert.match(add(nodes, edges).error, /3 actions/);
  assert.equal(add(nodes, edges, "action", "pro").nodes.length, 5);
  nodes[3] = node("c", true, false);
  assert.equal(add(nodes, edges).nodeId, "c");
});

test("disconnected, branching, or cyclic workflows are not silently rewired", () => {
  const nodes = [node("trigger", false), node("a"), node("b")];
  for (const edges of [
    [edge("trigger", "a")],
    [edge("trigger", "a"), edge("trigger", "b")],
    [edge("trigger", "a"), edge("a", "b"), edge("b", "a")],
    [edge("trigger", "missing"), edge("a", "b")],
  ]) {
    assert.match(add(nodes, edges).error, /single sequence/);
  }
});

test("aligning freely positioned nodes preserves execution order", async () => {
  let nodes = [node("trigger", false), node("first"), node("last")];
  nodes[0].position.y = 500;
  nodes[1].position.y = -200;
  nodes[2].position.y = -400;
  await new Promise((resolve) => {
    alignNodesVertically(
      (update) => {
        nodes = update(nodes);
      },
      resolve,
      200,
    );
  });
  assert.deepEqual(
    nodes.map((n) => n.id),
    ["trigger", "first", "last"],
  );
  assert.deepEqual(
    nodes.map((n) => n.position),
    [
      { x: 0, y: 0 },
      { x: 0, y: 200 },
      { x: 0, y: 400 },
    ],
  );
});

test("the existing plus button inserts in sequence even after nodes were dragged", () => {
  let nodes = [node("trigger", false), node("first"), node("last")];
  nodes[2].position.y = -500;
  let edges = [edge("trigger", "first"), edge("first", "last")];
  const result = addNodeBelow(
    "free",
    "first",
    nodes,
    edges,
    (update) => {
      nodes = typeof update === "function" ? update(nodes) : update;
    },
    (update) => {
      edges = typeof update === "function" ? update(edges) : update;
    },
    200,
    alignNodesVertically,
  );
  assert.equal(result, 1);
  assert.equal(nodes[0].id, "trigger");
  assert.equal(nodes[1].id, "first");
  assert.equal(nodes[3].id, "last");
  assert.ok(
    edges.some((e) => e.source === "first" && e.target === nodes[2].id),
  );
  assert.ok(edges.some((e) => e.source === nodes[2].id && e.target === "last"));
  assert.deepEqual(
    nodes.map((n) => n.position.y),
    [0, 200, 400, 600],
  );
});
