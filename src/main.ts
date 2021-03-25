import * as core from "@actions/core";
import * as github from "@actions/github";
import axios from "axios";

async function run(): Promise<void> {
  try {
    const hookUrl = core.getInput("mattermost-hook-url");
    const repoToken = core.getInput("repo-token");
    const headers = {Authorization: `Bearer ${repoToken}`};
    core.debug(`HookUrl: ${hookUrl}`);

    const {payload} = github.context;

    if (payload !== undefined) {
      const commitsUrl = payload.repository?.commits_url.replace("{/sha}", "");
      const compareUrlRaw = payload.repository?.compare_url;

      const {data: commits} = await axios.get<Array<any>>(commitsUrl, {
        headers,
      });

      const lastTwoCommits = commits.slice(0, 2);

      const compareUrl = compareUrlRaw
        .replace("{base}", lastTwoCommits[0].sha)
        .replace("{head}", lastTwoCommits[1].sha);

      const {data: compareData} = await axios.get(compareUrl, {
        headers,
      });

      core.debug(`Compare url: ${compareData.diff_url}`);
    }

    // axios.post(hookUrl, {text: "test from action"});
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();

export default "test";
