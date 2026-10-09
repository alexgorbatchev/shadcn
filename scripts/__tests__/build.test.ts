import { expect, test } from "bun:test";
import {
  fixture_chartServerRenderSource,
  fixture_otpServerRenderSource,
  fixture_packageRenderSource,
  fixture_questionnaireServerRenderSource,
  fixture_scrollerServerRenderSource,
} from "./fixtures";

test.each(["development", "production"])(
  "built OTP inputs initialize saved values without React warnings in %s",
  async (mode) => {
    const child = Bun.spawn([process.execPath, "--eval", fixture_otpServerRenderSource], {
      cwd: process.cwd(),
      env: { ...process.env, NODE_ENV: mode },
      stdout: "pipe",
      stderr: "pipe",
    });
    const [stdout, stderr, exitCode] = await Promise.all([
      new Response(child.stdout).text(),
      new Response(child.stderr).text(),
      child.exited,
    ]);
    expect(stderr).toBe("");
    expect(exitCode).toBe(0);
    expect(JSON.parse(stdout)).toEqual([
      { label: "Saved code", value: "123456", name: "code", maxLength: "6" },
      { label: "Empty code", value: "", name: "code", maxLength: "6" },
      { label: "Controlled code", value: "654321", name: "code", maxLength: "6" },
    ]);
  },
);

test.each(["development", "production"])(
  "built scrollers server-render pending opening positions in %s",
  async (mode) => {
    const child = Bun.spawn([process.execPath, "--eval", fixture_scrollerServerRenderSource], {
      cwd: process.cwd(),
      env: { ...process.env, NODE_ENV: mode },
      stdout: "pipe",
      stderr: "pipe",
    });
    const [stdout, stderr, exitCode] = await Promise.all([
      new Response(child.stdout).text(),
      new Response(child.stderr).text(),
      child.exited,
    ]);
    expect(stderr).toBe("");
    expect(exitCode).toBe(0);
    expect(JSON.parse(stdout)).toEqual({
      hasWindow: false,
      transcripts: [
        { position: "start", rootPending: false, viewport: { label: "Messages", tabIndex: "0", pending: false } },
        { position: "end", rootPending: true, viewport: { label: "Messages", tabIndex: "0", pending: true } },
        { position: "last-anchor", rootPending: true, viewport: { label: "Messages", tabIndex: "0", pending: true } },
      ].map((transcript) => ({
        ...transcript,
        content: { relevant: "additions", busy: "true" },
        items: [
          { id: "question", anchor: "true" },
          { id: "answer", anchor: "false" },
        ],
        controls: [{ type: "button", inert: true, tabIndex: "-1", active: "false" }],
      })),
    });
  },
);

test.each(["development", "production"])("built package renders native buttons with React in %s", async (mode) => {
  const child = Bun.spawn([process.execPath, "--eval", fixture_packageRenderSource], {
    cwd: process.cwd(),
    env: { ...process.env, NODE_ENV: mode },
    stdout: "pipe",
    stderr: "pipe",
  });
  const [stdout, stderr, exitCode] = await Promise.all([
    new Response(child.stdout).text(),
    new Response(child.stderr).text(),
    child.exited,
  ]);
  expect(stderr).toBe("");
  expect(exitCode).toBe(0);
  expect(JSON.parse(stdout)).toEqual([
    { type: "button", disabled: false, text: "Save" },
    { type: "button", disabled: true, text: "Archive" },
  ]);
});

test.each(["development", "production"])(
  "built charts render on the server without browser globals in %s",
  async (mode) => {
    const child = Bun.spawn([process.execPath, "--eval", fixture_chartServerRenderSource], {
      cwd: process.cwd(),
      env: { ...process.env, NODE_ENV: mode },
      stdout: "pipe",
      stderr: "pipe",
    });
    const [stdout, stderr, exitCode] = await Promise.all([
      new Response(child.stdout).text(),
      new Response(child.stderr).text(),
      child.exited,
    ]);
    expect(stderr).toBe("");
    expect(exitCode).toBe(0);
    expect(JSON.parse(stdout)).toEqual({
      hasBrowserCSS: false,
      charts: [{ id: "chart-visitors: daily[α]", label: "Monthly visitors" }],
      styleCount: 2,
    });
  },
);

test.each(["development", "production"])(
  "built questionnaires server-render saved navigation and shortcuts in %s",
  async (mode) => {
    const child = Bun.spawn([process.execPath, "--eval", fixture_questionnaireServerRenderSource], {
      cwd: process.cwd(),
      env: { ...process.env, NODE_ENV: mode },
      stdout: "pipe",
      stderr: "pipe",
    });
    const [stdout, stderr, exitCode] = await Promise.all([
      new Response(child.stdout).text(),
      new Response(child.stderr).text(),
      child.exited,
    ]);
    expect(stderr).toBe("");
    expect(exitCode).toBe(0);
    expect(JSON.parse(stdout)).toEqual({
      hasWindow: false,
      items: [
        { active: false, hidden: true, inert: true, disabled: false },
        { active: false, hidden: true, inert: true, disabled: true },
        { active: true, hidden: false, inert: false, disabled: false },
      ],
      choices: [
        { value: "build", disabled: false, shortcut: "1" },
        { value: "private", disabled: true, shortcut: "1" },
        { value: "unavailable", disabled: true, shortcut: null },
        { value: "tests", disabled: false, shortcut: "1" },
      ],
      actions: [
        { type: "button", hidden: false, inert: false, text: "Previous" },
        { type: "button", hidden: true, inert: true, text: "Next" },
        { type: "submit", hidden: false, inert: false, text: "Submit" },
      ],
      progress: { current: "2", total: "2", text: "Question 2 of 2" },
    });
  },
);
