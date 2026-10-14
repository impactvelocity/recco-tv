# Friction log

Every time a tool, SDK or document gets in the way, add an entry in this format. Entries can add up to 10% to the score.

```
### <short title>
- Tool / doc:
- Task attempted:
- Steps taken:
- Expected:
- Actual:
- Severity: blocker | major | minor
- Workaround:
- Suggestion:
```

---

### Builder Tools MCP docs disagree on the package name and Node version
- Tool / doc: Amazon Devices Builder Tools MCP setup page, `docs/vega/latest/mcp-server.html` vs `docs/vega/0.22/mcp-server.html`
- Task attempted: 0.2, finding the right MCP package to install before scaffolding the TV app.
- Steps taken: Searched for the MCP setup page. Opened the "latest" and the 0.22 versions.
- Expected: The "latest" page matches the newest release.
- Actual: The "latest" page still uses the old "Vega DevTools" name and config entry. The 0.22 page uses the new "Builder Tools" name. The "latest" page lists Node 20 or 22 only. The dev machine has Node 24.
- Severity: minor
- Workaround: Follow the package's own npm README for the name. Switch to Node 22 for Vega work. (Confirm both during 0.2 and update this entry.)
- Suggestion: Point "latest" at the newest versioned page. State the supported Node versions on the npm README.

### Metro fails with EMFILE on a fresh Mac without Watchman
- Tool / doc: Vega SDK 0.24 `helloWorld-rn72` template, `npm run build:debug` (Metro 0.76)
- Task attempted: 0.2, first build of the generated app.
- Steps taken: `vega project generate -t helloWorld-rn72`, `npm install`, `npm run build:debug` on macOS (Apple Silicon, Node 22).
- Expected: The template builds out of the box.
- Actual: `Error: EMFILE: too many open files, watch` from `metro-file-map` NodeWatcher. Raising `ulimit -n` did not help (it was already 1,048,576).
- Severity: major (first build fails with no hint at the cause)
- Workaround: `brew install watchman`, then rebuild.
- Suggestion: List Watchman as a macOS prerequisite in the SDK install doc, or have `vega project doctor` / the installer check for it.

### No way to see the virtual device's screen or JS console from the CLI
- Tool / doc: Vega CLI 1.4.4, Vega Virtual Device
- Task attempted: 0.3 / 0.4, checking the fetch and WebSocket results without watching the window.
- Steps taken: Looked for a screenshot command under `vega device` and `vega virtual-device`. Streamed `vega device start-log-stream`: the app's `console.log` lines did not appear (only system logs). The VVD runs as a bare `vega-virtual-device` process, so macOS automation tools do not see it as an app.
- Expected: A `vega device screenshot` command, and `console.log` from the app in the device log stream.
- Actual: Neither exists for a debug build without Metro running.
- Severity: minor
- Workaround: Had the app POST its results back to a dev server on the host.
- Suggestion: Add `vega device screenshot`, and forward JS console output to the device log.

### No guidance on how the virtual device reaches the host machine
- Tool / doc: Vega Virtual Device docs
- Task attempted: 0.2, pointing the app at a local API on the Mac.
- Steps taken: Searched the VVD docs and the 0.24 release notes for "localhost" or host networking. Found nothing, so tried four addresses from the app.
- Expected: A documented host address, like Android's `10.0.2.2`.
- Actual: Undocumented. `10.0.2.2` and the Mac's LAN IP work; `localhost` does not.
- Severity: minor
- Workaround: Use `http://10.0.2.2:<port>`.
- Suggestion: State the host alias on the VVD page, next to `vega device start-port-forwarding`.

### Builder Tools skills need MCP tools that a running session does not have
- Tool / doc: Amazon Devices Builder Tools (`init-context`, Claude Code skills)
- Task attempted: 2.1, reading the navigation and focus guides the skills point to.
- Steps taken: Ran `init-context` for Claude Code mid-session. The skills appeared at once, but each skill only says "use `read_document` to read react_native_for_vega_navigation.md", and the MCP tools only load in a new session.
- Expected: The skills carry the key content, or the docs are readable without the MCP server.
- Actual: The guides live in a SQLite file inside the npm package (`dist/assets/vega-developer-context.db`). Read them with `sqlite3` instead. The two guides the skills name (`react_native_for_vega_navigation.md`, `react_native_for_vega_tv_app_focus_management.md`) are not in that file.
- Severity: minor
- Workaround: Queried the bundled database directly; used `vega_focus_management_api.md`, `vega_supported_libraries_and_services.md` and `vega_remote_control_buttons.md`.
- Suggestion: Put the essentials (package names, focus restore pattern) in the skill text, and ship every document a skill names.

### Docs say TVFocusGuideView needs `@ts-expect-error`; on SDK 0.24 it breaks the build
- Tool / doc: Vega focus management API doc (bundled with Builder Tools)
- Task attempted: 2.3, wrapping each row in `TVFocusGuideView`.
- Steps taken: Added `{/* @ts-expect-error */}` before `TVFocusGuideView` as the doc's troubleshooting table suggests.
- Expected: Type check passes.
- Actual: `TS2578: Unused '@ts-expect-error' directive`. The children typing is already fixed in this SDK.
- Severity: minor
- Workaround: Removed the directive.
- Suggestion: Note which SDK versions need it.

### Voice-navigation props are documented but not typed
- Tool / doc: Vega on-screen navigation API (`ariaPosInSet`, `alexaEntityType`, `keplerAltLabels`)
- Task attempted: 2.3, making cards voice-selectable ("Alexa, select <title>").
- Steps taken: Added `ariaPosInSet` and `alexaEntityType` to a `Pressable`, as in the doc's example.
- Expected: Type check passes, as the doc says the props are available on standard components on Vega.
- Actual: `TS2322: Property 'ariaPosInSet' does not exist on type PressableProps`.
- Severity: minor
- Workaround: Kept `aria-label` only.
- Suggestion: Add the Vega-specific accessibility props to the `@amazon-devices/react-native-kepler` type definitions.

### No way to screenshot the Vega Virtual Device
- Tool / doc: `vega exec vda` screenshooter (Builder Tools MCP doc `vega_cli_commands_exec_vda_gwsi_tool_screenshooter.md`)
- Task attempted: 5.2, checking the new design on the virtual device.
- Steps taken: Read the screenshot doc before capturing.
- Expected: A screenshot of the running app, to compare with the design.
- Actual: The doc says the tool only works on physical devices. The VVD window is not an app bundle, so desktop automation cannot target it either.
- Severity: moderate (visual QA needs a person at the screen, or a Fire TV Stick)
- Workaround: Checked behaviour through the app's debug focus log while pressing remote keys with `pnpm remote`. The look still needs a person.
- Suggestion: Support screenshots on the virtual device, as the Android emulator does.

### Reinstalling the app wipes its storage
- Tool / doc: `vega run-app <vpkg>`
- Task attempted: 5.2, reinstalling after a fix.
- Steps taken: Ran `vega run-app` again with the new build.
- Expected: App data kept across an upgrade install, as on Fire OS.
- Actual: AsyncStorage was empty after the reinstall, so the TV lost its device token and went back to pairing. Remote keys meant for the inbox landed on the pairing screen, and Back closed the app.
- Severity: minor
- Workaround: `pnpm pair-tv` after each reinstall, or `vega device launch-app` when only relaunching.
- Suggestion: Say in the `run-app` help whether it keeps app data.

### Playing a bundled video file is undocumented
- Tool / doc: `@amazon-devices/react-native-w3cmedia` (Builder Tools MCP `react_native_for_vega_media_player.md`, Vega media player docs)
- Task attempted: 5.2, looping background videos.
- Steps taken: Read the media player and architecture docs, then searched the docs and the developer forum.
- Expected: A documented way to play an MP4 shipped inside the app, as with images.
- Actual: The docs only show remote URLs. The forum gives three conflicting answers: `asset://`, `require()` with `resolveAssetSource` (rejected as insecure `http://localhost` in debug), and finally `/pkg/assets/raw/<file>`, which Amazon staff called a stopgap until an asset resolver API arrives.
- Severity: moderate
- Workaround: Put the MP4s in `apps/tv/assets/raw/` and set `src = '/pkg/assets/raw/<file>.mp4'`. Plays and loops on the Vega Virtual Device.
- Suggestion: Document local file playback in the media player guide, and ship the asset resolver API.

### OMDb search matches whole words, so "and" misses "&"
- Tool / doc: OMDb API (`s=` and `t=` endpoints)
- Task attempted: Texting "Dorah said we shoud watch trains planes and automobiles because its for perfect for thanksgiving".
- Steps taken: The agent (Claude Haiku 5.5) fixed the title to "Planes, Trains and Automobiles" and called `find_titles` twice.
- Expected: Planes, Trains & Automobiles (1987, tt0093748).
- Actual: `s=` returned only clip compilations such as "Con Air (1997) - Planes! Trains! And Automobiles!". Because the search was not empty, the `t=` fallback never ran. `t=` also misses when given "and". The card was saved as an unsorted note.
- Severity: moderate
- Workaround: `packages/sources/src/title-match.ts`: try "&"/"and" and plain spellings until one finds the title, then rank results by word overlap. The prompt now tells the agent to retry with the official title, up to three tries per show.
- Suggestion: Normalise "&"/"and" and punctuation in OMDb search.
