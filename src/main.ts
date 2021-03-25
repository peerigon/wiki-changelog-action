import * as core from "@actions/core";
import * as github from "@actions/github";
import axios from "axios";

async function run(): Promise<void> {
  try {
    const hookUrl = core.getInput("mattermost-hook-url");
    const repoToken = core.getInput("repo-token");
    const headers = {Authorization: `Bearer ${repoToken}`};

    const {payload} = github.context;
    const compareUrlRaw = payload.repository?.compare_url;

    const commitsUrl = payload.repository?.commits_url.replace(
      "{/sha}",
      "?per_page=2",
    );
    const {data: commits} = await axios.get<Array<any>>(commitsUrl, {
      headers,
    });

    if (commits.length >= 2) {
      const compareUrl = compareUrlRaw
        .replace("{base}", commits[1].sha)
        .replace("{head}", commits[0].sha);

      const {data: compareData} = await axios.get(compareUrl, {
        headers,
      });

      if (Array.isArray(payload.pages)) {
        const pagesUpdated = payload.pages.map(page => {
          return `[${page.title}](${page.html_url}) was updated by ${payload.sender?.login}! see the [diff](${compareData.html_url})`;
        });

        axios.post(hookUrl, {
          text: `The Wiki was updated :tada: \n${pagesUpdated.join("\n*")}`,
        });
      }
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
