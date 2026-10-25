import { afterAll, beforeAll, expect, test } from "bun:test";
import assert from "node:assert/strict";
import { mkdir, rm } from "node:fs/promises";
import manifest from "../../package.json";
import { getPackageExportTargets, getInstalledRuntimeDependencies, runConsumerCommand } from "./helpers";
import {
  fixture_chartServerRenderSource,
  fixture_otpServerRenderSource,
  fixture_packageRenderSource,
  fixture_questionnaireServerRenderSource,
  fixture_scrollerServerRenderSource,
  fixture_packageTypeConsumerSource,
  fixture_featureConsumers,
  fixture_optionalPeerNames,
  fixture_featureTypeExports,
  fixture_featureTypePaths,
} from "./fixtures";

const consumerRoot = `${process.cwd()}/.tmp/optional-consumers/${Date.now()}`;
const dependencyVersions: Record<string, string> = manifest.devDependencies;

beforeAll(async () => {
  await mkdir(consumerRoot, { recursive: true });
  await runConsumerCommand(["npm", "pack", "--ignore-scripts", "--pack-destination", consumerRoot], process.cwd());
  await Bun.write(
    `${consumerRoot}/package.tgz`,
    Bun.file(`${consumerRoot}/alexgorbatchev-shadcn-${manifest.version}.tgz`),
  );
}, 30_000);

afterAll(async () => {
  await rm(consumerRoot, { recursive: true, force: true });
}, 30_000);

test("release tarball includes the current README", async () => {
  const archive = new Bun.Archive(await Bun.file(`${consumerRoot}/package.tgz`).bytes());
  const files = await archive.files();
  const readme = files.get("package/README.md");
  expect(readme).toBeDefined();
  assert(readme);
  expect(await readme.text()).toBe(await Bun.file("README.md").text());
});

test("release tarball includes the LLM index and every linked reference", async () => {
  const archive = new Bun.Archive(await Bun.file(`${consumerRoot}/package.tgz`).bytes());
  const files = await archive.files();
  const index = files.get("package/llms.txt");
  assert(index);
  expect(await index.text()).toBe(await Bun.file("llms.txt").text());
  const links = [...(await index.text()).matchAll(/\]\(\.\/([^)]*)\)/g)];
  expect(links.length).toBeGreaterThan(1);
  for (const link of links) {
    const page = files.get(`package/${link[1]}`);
    assert(page, `Missing packed LLM page: ${link[1]}`);
    expect(await page.text()).toBe(await Bun.file(link[1]).text());
  }
});

test("every packed public entry resolves to an included artifact", async () => {
  const archive = new Bun.Archive(await Bun.file(`${consumerRoot}/package.tgz`).bytes());
  const files = await archive.files();
  const packedManifestFile = files.get("package/package.json");
  assert(packedManifestFile);
  const packedManifest: typeof manifest = JSON.parse(await packedManifestFile.text());
  for (const target of getPackageExportTargets(packedManifest.exports)) {
    expect(files.has(`package/${target.replace(/^\.\//, "")}`), `Missing packed public artifact: ${target}`).toBe(true);
  }
});

test("packed assistant stylesheet resolves its companion without optional peers", async () => {
  const archive = new Bun.Archive(await Bun.file(`${consumerRoot}/package.tgz`).bytes());
  const files = await archive.files();
  const cwd = `${consumerRoot}/assistant-styles`;
  await Promise.all(
    [...files]
      .filter(([path]) => path.startsWith("package/dist/") && path.endsWith(".css"))
      .map(([path, file]) => Bun.write(`${cwd}/${path}`, file)),
  );
  const build = await Bun.build({
    entrypoints: [`${cwd}/package/dist/assistant-ui.css`],
    outdir: `${cwd}/out`,
    target: "browser",
    plugins: [
      {
        name: "enforce-stylesheet-isolation",
        setup(builder) {
          builder.onLoad({ filter: /./ }, (args) => {
            assert(args.path.startsWith(`${cwd}/`), `Resolved outside packed stylesheet: ${args.path}`);
            return undefined;
          });
        },
      },
    ],
  });
  expect(build.logs).toEqual([]);
  expect(build.success).toBe(true);
  expect(build.outputs.some((output) => output.path.endsWith(".css") && output.size > 0)).toBe(true);
});

test.each(fixture_featureConsumers)(
  "packed %s consumer builds and renders with only its required peers",
  async (name, peers, source, expected) => {
    const cwd = `${consumerRoot}/${name}`;
    await mkdir(cwd, { recursive: true });
    await Bun.write(
      `${cwd}/package.json`,
      JSON.stringify({
        private: true,
        type: "module",
        dependencies: {
          "@alexgorbatchev/shadcn": "../package.tgz",
          ...manifest.peerDependencies,
          ...Object.fromEntries(fixture_optionalPeerNames.map((peer) => [peer, undefined])),
          ...Object.fromEntries(peers.map((peer) => [peer, dependencyVersions[peer]])),
        },
        devDependencies: {
          "@types/react": manifest.devDependencies["@types/react"],
          "@types/react-dom": manifest.devDependencies["@types/react-dom"],
        },
      }),
    );
    await runConsumerCommand([process.execPath, "install", "--ignore-scripts"], cwd);
    const installedRuntimeDependencies = await getInstalledRuntimeDependencies(cwd, peers);
    for (const peer of fixture_optionalPeerNames.filter((peer) => !installedRuntimeDependencies.has(peer))) {
      expect(await Bun.file(`${cwd}/node_modules/${peer}/package.json`).exists(), peer).toBe(false);
    }
    await Bun.write(`${cwd}/consumer.tsx`, source);
    const build = await Bun.build({
      entrypoints: [`${cwd}/consumer.tsx`],
      target: "bun",
      outdir: `${cwd}/out`,
      plugins: [
        {
          name: "enforce-consumer-isolation",
          setup(builder) {
            builder.onLoad({ filter: /./ }, (args) => {
              assert(args.path.startsWith(`${cwd}/`), `Resolved outside packed consumer: ${args.path}`);
              return undefined;
            });
          },
        },
      ],
    });
    expect(build.logs).toEqual([]);
    expect(build.success).toBe(true);
    if (name === "event-calendar") {
      await Bun.write(`${cwd}/calendar.css`, '@import "@alexgorbatchev/shadcn/event-calendar.css";');
      const styles = await Bun.build({
        entrypoints: [`${cwd}/calendar.css`],
        outdir: `${cwd}/styles`,
        target: "browser",
      });
      expect(styles.success, styles.logs.map((log) => log.message).join("\n")).toBe(true);
      expect(styles.outputs.some((output) => output.path.endsWith(".css") && output.size > 0)).toBe(true);
    }
    const stdout = await runConsumerCommand([process.execPath, `${cwd}/out/consumer.js`], cwd);
    expect(stdout.trim()).toBe(expected);

    await Bun.write(
      `${cwd}/types.tsx`,
      fixture_packageTypeConsumerSource +
        `\nexport { ${fixture_featureTypeExports[name]} } from "${fixture_featureTypePaths[name] ?? `@alexgorbatchev/shadcn/${name}`}";\n`,
    );
    await Bun.write(
      `${cwd}/tsconfig.json`,
      JSON.stringify({
        compilerOptions: {
          strict: true,
          noEmit: true,
          skipLibCheck: false,
          target: "ESNext",
          module: "NodeNext",
          moduleResolution: "NodeNext",
          jsx: "react-jsx",
          types: ["react"],
          traceResolution: true,
        },
        include: ["types.tsx"],
      }),
    );
    const trace = await runConsumerCommand(
      [process.execPath, `${process.cwd()}/node_modules/typescript/bin/tsc6`, "-p", `${cwd}/tsconfig.json`],
      cwd,
    );
    expect(
      trace
        .split("\n")
        .filter((line) => line.includes("successfully resolved to") && line.includes(`${process.cwd()}/node_modules/`)),
    ).toEqual([]);
  },
  60_000,
);

test("packed font stylesheet emits usable font assets", async () => {
  const build = await Bun.build({
    entrypoints: [`${consumerRoot}/fonts/node_modules/@alexgorbatchev/shadcn/dist/fonts.css`],
    target: "browser",
    outdir: `${consumerRoot}/fonts/out`,
  });
  expect(build.logs).toEqual([]);
  expect(build.success).toBe(true);
  const stylesheet = build.outputs.find((output) => output.path.endsWith(".css"));
  expect(stylesheet).toBeDefined();
  assert(stylesheet);
  const assets = [...(await stylesheet.text()).matchAll(/data:font\/woff2;base64,([^"\s)]+)/g)];
  expect(assets.length).toBeGreaterThan(0);
  for (const asset of assets) {
    expect(Buffer.from(asset[1] ?? "", "base64").byteLength).toBeGreaterThan(0);
  }
});

test.each([
  ["Bundler", "ESNext"],
  ["NodeNext", "NodeNext"],
])(
  "built declarations compile in a strict %s consumer",
  async (resolution, module) => {
    const consumerPath = `.tmp/package-types/${resolution}`;
    await mkdir(consumerPath, { recursive: true });
    await Bun.write(`${consumerPath}/consumer.tsx`, fixture_packageTypeConsumerSource);
    await Bun.write(
      `${consumerPath}/tsconfig.json`,
      JSON.stringify({
        compilerOptions: {
          strict: true,
          noEmit: true,
          skipLibCheck: false,
          target: "ESNext",
          module,
          moduleResolution: resolution,
          jsx: "react-jsx",
          types: ["react"],
        },
        include: ["consumer.tsx"],
      }),
    );
    const child = Bun.spawn(
      [process.execPath, "node_modules/typescript/bin/tsc6", "--project", `${consumerPath}/tsconfig.json`],
      { stdout: "pipe", stderr: "pipe" },
    );
    const [stdout, stderr, exitCode] = await Promise.all([
      new Response(child.stdout).text(),
      new Response(child.stderr).text(),
      child.exited,
    ]);
    expect({ stdout, stderr, exitCode }).toEqual({ stdout: "", stderr: "", exitCode: 0 });
  },
  30_000,
);

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
