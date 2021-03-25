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
      const commitsUrl = payload.repository?.commits_url.replace(
        "{/sha}",
        "?per_page=3",
      );
      const compareUrlRaw = payload.repository?.compare_url;

      const {data: commits} = await axios.get<Array<any>>(commitsUrl, {
        headers,
      });

      const compareUrl = compareUrlRaw
        .replace("{base}", commits[1].sha)
        .replace("{head}", commits[0].sha);

      const {data: compareData} = await axios.get(compareUrl, {
        headers,
      });

      core.debug(`Compare url: ${compareData.html_url}`);
    }

    // axios.post(hookUrl, {text: "test from action"});
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();

export default "test";
