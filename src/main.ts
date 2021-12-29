import * as core from "@actions/core";
import * as github from "@actions/github";
import axios from "axios";

async function run(): Promise<void> {
  try {
    const hookUrl = core.getInput("mattermost-hook-url");
    const repoToken = core.getInput("repo-token");
    const headers = {Authorization: `Bearer ${repoToken}`};

    const {payload} = github.context;
    const compareUrlRaw = payload.repository?.compare_url.replace(
      payload.repository.name,
      `${payload.repository.name}.wiki`,
    );

    const commitsUrl = payload.repository?.commits_url
      .replace(payload.repository.name, `${payload.repository.name}.wiki`)
      .replace("{/sha}", "?per_page=2");

    const {data: commits} = await axios.get<Array<any>>(commitsUrl, {
      headers,
    });

    core.debug(`Commits URL: ${commitsUrl}`);
    core.debug(`Commits: \n${commits.join("\n ")}`);

    if (commits.length >= 2) {
      const compareUrl = compareUrlRaw
        .replace("{base}", commits[1].sha)
        .replace("{head}", commits[0].sha);

      const {data: compareData} = await axios.get(compareUrl, {
        headers,
      });

      core.debug(`compareUrl: ${commitsUrl}`);
      core.debug(`compareData: ${compareData.html_url}`);
    }

    if (Array.isArray(payload.pages)) {
      const pagesUpdated = payload.pages.map(page => {
        return `[${page.title}](${page.html_url}) was updated by [${
          payload.sender?.login
        }](${payload.sender?.html_url})! ${page.summary ?? ""}`;
      });

      axios.post(hookUrl, {
        text: `:tada: The Wiki was updated :tada: \n${pagesUpdated.join(
          "\n*",
        )}`,
      });
    }
  } catch (error) {
    core.setFailed((error as Error).message);
  }
}

run();
