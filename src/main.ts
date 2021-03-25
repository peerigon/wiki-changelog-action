import * as core from "@actions/core";
import * as github from "@actions/github";
import axios from "axios";

async function run(): Promise<void> {
  try {
    const hookUrl = core.getInput("mattermost-hook-url");
    const repoToken = core.getInput("repo-token");
    core.debug(`HookUrl: ${hookUrl}`);

    const {payload} = github.context;

    if (payload !== undefined) {
      const commitsUrl = payload.repository?.commits_url.replace("{/sha}", "");
      const compareUrlRaw = payload.repository?.compare_url;

      const {data: commits} = await axios.get<Array<any>>(commitsUrl, {
        headers: {Authorization: `Bearer ${repoToken}`},
      });

      const lastTwoCommits = commits.slice(0, 2);

      const compareUrl = compareUrlRaw
        .replace("{base}", lastTwoCommits[0].sha)
        .replace("{head}", lastTwoCommits[1].sha);

      core.debug(`Compare url: ${compareUrl}`);
    }

    // axios.post(hookUrl, {text: "test from action"});
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();

export default "test";
