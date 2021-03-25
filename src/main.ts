import * as core from "@actions/core";
import * as github from "@actions/github";
import axios from "axios";

async function run(): Promise<void> {
  try {
    const hookUrl = core.getInput("mattermost-hook-url");
    core.debug(`HookUrl: ${hookUrl}`);

    const {payload} = github.context;

    if (payload !== undefined) {
      core.debug(`Payload: ${JSON.stringify(payload, null, 4)}`);
      const commitsUrl = payload.repository?.commits_url.replace("{/sha}", "");
      core.debug(`commits url ${commitsUrl}`);

      if (commitsUrl !== undefined) {
        const commits = await axios.get(commitsUrl);
        core.debug(`commits: ${JSON.stringify(commits, null, 4)}`);
      }
    }

    // axios.post(hookUrl, {text: "test from action"});
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();

export default "test";
