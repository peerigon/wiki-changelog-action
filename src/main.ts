import * as core from "@actions/core";
import * as github from "@actions/github";
import axios from "axios";

async function run(): Promise<void> {
  core.debug("start of action");
  core.debug(`commit that triggered the action: ${github.context.sha}`);

  try {
    const hookUrl = core.getInput("mattermost-hook-url");
    // const repoToken = core.getInput("repo-token");

    // const octokit = github.getOctokit(repoToken);
    // const {data: commits} = await octokit.rest.repos.listCommits({
    //   owner: "peerigon",
    //   repo: "Organization.wiki",
    //   per_page: 2,
    // });

    // core.debug(JSON.stringify(commits, null, 2));

    // const headers = {Aguthorization: `Bearer ${repoToken}`};

    const {payload} = github.context;

    core.debug(
      `compare url: ${payload.repository?.compare_url
        .replace("{base}", "HEAD^")
        .replace("{head}", "HEAD")}`,
    );

    // if (commits.length >= 2) {
    //   const compareUrl = compareUrlRaw
    //     .replace("{base}", commits[1].sha)
    //     .replace("{head}", commits[0].sha);

    //   const {data: compareData} = await axios.get(compareUrl, {
    //     headers,
    //   });

    //   core.debug(`compareUrl: ${commitsUrl}`);
    //   core.debug(`compareData: ${compareData.html_url}`);
    // }

    if (Array.isArray(payload.pages)) {
      core.debug(
        `page compare url: ${payload.pages[0].html_url}/_compare/${payload.pages[0].sha}`,
      );
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
