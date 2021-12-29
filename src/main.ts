import * as core from "@actions/core";
import * as github from "@actions/github";
import axios from "axios";

async function run(): Promise<void> {
  core.debug("start of action");

  try {
    const hookUrl = core.getInput("mattermost-hook-url");
    const repoToken = core.getInput("repo-token");

    const octokit = github.getOctokit(repoToken);
    const test = await octokit.rest.repos.getCommit({
      owner: github.context.payload.sender?.login,
      ref: github.context.sha,
      repo: github.context.payload.repository?.name ?? "",
    });

    core.debug(JSON.stringify(test, null, 2));

    const headers = {Authorization: `Bearer ${repoToken}`};

    const {payload} = github.context;
    core.debug(`commit that triggered the action: ${github.context.sha}`);

    const compareUrlRaw = payload.repository?.compare_url.replace(
      payload.repository.name,
      `${payload.repository.name}.wiki`,
    );
    core.debug(`compare url raw: ${compareUrlRaw}`);

    const commitsUrl = payload.repository?.commits_url
      .replace(payload.repository.name, `${payload.repository.name}.wiki`)
      .replace("{/sha}", "?per_page=2");

    core.debug(`Commits URL: ${commitsUrl}`);

    const {data: commits} = await axios.get<Array<any>>(commitsUrl, {
      headers,
    });

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
